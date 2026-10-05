import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, authForbiddenResponse, authUnauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: { categories } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch categories' } },
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
    const { name, description, icon } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Category name is required' } },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: { name, description, icon: icon || 'HelpCircle' },
    });

    return NextResponse.json({ success: true, data: { category }, message: 'Category created successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Failed to create category' } },
      { status: 500 }
    );
  }
}
