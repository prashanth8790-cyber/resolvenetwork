import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authForbiddenResponse, authUnauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (user.role !== 'ADMIN') return authForbiddenResponse();

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        _count: {
          select: { reportedIssues: true, assignedIssues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: { users },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch users' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (user.role !== 'ADMIN') return authForbiddenResponse();

  try {
    const body = await req.json();
    const { userId, status, role, department } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'userId is required' } },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status; // ACTIVE, SUSPENDED
    if (role) updateData.role = role; // CITIZEN, AUTHORITY, ADMIN
    if (department !== undefined) updateData.department = department;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true, department: true },
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: 'User updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update user' } },
      { status: 500 }
    );
  }
}
