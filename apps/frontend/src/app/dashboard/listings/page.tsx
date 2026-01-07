'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Loader2, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils';
import { listingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: string;
  title: string;
  platform: string;
  price: number;
  followers: number;
  status: string;
  createdAt: string;
  verificationStatus?: string;
  _count?: {
    offers: number;
    views: number;
  };
}

export default function MyListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingsApi.getMyListings();
      // response.data is axios response, .data is the array of listings
      const data = response.data.data || response.data.listings || [];
      // Map backend fields to frontend interface
      const mappedListings = data.map((l: any) => ({
        id: l.id,
        title: l.displayName || l.username,
        platform: l.platform,
        price: l.price,
        followers: l.metrics?.followers || 0,
        status: l.status,
        createdAt: l.createdAt,
        verificationStatus: l.verificationStatus,
        _count: l._count,
      }));
      setListings(mappedListings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await listingsApi.delete(id);
      setListings(listings.filter((l) => l.id !== id));
      toast({
        title: 'Listing deleted',
        description: 'Your listing has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    pending: listings.filter((l) => l.status === 'pending' || l.status === 'pending_review').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  };

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
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your account listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
            <p className="text-sm text-muted-foreground">Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-4">
              {listings.length === 0
                ? "You haven't created any listings yet."
                : 'No listings match your search.'}
            </p>
            {listings.length === 0 && (
              <Button asChild>
                <Link href="/dashboard/listings/new">Create your first listing</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <PlatformIcon platform={listing.platform} size={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/listing/${listing.id}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {listing.title}
                      </Link>
                      <Badge
                        variant={
                          listing.status === 'active'
                            ? 'default'
                            : listing.status === 'sold'
                            ? 'success'
                            : listing.status === 'pending_review'
                            ? 'warning'
                            : 'secondary'
                        }
                        className={
                          listing.status === 'pending_review'
                            ? 'bg-yellow-500 text-white'
                            : ''
                        }
                      >
                        {listing.status === 'pending_review' ? 'Pending Review' : listing.status}
                      </Badge>
                      {listing.verificationStatus !== 'verified' && (
                        <Badge variant="outline" className="border-dashed">
                          Ownership: {listing.verificationStatus || 'pending'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{getPlatformName(listing.platform)}</span>
                      <span>{formatNumber(listing.followers)} followers</span>
                      <span>Listed {formatRelativeTime(listing.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="font-bold text-lg">
                      {formatCurrency(listing.price)}
                    </div>
                    {listing._count && (
                      <div className="text-sm text-muted-foreground">
                        {listing._count.offers} offers • {listing._count.views} views
                      </div>
                    )}
                    {listing.verificationStatus !== 'verified' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/listings/${listing.id}/verify`}>
                          Verify ownership
                        </Link>
                      </Button>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/listing/${listing.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/listings/${listing.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(listing.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
