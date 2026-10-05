import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authForbiddenResponse, authUnauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);

    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        category: true,
        ward: true,
        reporter: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true, department: true } },
        images: true,
        statusHistory: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        supports: {
          select: { userId: true },
        },
      },
    });

    if (!issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } },
        { status: 404 }
      );
    }

    const supportCount = issue.supports.length;
    const hasSupported = user ? issue.supports.some((s) => s.userId === user.id) : false;

    return NextResponse.json({
      success: true,
      data: {
        issue: {
          ...issue,
          supports: undefined, // remove raw array from output
          supportCount,
          hasSupported,
        },
      },
    });
  } catch (error: any) {
    console.error('Fetch issue detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch issue details' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const { id } = await params;
    const issue = await db.issue.findUnique({ where: { id } });

    if (!issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } },
        { status: 404 }
      );
    }

    if (user.role !== 'ADMIN' && issue.reporterId !== user.id) {
      return authForbiddenResponse('You do not have permission to delete this issue');
    }

    await db.issue.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete issue' } },
      { status: 500 }
    );
  }
}
