'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Loader2,
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
import { usersApi, listingsApi, transactionsApi, messagesApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { PlatformIcon } from '@/components/platform-icon';

interface DashboardStats {
  totalEarnings: number;
  totalSpent: number;
  activeListings: number;
  pendingTransactions: number;
  unreadMessages: number;
  totalSales: number;
  totalPurchases: number;
}

interface RecentActivity {
  id: string;
  type: 'listing' | 'transaction' | 'message' | 'offer';
  title: string;
  description: string;
  createdAt: string;
  status?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, listingsRes, transactionsRes] = await Promise.all([
          usersApi.getDashboardStats(),
          listingsApi.getMyListings(),
          transactionsApi.getMyTransactions(),
        ]);

        setStats(statsRes.data);
        setRecentListings((listingsRes.data.listings || []).slice(0, 5));
        setRecentTransactions((transactionsRes.data.transactions || []).slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default values for demo
        setStats({
          totalEarnings: 0,
          totalSpent: 0,
          activeListings: 0,
          pendingTransactions: 0,
          unreadMessages: 0,
          totalSales: 0,
          totalPurchases: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || user?.username}!
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats?.totalSales || 0} sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              On {stats?.totalPurchases || 0} purchases
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeListings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingTransactions || 0} pending transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.unreadMessages || 0}
            </div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Listings</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/listings">
                  View all
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>Your most recent listings</CardDescription>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No listings yet</p>
                <Button variant="link" asChild>
                  <Link href="/dashboard/listings/new">Create your first listing</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <PlatformIcon platform={listing.platform} size={32} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(listing.price)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        listing.status === 'active'
                          ? 'default'
                          : listing.status === 'sold'
                          ? 'success'
                          : 'secondary'
                      }
                    >
                      {listing.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/transactions">
                  View all
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>Your buying and selling activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <Button variant="link" asChild>
                  <Link href="/browse">Browse accounts</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <Link
                    key={transaction.id}
                    href={`/dashboard/transactions/${transaction.id}`}
                    className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <PlatformIcon
                        platform={transaction.listing?.platform || 'other'}
                        size={32}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {transaction.listing?.title || 'Transaction'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(transaction.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'success'
                          : transaction.status === 'disputed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/dashboard/listings/new">
                <Plus className="h-6 w-6" />
                <span>Create Listing</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/browse">
                <ShoppingBag className="h-6 w-6" />
                <span>Browse Accounts</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/dashboard/messages">
                <MessageSquare className="h-6 w-6" />
                <span>Messages</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/dashboard/settings">
                <TrendingUp className="h-6 w-6" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
