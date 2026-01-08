'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Bell,
  CheckCheck,
  DollarSign,
  MessageCircle,
  Package,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { usersApi } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
  offer: <FileText className="h-5 w-5 text-blue-500" />,
  message: <MessageCircle className="h-5 w-5 text-green-500" />,
  transaction: <DollarSign className="h-5 w-5 text-yellow-500" />,
  listing: <Package className="h-5 w-5 text-purple-500" />,
  alert: <AlertCircle className="h-5 w-5 text-red-500" />,
  default: <Bell className="h-5 w-5 text-muted-foreground" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await usersApi.getNotifications();
      const notifs = response.data?.data || [];
      // Map to match expected interface
      setNotifications(notifs.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: getNotificationLink(n),
        isRead: n.read,
        createdAt: n.createdAt,
      })));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationLink = (notification: any): string => {
    if (notification.data?.transactionId) {
      return `/dashboard/transactions/${notification.data.transactionId}`;
    }
    if (notification.data?.listingId) {
      return `/listing/${notification.data.listingId}`;
    }
    if (notification.data?.offerId) {
      return '/dashboard/offers';
    }
    if (notification.type === 'message_new') {
      return '/dashboard/messages';
    }
    return '/dashboard/notifications';
  };

  const markAsRead = async (id: string) => {
    try {
      await usersApi.markNotificationAsRead(id);
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await usersApi.markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              You&apos;ll see notifications here when something happens
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead ? 'bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <Link
                  href={notification.link || '#'}
                  onClick={() => markAsRead(notification.id)}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 mt-1">
                    {notificationIcons[notification.type] ||
                      notificationIcons.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
