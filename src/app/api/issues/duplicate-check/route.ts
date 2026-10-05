import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const categoryId = searchParams.get('categoryId');

    if (!latStr || !lngStr || !categoryId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'lat, lng, and categoryId are required' } },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const delta = 0.0025; // ~250m radius

    const nearbyIssues = await db.issue.findMany({
      where: {
        categoryId,
        status: {
          notIn: ['CLOSED', 'REJECTED'],
        },
        lat: {
          gte: lat - delta,
          lte: lat + delta,
        },
        lng: {
          gte: lng - delta,
          lte: lng + delta,
        },
      },
      include: {
        category: true,
        ward: true,
        images: true,
        _count: {
          select: { supports: true },
        },
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        hasDuplicates: nearbyIssues.length > 0,
        duplicates: nearbyIssues,
      },
    });
  } catch (error: any) {
    console.error('Duplicate check error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to check duplicate issues' } },
      { status: 500 }
    );
  }
}
