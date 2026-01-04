'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the SocialSwapr platform</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Admin
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.today.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenue.today.transactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.last7Days.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenue.last7Days.transactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.last30Days.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenue.last30Days.transactions} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Escrow Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Button asChild variant="outline" className="h-20">
          <Link href="/admin/users" className="flex flex-col items-center gap-2">
            <Users className="h-6 w-6" />
            <span>Manage Users</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-20">
          <Link href="/admin/listings" className="flex flex-col items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <span>Review Listings</span>
            {stats.listings.pendingVerification > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.listings.pendingVerification}
              </Badge>
            )}
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-20">
          <Link href="/admin/transactions" className="flex flex-col items-center gap-2">
            <CreditCard className="h-6 w-6" />
            <span>Transactions</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-20">
          <Link href="/admin/disputes" className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>Disputes</span>
            {stats.disputes.open > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.disputes.open}
              </Badge>
            )}
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-20">
          <Link href="/admin/messages" className="flex flex-col items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <span>Flagged Messages</span>
            {stats.flaggedMessages && stats.flaggedMessages.highSeverity > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.flaggedMessages.highSeverity}
              </Badge>
            )}
          </Link>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No transactions yet</p>
            ) : (
              stats.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      tx.status === 'completed' ? 'bg-green-100' : 
                      tx.status === 'escrow_funded' ? 'bg-blue-100' : 
                      'bg-yellow-100'
                    }`}>
                      {tx.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : tx.status === 'escrow_funded' ? (
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.listing?.displayName || tx.listing?.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.buyer?.username} → {tx.seller?.username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(tx.amount)}</p>
                    <Badge variant={
                      tx.status === 'completed' ? 'default' :
                      tx.status === 'escrow_funded' ? 'secondary' :
                      'outline'
                    }>
                      {tx.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          {stats.recentTransactions.length > 0 && (
            <div className="mt-4">
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
