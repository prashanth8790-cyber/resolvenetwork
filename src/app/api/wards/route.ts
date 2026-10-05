import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authForbiddenResponse, authUnauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const wards = await db.ward.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: { wards } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch wards' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (user.role !== 'ADMIN') return authForbiddenResponse();

  try {
    const body = await req.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Ward name and code are required' } },
        { status: 400 }
      );
    }

    const ward = await db.ward.create({
      data: { name, code },
    });

    return NextResponse.json({ success: true, data: { ward }, message: 'Ward created successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Failed to create ward' } },
      { status: 500 }
    );
  }
}
