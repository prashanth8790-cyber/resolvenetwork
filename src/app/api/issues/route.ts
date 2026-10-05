import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth';
import { createIssueSchema } from '@/lib/validations/issue';
import { calculateIssuePriority } from '@/lib/services/priority';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const wardId = searchParams.get('wardId');
    const search = searchParams.get('search');
    const reporterId = searchParams.get('reporterId');
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, support, priority

    const whereClause: any = {};

    if (categoryId) whereClause.categoryId = categoryId;
    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (wardId) whereClause.wardId = wardId;
    if (reporterId) whereClause.reporterId = reporterId;

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { id: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'priority') {
      orderBy = { priorityScore: 'desc' };
    }

    const issues = await db.issue.findMany({
      where: whereClause,
      include: {
        category: true,
        ward: true,
        reporter: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, department: true },
        },
        images: true,
        _count: {
          select: { supports: true, comments: true },
        },
      },
      orderBy,
    });

    // If client requested sort by support count
    let result = issues;
    if (sortBy === 'support') {
      result = [...issues].sort((a, b) => b._count.supports - a._count.supports);
    }

    return NextResponse.json({
      success: true,
      data: { issues: result },
    });
  } catch (error: any) {
    console.error('List issues error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch issues' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const body = await req.json();
    const result = createIssueSchema.safeParse(body);

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

    const { title, description, categoryId, wardId, severity, lat, lng, address, images } = result.data;

    // Calculate initial priority score
    const priorityInfo = calculateIssuePriority({
      severity,
      supportCount: 0,
      createdAt: new Date(),
      status: 'SUBMITTED',
    });

    const issue = await db.issue.create({
      data: {
        title,
        description,
        categoryId,
        wardId,
        severity,
        lat,
        lng,
        address,
        reporterId: user.id,
        status: 'SUBMITTED',
        priorityScore: priorityInfo.score,
        images: {
          create: images.map((url) => ({ url })),
        },
      },
      include: {
        category: true,
        ward: true,
        reporter: { select: { id: true, name: true } },
        images: true,
      },
    });

    // Log status history
    await db.issueStatusHistory.create({
      data: {
        issueId: issue.id,
        actorId: user.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'SUBMITTED',
        note: 'Issue reported by citizen',
      },
    });

    return NextResponse.json({
      success: true,
      data: { issue },
      message: 'Issue reported successfully',
    });
  } catch (error: any) {
    console.error('Create issue error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Failed to create issue' } },
      { status: 500 }
    );
  }
}
