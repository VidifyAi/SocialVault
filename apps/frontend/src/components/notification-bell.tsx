'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { usersApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await usersApi.getUnreadCount();
      setUnreadCount(res.data?.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getNotifications({ limit: 5, unreadOnly: false });
      const notifs = res.data?.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const markAsRead = async (id: string) => {
    try {
      await usersApi.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (notification.data?.transactionId) {
      return `/dashboard/transactions/${notification.data.transactionId}`;
    }
    if (notification.data?.listingId) {
      return `/listing/${notification.data.listingId}`;
    }
    if (notification.data?.offerId) {
      return `/dashboard/offers`;
    }
    if (notification.type === 'message_new') {
      return '/dashboard/messages';
    }
    return '/dashboard/notifications';
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={async () => {
                try {
                  await usersApi.markAllNotificationsAsRead();
                  setNotifications(notifications.map(n => ({ ...n, read: true })));
                  setUnreadCount(0);
                } catch (error) {
                  console.error('Failed to mark all as read:', error);
                }
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                  setOpen(false);
                }}
                asChild
              >
                <Link href={getNotificationLink(notification)} className="w-full">
                  <div className="flex items-start gap-2 w-full">
                    <div className={`flex-1 ${notification.read ? 'opacity-60' : ''}`}>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="w-full text-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

