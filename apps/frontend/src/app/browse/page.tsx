'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { listingsApi } from '@/lib/api';

interface Listing {
  id: string;
  title: string;
  description: string;
  platform: string;
  price: number;
  followers: number;
  engagement: number;
  category: string;
  images: string[];
  seller: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

const platforms = [
  'all',
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'twitch',
  'facebook',
  'linkedin',
  'discord',
];

const categories = [
  'all',
  'entertainment',
  'lifestyle',
  'gaming',
  'education',
  'business',
  'fashion',
  'fitness',
  'food',
  'travel',
  'technology',
  'music',
  'art',
  'sports',
  'other',
];

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'followers-desc', label: 'Most followers' },
  { value: 'engagement-desc', label: 'Highest engagement' },
];

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minFollowers, setMinFollowers] = useState(
    searchParams.get('minFollowers') || ''
  );
  const [maxFollowers, setMaxFollowers] = useState(
    searchParams.get('maxFollowers') || ''
  );
  const [sort, setSort] = useState(
    searchParams.get('sort') || 'createdAt-desc'
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sort.split('-');
      const params: Record<string, any> = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (platform !== 'all') params.platform = platform;
      if (category !== 'all') params.category = category;
      if (minPrice) params.minPrice = parseInt(minPrice, 10);
      if (maxPrice) params.maxPrice = parseInt(maxPrice, 10);
      if (minFollowers) params.minFollowers = parseInt(minFollowers, 10);
      if (maxFollowers) params.maxFollowers = parseInt(maxFollowers, 10);

      const response = await listingsApi.getAll(params);
      const apiListings = response.data?.data || response.data?.listings || [];
      const normalized = apiListings.map((l: any) => ({
        id: l.id,
        title: l.title || l.displayName || l.username,
        description: l.description || '',
        platform: l.platform,
        price: l.price,
        followers: l.followers || l.metrics?.followers || 0,
        engagement: l.engagement || l.metrics?.engagementRate || l.metrics?.engagement || 0,
        category: l.category || l.niche || 'general',
        images: l.images || l.screenshots || [],
        seller: l.seller || { id: l.sellerId, username: l.sellerUsername || 'seller' },
        createdAt: l.createdAt,
      }));
      setListings(normalized);
      setTotalPages(response.data?.meta?.totalPages || response.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      // For demo, set some sample data
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [search, platform, category, minPrice, maxPrice, minFollowers, maxFollowers, sort, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (platform !== 'all') params.set('platform', platform);
    if (category !== 'all') params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minFollowers) params.set('minFollowers', minFollowers);
    if (maxFollowers) params.set('maxFollowers', maxFollowers);
    if (sort !== 'createdAt-desc') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());

    const queryString = params.toString();
    router.push(`/browse${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  }, [search, platform, category, minPrice, maxPrice, minFollowers, maxFollowers, sort, page, router]);

  useEffect(() => {
    updateUrl();
  }, [platform, category, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateUrl();
    fetchListings();
  };

  const clearFilters = () => {
    setSearch('');
    setPlatform('all');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setMinFollowers('');
    setMaxFollowers('');
    setSort('createdAt-desc');
    setPage(1);
  };

  const hasActiveFilters =
    platform !== 'all' ||
    category !== 'all' ||
    minPrice ||
    maxPrice ||
    minFollowers ||
    maxFollowers;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Accounts</h1>
        <p className="text-muted-foreground">
          Discover verified social media accounts for sale
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {
                  [
                    platform !== 'all',
                    category !== 'all',
                    minPrice,
                    maxPrice,
                    minFollowers,
                    maxFollowers,
                  ].filter(Boolean).length
                }
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p === 'all' ? 'All Platforms' : getPlatformName(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c === 'all'
                            ? 'All Categories'
                            : c.charAt(0).toUpperCase() + c.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Followers Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minFollowers}
                      onChange={(e) => setMinFollowers(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxFollowers}
                      onChange={(e) => setMaxFollowers(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
                <Button onClick={() => { setPage(1); fetchListings(); }}>
                  Apply filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort and results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${listings.length} accounts found`}
          </p>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button onClick={clearFilters}>Clear all filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                      {listing.images?.[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PlatformIcon platform={listing.platform} size={48} />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2">
                        {getPlatformName(listing.platform)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatNumber(listing.followers)} followers</span>
                      <span>{listing.engagement}% engagement</span>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="p-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(listing.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      by @{listing.seller?.username}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
