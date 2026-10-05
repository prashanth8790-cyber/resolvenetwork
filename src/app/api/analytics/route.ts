import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const totalIssues = await db.issue.count();

    const statusCountsRaw = await db.issue.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusMap: Record<string, number> = {};
    statusCountsRaw.forEach((sc) => {
      statusMap[sc.status] = sc._count.id;
    });

    const categoryCountsRaw = await db.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { issues: true },
        },
      },
    });

    const categoryChartData = categoryCountsRaw.map((cat) => ({
      name: cat.name,
      count: cat._count.issues,
    }));

    const statusChartData = Object.keys(statusMap).map((st) => ({
      name: st.replace('_', ' '),
      count: statusMap[st],
    }));

    const criticalCount = await db.issue.count({
      where: { severity: 'CRITICAL', status: { notIn: ['CLOSED', 'RESOLVED', 'REJECTED'] } },
    });

    const totalUsers = await db.user.count();
    const usersByRoleRaw = await db.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    const roleMap: Record<string, number> = {};
    usersByRoleRaw.forEach((ur) => {
      roleMap[ur.role] = ur._count.id;
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalIssues,
          submitted: statusMap['SUBMITTED'] || 0,
          underReview: statusMap['UNDER_REVIEW'] || 0,
          verified: statusMap['VERIFIED'] || 0,
          assigned: statusMap['ASSIGNED'] || 0,
          inProgress: statusMap['IN_PROGRESS'] || 0,
          resolved: statusMap['RESOLVED'] || 0,
          closed: statusMap['CLOSED'] || 0,
          rejected: statusMap['REJECTED'] || 0,
          reopened: statusMap['REOPENED'] || 0,
          criticalCount,
          totalUsers,
          citizens: roleMap['CITIZEN'] || 0,
          authorities: roleMap['AUTHORITY'] || 0,
          admins: roleMap['ADMIN'] || 0,
        },
        categoryChart: categoryChartData,
        statusChart: statusChartData,
      },
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch analytics' } },
      { status: 500 }
    );
  }
}
