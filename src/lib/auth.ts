import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'civicconnect-super-secret-jwt-key-2026';
export const TOKEN_COOKIE_NAME = 'civic_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'CITIZEN' | 'AUTHORITY' | 'ADMIN';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getAuthenticatedUser(req?: NextRequest) {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify user still exists & active in DB
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, status: true, department: true },
  });

  if (!user || user.status === 'SUSPENDED') return null;

  return user;
}

export function authUnauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message } },
    { status: 401 }
  );
}

export function authForbiddenResponse(message = 'Forbidden: Insufficient privileges') {
  return NextResponse.json(
    { success: false, error: { code: 'FORBIDDEN', message } },
    { status: 403 }
  );
}
