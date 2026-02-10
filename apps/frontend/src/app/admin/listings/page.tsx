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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Eye, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlatformIcon } from '@/components/platform-icon';

interface Listing {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  description: string;
  status: string;
  verificationStatus: string;
  price: number;
  currency: string;
  niche: string;
  metrics: any;
  screenshots: string[];
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    username: string;
    email: string;
    trustScore: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    verificationStatus: 'all',
    platform: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [listingDetail, setListingDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.verificationStatus !== 'all') params.append('verificationStatus', filters.verificationStatus);
      if (filters.platform !== 'all') params.append('platform', filters.platform);

      const response = await api.get(`/admin/listings?${params}`);
      setListings(response.data.data.listings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentPage, filters]);

  const fetchListingDetail = async (listingId: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/listings/${listingId}`);
      setListingDetail(response.data.data);
    } catch (error) {
      console.error('Failed to fetch listing details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVerify = async (listingId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/listings/${listingId}/verify`);
      fetchListings();
    } catch (error) {
      console.error('Failed to verify listing:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedListing || !rejectReason.trim()) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/listings/${selectedListing.id}/reject`, {
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedListing(null);
      fetchListings();
    } catch (error) {
      console.error('Failed to reject listing:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedListing || !suspendReason.trim()) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/listings/${selectedListing.id}/suspend`, {
        reason: suspendReason,
      });
      setShowSuspendModal(false);
      setSuspendReason('');
      setSelectedListing(null);
      fetchListings();
    } catch (error) {
      console.error('Failed to suspend listing:', error);
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

  const getProfileUrl = (platform: string, username: string) => {
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${username}`;
      case 'youtube':
        return `https://youtube.com/@${username}`;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending_review':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'sold':
        return <Badge variant="outline">Sold</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'unverified':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatMetric = (value: any) => {
    if (value == null) return '-';
    if (typeof value === 'number') {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
      return value.toString();
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Listings</h1>
        <p className="text-muted-foreground">Review and moderate platform listings</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.verificationStatus}
              onValueChange={(value) => setFilters({ ...filters, verificationStatus: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.platform}
              onValueChange={(value) => setFilters({ ...filters, platform: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={() => setFilters({ status: 'all', verificationStatus: 'all', platform: 'all' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No listings found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={listing.platform} className="h-8 w-8" />
                        <div>
                          <p className="font-medium">{listing.displayName || listing.username}</p>
                          <p className="text-sm text-muted-foreground">@{listing.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{listing.seller.username}</p>
                        <p className="text-sm text-muted-foreground">{listing.seller.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(listing.price, listing.currency)}</TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                    <TableCell>{getVerificationBadge(listing.verificationStatus)}</TableCell>
                    <TableCell>
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowDetailModal(true);
                            fetchListingDetail(listing.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(
                          listing.verificationStatus === 'pending' ||
                          listing.verificationStatus === 'unverified' ||
                          listing.status === 'pending_review'
                        ) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleVerify(listing.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedListing(listing);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {listing.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                            onClick={() => {
                              setSelectedListing(listing);
                              setShowSuspendModal(true);
                            }}
                            disabled={actionLoading}
                          >
                            <Ban className="h-4 w-4" />
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
              Showing {listings.length} of {pagination.total} listings
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

      {/* Listing Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Listing Details</DialogTitle>
            <DialogDescription>
              Detailed view for {selectedListing?.displayName || selectedListing?.username}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : listingDetail ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <PlatformIcon platform={listingDetail.platform} className="h-12 w-12" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {listingDetail.displayName || listingDetail.username}
                  </h3>
                  <p className="text-muted-foreground">@{listingDetail.username}</p>
                  {getProfileUrl(listingDetail.platform, listingDetail.username) && (
                    <a
                      href={getProfileUrl(listingDetail.platform, listingDetail.username)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </div>

              <Separator />

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold text-lg">{formatCurrency(listingDetail.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(listingDetail.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification</p>
                  {getVerificationBadge(listingDetail.verificationStatus)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium capitalize">{listingDetail.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niche</p>
                  <p className="font-medium">{listingDetail.niche || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(listingDetail.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Seller info */}
              {listingDetail.seller && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Seller</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p className="font-medium">{listingDetail.seller.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{listingDetail.seller.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trust Score</p>
                        <p className="font-medium">{listingDetail.seller.trustScore?.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Metrics */}
              {listingDetail.metrics && Object.keys(listingDetail.metrics).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Metrics</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(listingDetail.metrics).map(([key, value]) => (
                        <div key={key} className="p-2 bg-muted rounded-md">
                          <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="font-medium">{formatMetric(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              {listingDetail.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {listingDetail.description}
                    </p>
                  </div>
                </>
              )}

              {/* Screenshots */}
              {listingDetail.screenshots && listingDetail.screenshots.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Screenshots ({listingDetail.screenshots.length})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {listingDetail.screenshots.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Screenshot ${i + 1}`}
                            className="rounded-md border w-full h-40 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this listing. The seller will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for suspending this listing. The seller will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter suspension reason..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSuspend}
              disabled={!suspendReason.trim() || actionLoading}
            >
              {actionLoading ? 'Suspending...' : 'Suspend Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
