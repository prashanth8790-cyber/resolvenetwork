import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth';
import { calculateIssuePriority } from '@/lib/services/priority';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const { id } = await params;

    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        _count: { select: { supports: true } },
      },
    });

    if (!issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } },
        { status: 404 }
      );
    }

    const existingSupport = await db.issueSupport.findUnique({
      where: {
        issueId_userId: {
          issueId: id,
          userId: user.id,
        },
      },
    });

    let hasSupported = false;
    if (existingSupport) {
      // Remove support (toggle)
      await db.issueSupport.delete({
        where: { id: existingSupport.id },
      });
      hasSupported = false;
    } else {
      // Add support
      await db.issueSupport.create({
        data: {
          issueId: id,
          userId: user.id,
        },
      });
      hasSupported = true;
    }

    // Recalculate support count & priority score
    const newSupportCount = await db.issueSupport.count({ where: { issueId: id } });

    const priorityInfo = calculateIssuePriority({
      severity: issue.severity,
      supportCount: newSupportCount,
      createdAt: issue.createdAt,
      status: issue.status,
    });

    await db.issue.update({
      where: { id },
      data: { priorityScore: priorityInfo.score },
    });

    return NextResponse.json({
      success: true,
      data: {
        supportCount: newSupportCount,
        hasSupported,
        priorityScore: priorityInfo.score,
      },
      message: hasSupported ? 'Upvoted issue' : 'Removed upvote',
    });
  } catch (error: any) {
    console.error('Support issue error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to process upvote' } },
      { status: 500 }
    );
  }
}
