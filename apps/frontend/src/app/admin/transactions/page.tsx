'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import {
  CreditCard,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  ArrowUpRight,
  Star,
} from 'lucide-react';
import { PlatformIcon } from '@/components/platform-icon';

interface Transaction {
  id: string;
  amount: number;
  platformFee: number;
  sellerPayout: number;
  currency: string;
  status: string;
  escrowStatus: string;
  paymentStatus: string;
  currentStep: number;
  createdAt: string;
  completedAt: string | null;
  buyer: { id: string; username: string; email: string };
  seller: { id: string; username: string; email: string };
  listing: { id: string; username: string; displayName: string; platform: string };
  dispute: { id: string; status: string } | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TIMELINE_STEPS = [
  'Initiated',
  'Payment',
  'Escrow',
  'Transfer',
  'Confirmed',
  'Completed',
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'initiated': return 0;
    case 'payment_pending': return 1;
    case 'escrow_funded': return 2;
    case 'transfer_in_progress': return 3;
    case 'transfer_confirmed': return 4;
    case 'completed': return 5;
    case 'cancelled':
    case 'disputed':
      return -1;
    default: return 0;
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    escrowStatus: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [txDetail, setTxDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.escrowStatus !== 'all') params.append('escrowStatus', filters.escrowStatus);

      const response = await api.get(`/admin/transactions?${params}`);
      setTransactions(response.data.data.transactions);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters]);

  const fetchTxDetail = async (txId: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/transactions/${txId}`);
      setTxDetail(response.data.data);
    } catch (error) {
      console.error('Failed to fetch transaction details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReleaseEscrow = async (transactionId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/transactions/${transactionId}/release-escrow`);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to release escrow:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedTransaction || !refundReason.trim()) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/transactions/${selectedTransaction.id}/refund`, {
        reason: refundReason,
      });
      setShowRefundModal(false);
      setRefundReason('');
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to refund transaction:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'escrow_funded':
        return <Badge className="bg-blue-500">Escrow Funded</Badge>;
      case 'transfer_in_progress':
        return <Badge variant="secondary">Transfer In Progress</Badge>;
      case 'initiated':
        return <Badge variant="outline">Initiated</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEscrowBadge = (status: string) => {
    switch (status) {
      case 'funded':
        return <Badge className="bg-blue-500">Funded</Badge>;
      case 'released':
        return <Badge className="bg-green-500">Released</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Manage platform transactions and escrow</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="initiated">Initiated</SelectItem>
                <SelectItem value="escrow_funded">Escrow Funded</SelectItem>
                <SelectItem value="transfer_in_progress">Transfer In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.escrowStatus}
              onValueChange={(value) => setFilters({ ...filters, escrowStatus: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Escrow Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={() => setFilters({ status: 'all', escrowStatus: 'all' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Escrow</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={tx.listing.platform} className="h-8 w-8" />
                        <div>
                          <p className="font-medium">
                            {tx.listing.displayName || tx.listing.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{tx.listing.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>
                          <span className="text-muted-foreground">Buyer:</span>{' '}
                          {tx.buyer.username}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Seller:</span>{' '}
                          {tx.seller.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(tx.amount, tx.currency)}</p>
                        <p className="text-xs text-muted-foreground">
                          Fee: {formatCurrency(tx.platformFee, tx.currency)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(tx.status)}
                        {tx.dispute && (
                          <Badge variant="destructive" className="ml-1">Disputed</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getEscrowBadge(tx.escrowStatus)}</TableCell>
                    <TableCell>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setShowDetailModal(true);
                            fetchTxDetail(tx.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {tx.escrowStatus === 'funded' && tx.status !== 'completed' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleReleaseEscrow(tx.id)}
                              disabled={actionLoading}
                              title="Release Escrow"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setShowRefundModal(true);
                              }}
                              disabled={actionLoading}
                              title="Refund"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {transactions.length} of {pagination.total} transactions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Transaction #{selectedTransaction?.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : txDetail ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(txDetail.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform Fee</p>
                  <p className="font-medium">{formatCurrency(txDetail.platformFee)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller Payout</p>
                  <p className="font-medium">{formatCurrency(txDetail.sellerPayout)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(txDetail.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Escrow</p>
                  {getEscrowBadge(txDetail.escrowStatus)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(txDetail.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Buyer / Seller */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Buyer</p>
                  <p className="font-medium">{txDetail.buyer?.username}</p>
                  <p className="text-sm text-muted-foreground">{txDetail.buyer?.email}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Seller</p>
                  <p className="font-medium">{txDetail.seller?.username}</p>
                  <p className="text-sm text-muted-foreground">{txDetail.seller?.email}</p>
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div>
                <p className="text-sm font-medium mb-3">Transaction Timeline</p>
                <div className="flex items-center justify-between">
                  {TIMELINE_STEPS.map((step, i) => {
                    const currentIdx = getStepIndex(txDetail.status);
                    const isComplete = currentIdx >= 0 && i <= currentIdx;
                    const isCurrent = currentIdx >= 0 && i === currentIdx;
                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className="flex items-center w-full">
                          {i > 0 && (
                            <div className={`h-0.5 flex-1 ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
                          )}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                              isComplete
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted bg-background text-muted-foreground'
                            } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
                          >
                            {i + 1}
                          </div>
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 ${isComplete && i < currentIdx ? 'bg-primary' : 'bg-muted'}`} />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 text-center">{step}</span>
                      </div>
                    );
                  })}
                </div>
                {getStepIndex(txDetail.status) === -1 && (
                  <p className="text-sm text-red-500 mt-2 text-center">
                    Transaction {txDetail.status === 'cancelled' ? 'cancelled' : 'disputed'}
                  </p>
                )}
              </div>

              <Separator />

              <Tabs defaultValue="messages">
                <TabsList>
                  <TabsTrigger value="messages">
                    Messages ({txDetail.conversation?.messages?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews ({txDetail.reviews?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="mt-4">
                  {!txDetail.conversation?.messages?.length ? (
                    <p className="text-muted-foreground text-center py-4">No messages</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {txDetail.conversation.messages.map((msg: any) => {
                        const isBuyer = msg.senderId === txDetail.buyerId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isBuyer ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                isBuyer
                                  ? 'bg-muted'
                                  : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              <p className="text-xs font-medium mb-1">
                                {isBuyer ? txDetail.buyer?.username : txDetail.seller?.username}
                              </p>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isBuyer ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  {!txDetail.reviews?.length ? (
                    <p className="text-muted-foreground text-center py-4">No reviews</p>
                  ) : (
                    <div className="space-y-3">
                      {txDetail.reviews.map((review: any) => (
                        <div key={review.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {review.reviewerId === txDetail.buyerId ? 'Buyer' : 'Seller'}
                            </Badge>
                          </div>
                          {review.comment && (
                            <p className="text-sm">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Transaction</DialogTitle>
            <DialogDescription>
              This will refund the full amount to the buyer. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="py-4">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount to refund:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buyer:</span>
                      <span>{selectedTransaction.buyer.username}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Textarea
                placeholder="Enter refund reason..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={!refundReason.trim() || actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
