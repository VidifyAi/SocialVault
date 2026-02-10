'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  FileText,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Listings',
    href: '/admin/listings',
    icon: ShoppingBag,
  },
  {
    title: 'Transactions',
    href: '/admin/transactions',
    icon: CreditCard,
  },
  {
    title: 'Disputes',
    href: '/admin/disputes',
    icon: AlertTriangle,
  },
  {
    title: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center gap-2 px-3 py-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Admin Panel</span>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3',
                        isActive && 'bg-secondary'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Site
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-2">
          <nav className="flex justify-around">
            {sidebarItems.slice(0, 5).map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-md',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
