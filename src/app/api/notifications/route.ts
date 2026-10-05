import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/services/notifications';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const notifications = await getUserNotifications(user.id);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch notifications' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  try {
    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
      await markAllNotificationsAsRead(user.id);
    } else if (id) {
      await markNotificationAsRead(id, user.id);
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Specify id or markAll: true' } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification status updated',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update notification' } },
      { status: 500 }
    );
  }
}
