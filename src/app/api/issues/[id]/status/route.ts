import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authForbiddenResponse, authUnauthorizedResponse } from '@/lib/auth';
import { updateIssueStatusSchema } from '@/lib/validations/issue';
import { calculateIssuePriority } from '@/lib/services/priority';
import { createNotification } from '@/lib/services/notifications';

const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['ASSIGNED', 'IN_PROGRESS'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['VERIFIED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'],
  REJECTED: ['UNDER_REVIEW'],
  CLOSED: [],
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const result = updateIssueStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

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

    const { status: targetStatus, assignedToId, beforeImage, afterImage, note, reopenReason } = result.data;
    const currentStatus = issue.status;

    // Validate state machine transition
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: `Cannot transition issue status from ${currentStatus} to ${targetStatus}.`,
          },
        },
        { status: 400 }
      );
    }

    // Role-based permissions for transitions
    if (targetStatus === 'CLOSED' || targetStatus === 'REOPENED') {
      // Reporter citizen or Admin can confirm or reopen
      if (user.role !== 'ADMIN' && issue.reporterId !== user.id) {
        return authForbiddenResponse('Only the reporter citizen or an admin can verify resolution.');
      }
    } else {
      // Authority or Admin required for operational status changes
      if (user.role !== 'AUTHORITY' && user.role !== 'ADMIN') {
        return authForbiddenResponse('Only municipal authorities or admins can update issue operational status.');
      }
    }

    // Special validation for RESOLVED (requires before and after images)
    if (targetStatus === 'RESOLVED') {
      const finalBefore = beforeImage || issue.beforeImage;
      const finalAfter = afterImage || issue.afterImage;
      if (!finalBefore || !finalAfter) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_IMAGES',
              message: 'Both before and after images are required to resolve an issue.',
            },
          },
          { status: 400 }
        );
      }
    }

    // Recalculate priority
    const priorityInfo = calculateIssuePriority({
      severity: issue.severity,
      supportCount: issue._count.supports,
      createdAt: issue.createdAt,
      status: targetStatus,
    });

    const updateData: any = {
      status: targetStatus,
      priorityScore: priorityInfo.score,
    };

    if (assignedToId) updateData.assignedToId = assignedToId;
    if (beforeImage) updateData.beforeImage = beforeImage;
    if (afterImage) updateData.afterImage = afterImage;
    if (note && targetStatus === 'RESOLVED') updateData.resolutionNote = note;

    const updatedIssue = await db.issue.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        ward: true,
        reporter: true,
        assignedTo: true,
      },
    });

    // Log status history entry
    const historyNote = targetStatus === 'REOPENED' ? `Reason: ${reopenReason || note || 'Issue persists'}` : note;
    await db.issueStatusHistory.create({
      data: {
        issueId: id,
        actorId: user.id,
        fromStatus: currentStatus,
        toStatus: targetStatus,
        note: historyNote,
      },
    });

    // Send notifications
    // 1. Notify reporter if actor is not reporter
    if (issue.reporterId !== user.id) {
      await createNotification({
        userId: issue.reporterId,
        message: `Your issue "${issue.title}" status changed to ${targetStatus.replace('_', ' ')}`,
        link: `/issues/${id}`,
      });
    }

    // 2. Notify assigned authority if newly assigned
    if (assignedToId && assignedToId !== user.id) {
      await createNotification({
        userId: assignedToId,
        message: `You were assigned to issue "${issue.title}"`,
        link: `/issues/${id}`,
      });
    }

    return NextResponse.json({
      success: true,
      data: { issue: updatedIssue },
      message: `Issue status updated to ${targetStatus}`,
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Failed to update status' } },
      { status: 500 }
    );
  }
}
