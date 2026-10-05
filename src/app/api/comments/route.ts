import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authForbiddenResponse, authUnauthorizedResponse } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validations/issue';
import { createNotification } from '@/lib/services/notifications';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const issueId = searchParams.get('issueId');

    if (!issueId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'issueId is required' } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = createCommentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message },
        },
        { status: 400 }
      );
    }

    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } },
        { status: 404 }
      );
    }

    const comment = await db.comment.create({
      data: {
        issueId,
        authorId: user.id,
        text: result.data.text,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    // Notify reporter if author is not reporter
    if (issue.reporterId !== user.id) {
      await createNotification({
        userId: issue.reporterId,
        message: `${user.name} commented on your issue "${issue.title}"`,
        link: `/issues/${issueId}`,
      });
    }

    // Notify assigned authority if author is not assigned authority
    if (issue.assignedToId && issue.assignedToId !== user.id) {
      await createNotification({
        userId: issue.assignedToId,
        message: `${user.name} commented on assigned issue "${issue.title}"`,
        link: `/issues/${issueId}`,
      });
    }

    return NextResponse.json({
      success: true,
      data: { comment },
      message: 'Comment posted successfully',
    });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to post comment' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'comment id is required' } },
        { status: 400 }
      );
    }

    const comment = await db.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } },
        { status: 404 }
      );
    }

    if (user.role !== 'ADMIN' && comment.authorId !== user.id) {
      return authForbiddenResponse('Only the author or an admin can delete this comment');
    }

    await db.comment.delete({ where: { id: commentId } });

    return NextResponse.json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete comment' } },
      { status: 500 }
    );
  }
}
