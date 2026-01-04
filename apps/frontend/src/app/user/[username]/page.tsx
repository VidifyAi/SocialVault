'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  CheckCircle,
  Star,
  Calendar,
  Package,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';
import { formatCurrency, formatNumber, formatRelativeTime, getInitials } from '@/lib/utils';
import { usersApi, reviewsApi, listingsApi } from '@/lib/api';

interface UserProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  stats: {
    totalListings: number;
    totalSales: number;
    averageRating: number;
    totalReviews: number;
  };
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface Listing {
  id: string;
  title: string;
  platform: string;
  price: number;
  followers: number;
  status: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          usersApi.getPublicProfile(params.username as string),
          reviewsApi.getForUser(params.username as string),
        ]);

        setProfile(profileRes.data);
        setReviews(reviewsRes.data.reviews || []);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.username) {
      fetchData();
    }
  }, [params.username]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-muted-foreground mb-4">
          This user doesn&apos;t exist or their profile is private.
        </p>
        <Button asChild>
          <Link href="/browse">Browse accounts</Link>
        </Button>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.firstName || profile.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-xl font-bold">@{profile.username}</h1>
                  {profile.isVerified && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                {(profile.firstName || profile.lastName) && (
                  <p className="text-muted-foreground">
                    {profile.firstName} {profile.lastName}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-sm mt-4 text-muted-foreground">
                    {profile.bio}
                  </p>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Member since</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">Completed sales</span>
                  </div>
                  <span className="text-sm font-medium">
                    {profile.stats?.totalSales || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">Average rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">
                      {profile.stats?.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                    {profile.stats?.averageRating && renderStars(profile.stats.averageRating)}
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">
                Reviews ({profile.stats?.totalReviews || 0})
              </TabsTrigger>
              <TabsTrigger value="listings">
                Active Listings ({profile.stats?.totalListings || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-4 space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No reviews yet</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.reviewer.avatarUrl} />
                          <AvatarFallback>
                            {getInitials(review.reviewer.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                @{review.reviewer.username}
                              </span>
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatRelativeTime(review.createdAt)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="listings" className="mt-4 space-y-4">
              {listings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No active listings</p>
                  </CardContent>
                </Card>
              ) : (
                listings.map((listing) => (
                  <Link key={listing.id} href={`/listing/${listing.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <PlatformIcon platform={listing.platform} size={40} />
                          <div className="flex-1">
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getPlatformName(listing.platform)} •{' '}
                              {formatNumber(listing.followers)} followers
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(listing.price)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
