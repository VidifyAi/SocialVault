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
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import {
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  RefreshCcw,
} from 'lucide-react';

interface Dispute {
  id: string;
  reason: string;
  description: string;
  status: string;
  evidence: string[];
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  initiator: {
    id: string;
    username: string;
    email: string;
  };
  transaction: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    buyer: { id: string; username: string; email: string };
    seller: { id: string; username: string; email: string };
    listing: { id: string; username: string; platform: string };
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [disputeDetail, setDisputeDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resolution, setResolution] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/admin/disputes?${params}`);
      setDisputes(response.data.data.disputes);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [currentPage, statusFilter]);

  const fetchDisputeDetail = async (disputeId: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/disputes/${disputeId}`);
      setDisputeDetail(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dispute details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution || !notes.trim()) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/disputes/${selectedDispute.id}/resolve`, {
        resolution,
        notes,
      });
      setShowResolveModal(false);
      setResolution('');
      setNotes('');
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
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
      case 'opened':
        return <Badge variant="destructive">Open</Badge>;
      case 'under_review':
        return <Badge variant="secondary">Under Review</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispute Management</h1>
        <p className="text-muted-foreground">Review and resolve transaction disputes</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="opened">Open</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={() => setStatusFilter('all')}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No disputes found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{dispute.reason}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {dispute.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        #{dispute.transaction.id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(dispute.transaction.amount, dispute.transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Buyer: {dispute.transaction.buyer.username}</p>
                        <p>Seller: {dispute.transaction.seller.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                    <TableCell>
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowDetailModal(true);
                            fetchDisputeDetail(dispute.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowResolveModal(true);
                            }}
                          >
                            Resolve
                          </Button>
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
              Showing {disputes.length} of {pagination.total} disputes
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

      {/* Dispute Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              Dispute #{selectedDispute?.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : disputeDetail ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium">{disputeDetail.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(disputeDetail.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Initiated by</p>
                  <p className="font-medium">{disputeDetail.initiator?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(disputeDetail.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {disputeDetail.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{disputeDetail.description}</p>
                </div>
              )}

              {disputeDetail.resolution && (
                <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Resolution</p>
                  <p className="text-sm mt-1">{disputeDetail.resolution}</p>
                  {disputeDetail.resolvedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Resolved on {new Date(disputeDetail.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Evidence */}
              {disputeDetail.evidence && disputeDetail.evidence.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Evidence ({disputeDetail.evidence.length})</p>
                    <div className="space-y-2">
                      {disputeDetail.evidence.map((item: string, i: number) => (
                        <div key={i} className="p-2 bg-muted rounded-md">
                          {item.startsWith('http') ? (
                            <a
                              href={item}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all"
                            >
                              {item}
                            </a>
                          ) : (
                            <p className="text-sm">{item}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <Tabs defaultValue="transaction">
                <TabsList>
                  <TabsTrigger value="transaction">Transaction</TabsTrigger>
                  <TabsTrigger value="conversation">
                    Conversation ({disputeDetail.transaction?.conversation?.messages?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transaction" className="mt-4">
                  {disputeDetail.transaction ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold">{formatCurrency(disputeDetail.transaction.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="outline">{disputeDetail.transaction.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Buyer</p>
                        <p className="font-medium">{disputeDetail.transaction.buyer?.username}</p>
                        <p className="text-xs text-muted-foreground">{disputeDetail.transaction.buyer?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Seller</p>
                        <p className="font-medium">{disputeDetail.transaction.seller?.username}</p>
                        <p className="text-xs text-muted-foreground">{disputeDetail.transaction.seller?.email}</p>
                      </div>
                      {disputeDetail.transaction.listing && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Listing</p>
                          <p className="font-medium">
                            {disputeDetail.transaction.listing.displayName || disputeDetail.transaction.listing.username}
                            <span className="text-muted-foreground ml-1">({disputeDetail.transaction.listing.platform})</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No transaction data</p>
                  )}
                </TabsContent>

                <TabsContent value="conversation" className="mt-4">
                  {!disputeDetail.transaction?.conversation?.messages?.length ? (
                    <p className="text-muted-foreground text-center py-4">No messages</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {disputeDetail.transaction.conversation.messages.map((msg: any) => {
                        const isBuyer = msg.senderId === disputeDetail.transaction.buyer?.id;
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
                                {isBuyer
                                  ? disputeDetail.transaction.buyer?.username
                                  : disputeDetail.transaction.seller?.username}
                                <Badge variant="outline" className="ml-2 text-[10px]">
                                  {isBuyer ? 'Buyer' : 'Seller'}
                                </Badge>
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
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Choose a resolution for this dispute. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="py-4 space-y-4">
              {/* Dispute Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedDispute.transaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buyer:</span>
                      <span>{selectedDispute.transaction.buyer.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seller:</span>
                      <span>{selectedDispute.transaction.seller.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span>{selectedDispute.reason}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resolution Options */}
              <div className="space-y-2">
                <Label>Resolution</Label>
                <div className="grid gap-2">
                  <Button
                    variant={resolution === 'refund_buyer' ? 'default' : 'outline'}
                    className="justify-start h-auto py-3"
                    onClick={() => setResolution('refund_buyer')}
                  >
                    <RefreshCcw className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Full Refund to Buyer</p>
                      <p className="text-xs text-muted-foreground">
                        Refund the full amount to the buyer
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant={resolution === 'release_seller' ? 'default' : 'outline'}
                    className="justify-start h-auto py-3"
                    onClick={() => setResolution('release_seller')}
                  >
                    <DollarSign className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Release to Seller</p>
                      <p className="text-xs text-muted-foreground">
                        Release escrow funds to the seller
                      </p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Resolution Notes</Label>
                <Textarea
                  placeholder="Enter detailed notes about your decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!resolution || !notes.trim() || actionLoading}
            >
              {actionLoading ? 'Resolving...' : 'Confirm Resolution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
