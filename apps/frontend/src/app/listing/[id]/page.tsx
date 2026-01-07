'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Share2,
  Shield,
  Users,
  TrendingUp,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';
import { formatCurrency, formatNumber, formatRelativeTime, getInitials } from '@/lib/utils';
import { listingsApi, offersApi, messagesApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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
  accountAge: string;
  monthlyRevenue?: number;
  verificationStatus?: string;
  status: string;
  transferSteps: string[];
  seller: {
    id: string;
    username: string;
    avatarUrl?: string;
    createdAt: string;
    _count?: {
      sellerTransactions: number;
    };
  };
  createdAt: string;
  stats?: {
    views: number;
    saves: number;
    offers: number;
  };
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await listingsApi.getById(params.id as string);
        // response.data is the axios response body: { success, data: listing }
        setListing(response.data.data);
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        toast({
          title: 'Error',
          description: 'Failed to load listing',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id, toast]);

  const handleMakeOffer = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!offerAmount || parseInt(offerAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid offer amount',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingOffer(true);
    try {
      await offersApi.create(
        listing!.id,
        parseInt(offerAmount),
        offerMessage || undefined
      );
      toast({
        title: 'Offer sent!',
        description: 'The seller has been notified of your offer.',
      });
      setShowOfferDialog(false);
      setOfferAmount('');
      setOfferMessage('');
    } catch (error: any) {
      toast({
        title: 'Failed to send offer',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!messageContent.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    setSendingMessage(true);
    try {
      await messagesApi.send(listing!.seller.id, messageContent, listing!.id);
      toast({
        title: 'Message sent!',
        description: 'The seller will receive your message.',
      });
      setShowMessageDialog(false);
      setMessageContent('');
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push(`/checkout/${listing!.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <p className="text-muted-foreground mb-4">
          This listing may have been removed or is no longer available.
        </p>
        <Button onClick={() => router.push('/browse')}>Browse listings</Button>
      </div>
    );
  }

  const isOwner = user?.id === listing.seller.id;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/browse');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column - Images and details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="space-y-4">
            <div className="relative z-0 aspect-video bg-muted rounded-lg overflow-hidden">
              {listing.images?.[selectedImage] ? (
                <img
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlatformIcon platform={listing.platform} size={96} />
                </div>
              )}
              {listing.verificationStatus === 'verified' && (
                <Badge className="absolute top-4 left-4 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PlatformIcon platform={listing.platform} size={24} />
                  <Badge variant="outline">
                    {getPlatformName(listing.platform)}
                  </Badge>
                  <Badge variant="secondary">{listing.category}</Badge>
                </div>
                <h1 className="text-3xl font-bold">{listing.title}</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="transfer">Transfer Process</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {listing.description}
                </p>
              </TabsContent>
              <TabsContent value="stats" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">
                        {formatNumber(listing.followers)}
                      </p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{listing.engagement}%</p>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{listing.accountAge}</p>
                      <p className="text-sm text-muted-foreground">Account Age</p>
                    </CardContent>
                  </Card>
                  {listing.monthlyRevenue && (
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">
                          {formatCurrency(listing.monthlyRevenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monthly Revenue
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="transfer" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Account Transfer Process
                    </CardTitle>
                    <CardDescription>
                      How the account will be transferred to you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {(listing.transferSteps || [
                        'Payment is held in escrow',
                        'Seller provides account credentials',
                        'Buyer verifies account access',
                        'Buyer updates security settings',
                        'Payment is released to seller',
                      ]).map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right column - Purchase card and seller info */}
        <div className="space-y-6">
          {/* Purchase card */}
          <Card className="lg:sticky lg:top-4 lg:z-10">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">
                {formatCurrency(listing.price)}
              </CardTitle>
              <CardDescription>
                Listed {formatRelativeTime(listing.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isOwner && (
                <>
                  <Button className="w-full" size="lg" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          Make Offer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make an Offer</DialogTitle>
                          <DialogDescription>
                            Submit your offer for this account. The seller can
                            accept, decline, or counter your offer.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Offer Amount (USD)</Label>
                            <Input
                              type="number"
                              placeholder={`Listing price: ${formatCurrency(listing.price)}`}
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Message (optional)</Label>
                            <Textarea
                              placeholder="Add a message to your offer..."
                              value={offerMessage}
                              onChange={(e) => setOfferMessage(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowOfferDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleMakeOffer}
                            disabled={submittingOffer}
                          >
                            {submittingOffer && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Offer
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={showMessageDialog}
                      onOpenChange={setShowMessageDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Message Seller</DialogTitle>
                          <DialogDescription>
                            Send a message to @{listing.seller.username}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Textarea
                            placeholder="Type your message..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowMessageDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSendMessage}
                            disabled={sendingMessage}
                          >
                            {sendingMessage && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Message
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
              {isOwner && (
                <div className="space-y-2">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      Edit Listing
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    This is your listing
                  </p>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Buyer protection with escrow</span>
              </div>
            </CardContent>
          </Card>

          {/* Seller info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/user/${listing.seller.username}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={listing.seller.avatarUrl} />
                  <AvatarFallback>
                    {getInitials(listing.seller.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      @{listing.seller.username}
                    </span>
                    {listing.seller.isVerified && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since{' '}
                    {new Date(listing.seller.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              {listing.seller._count && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {listing.seller._count.sellerTransactions} successful sales
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Safety Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Always use the platform&apos;s escrow system</p>
              <p>• Never share personal payment information</p>
              <p>• Verify account access before confirming</p>
              <p>• Report suspicious activity immediately</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
