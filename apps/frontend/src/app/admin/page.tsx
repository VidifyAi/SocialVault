'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import {
  Users,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  DollarSign,
  Shield,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  users: { total: number; active: number };
  listings: { total: number; active: number; pendingVerification: number };
  transactions: { total: number; completed: number; successRate: string | number };
  disputes: { open: number };
  flaggedMessages?: { highSeverity: number };
  financials: { gmv: number; revenue: number; escrowFunds: number };
  revenue: {
    last30Days: { revenue: number; gmv: number; transactions: number };
    last7Days: { revenue: number; gmv: number; transactions: number };
    today: { revenue: number; gmv: number; transactions: number };
  };
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('You do not have permission to access the admin dashboard.');
        } else {
          setError('Failed to load dashboard stats');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Shield className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasPendingAlerts =
    stats.listings.pendingVerification > 0 ||
    stats.disputes.open > 0 ||
    (stats.flaggedMessages?.highSeverity ?? 0) > 0;

  const maxRevenue = Math.max(
    stats.revenue.today.revenue,
    stats.revenue.last7Days.revenue,
    stats.revenue.last30Days.revenue,
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the SocialSwapr platform</p>
      </div>

      {/* Pending Action Alerts */}
      {hasPendingAlerts && (
        <div className="grid gap-3 md:grid-cols-3">
          {stats.listings.pendingVerification > 0 && (
            <Link href="/admin/listings?verificationStatus=pending">
              <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10 cursor-pointer hover:border-yellow-500 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <ShoppingBag className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">{stats.listings.pendingVerification} listings pending review</p>
                    <p className="text-xs text-muted-foreground">Click to review</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          {stats.disputes.open > 0 && (
            <Link href="/admin/disputes?status=opened">
              <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/10 cursor-pointer hover:border-red-500 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">{stats.disputes.open} open disputes</p>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          {(stats.flaggedMessages?.highSeverity ?? 0) > 0 && (
            <Link href="/admin/messages">
              <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/10 cursor-pointer hover:border-red-500 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">{stats.flaggedMessages!.highSeverity} high-severity flagged messages</p>
                    <p className="text-xs text-muted-foreground">Requires review</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.listings.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.listings.pendingVerification} pending verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.financials.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.financials.gmv)} GMV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disputes.open}</div>
            <p className="text-xs text-muted-foreground">
              {stats.transactions.successRate}% success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Comparison Bar Chart + Escrow Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <BarChart3 className="h-4 w-4 mr-2" />
              Revenue Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Today', data: stats.revenue.today },
              { label: 'Last 7 Days', data: stats.revenue.last7Days },
              { label: 'Last 30 Days', data: stats.revenue.last30Days },
            ].map((period) => (
              <div key={period.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{period.label}</span>
                  <span className="font-medium">{formatCurrency(period.data.revenue)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max((period.data.revenue / maxRevenue) * 100, 2)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {period.data.transactions} txns &middot; {formatCurrency(period.data.gmv)} GMV
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <CreditCard className="h-4 w-4 mr-2" />
              Escrow Status
            </CardTitle>
            <CardDescription>Current funds held in escrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.financials.escrowFunds)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Funds will be released upon successful transfer completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      {tx.listing?.displayName || tx.listing?.username || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {tx.buyer?.username} → {tx.seller?.username}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        tx.status === 'completed' ? 'default' :
                        tx.status === 'escrow_funded' ? 'secondary' :
                        'outline'
                      }>
                        {tx.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {stats.recentTransactions.length > 0 && (
            <div className="p-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/transactions">View All Transactions</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
