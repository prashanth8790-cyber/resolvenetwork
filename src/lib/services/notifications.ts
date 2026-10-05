import { db } from '@/lib/db';

export async function createNotification({
  userId,
  message,
  link,
}: {
  userId: string;
  message: string;
  link?: string;
}) {
  try {
    return await db.notification.create({
      data: {
        userId,
        message,
        link,
        read: false,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function getUserNotifications(userId: string) {
  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return await db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
