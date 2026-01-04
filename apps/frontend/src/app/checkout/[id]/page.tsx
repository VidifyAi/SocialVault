'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Lock,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { listingsApi, transactionsApi } from '@/lib/api';
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
  seller: {
    id: string;
    username: string;
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const platformFee = listing ? listing.price * 0.05 : 0;
  const total = listing ? listing.price + platformFee : 0;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/checkout/${params.id}`);
      return;
    }

    const fetchListing = async () => {
      try {
        const response = await listingsApi.getById(params.id as string);
        const listingData = response.data.data;
        setListing(listingData);

        if (listingData.seller.id === user?.id) {
          toast({
            title: 'Error',
            description: "You can't purchase your own listing",
            variant: 'destructive',
          });
          router.push(`/listing/${params.id}`);
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        toast({
          title: 'Error',
          description: 'Failed to load listing',
          variant: 'destructive',
        });
        router.push('/browse');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id, isAuthenticated, user, router, toast]);

  const handleCheckout = async () => {
    if (!agreedToTerms) {
      toast({
        title: 'Terms required',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await transactionsApi.create(listing!.id);
      toast({
        title: 'Transaction created!',
        description: 'You will be redirected to complete the payment.',
      });
      router.push(`/dashboard/transactions/${response.data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transaction',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order summary */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <PlatformIcon platform={listing.platform} size={48} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">
                      {getPlatformName(listing.platform)}
                    </Badge>
                    <span>{formatNumber(listing.followers)} followers</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account price</span>
                  <span>{formatCurrency(listing.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fee (5%)</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Seller</p>
                <p>@{listing.seller.username}</p>
              </div>
            </CardContent>
          </Card>

          {/* Protection info */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Buyer Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Your payment is held in escrow until you verify and accept
                    the account transfer. If anything goes wrong, you&apos;re
                    protected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment form */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
              <CardDescription>
                All transactions are secure and encrypted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment method selection */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Credit / Debit Card</p>
                    <p className="text-sm text-muted-foreground">
                      Visa, Mastercard, American Express
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    disabled={processing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      disabled={processing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      disabled={processing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    disabled={processing}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand that my payment will be held in escrow until
                  the account transfer is complete.
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={processing || !agreedToTerms}
              >
                {processing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Pay {formatCurrency(total)}
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Payments secured by 256-bit SSL encryption</span>
              </div>
            </CardFooter>
          </Card>

          {/* Warning */}
          <Card className="mt-4 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Important</p>
                  <p className="text-muted-foreground">
                    Never communicate or exchange payment outside of our
                    platform. Doing so may result in loss of buyer protection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
