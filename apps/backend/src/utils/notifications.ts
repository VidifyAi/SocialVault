// Notification Helper
// Creates notifications and emits WebSocket events

import { prisma } from '../lib/prisma';
import { logger } from './logger';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
      },
    });

    logger.info(`Notification created: ${notification.id} for user ${data.userId}`);

    // Note: WebSocket event emission should be handled by the calling service
    // to ensure the socket.io instance is available
    
    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotifications(notifications: CreateNotificationData[]) {
  try {
    const created = await prisma.notification.createMany({
      data: notifications.map(n => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data || {},
      })),
    });

    logger.info(`Created ${created.count} notifications`);
    return created;
  } catch (error) {
    logger.error('Failed to create notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return notification;
  } catch (error) {
    logger.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    logger.error('Failed to get unread count:', error);
    return 0;
  }
}

