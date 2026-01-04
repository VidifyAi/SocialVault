'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlatformIcon } from '@/components/platform-icon';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { offersApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Offer {
  id: string;
  amount: number;
  message?: string;
  status: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    platform: string;
    price: number;
  };
  buyer: {
    id: string;
    username: string;
  };
  seller: {
    id: string;
    username: string;
  };
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'destructive',
  countered: 'default',
  withdrawn: 'secondary',
  expired: 'secondary',
};

export default function OffersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [counterDialogOpen, setCounterDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [activeTab]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await offersApi.getMyOffers(activeTab);
      setOffers(response.data.offers || []);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (offerId: string, action: 'accept' | 'reject' | 'counter', counterAmt?: number) => {
    setProcessing(true);
    try {
      await offersApi.respond(offerId, action, counterAmt);
      toast({
        title: action === 'accept' ? 'Offer accepted!' : action === 'reject' ? 'Offer rejected' : 'Counter offer sent',
        description: action === 'accept' 
          ? 'A transaction has been created. Check your transactions.'
          : action === 'counter'
          ? 'The buyer will be notified of your counter offer.'
          : 'The offer has been declined.',
      });
      fetchOffers();
      setCounterDialogOpen(false);
      setSelectedOffer(null);
      setCounterAmount('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to respond to offer',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async (offerId: string) => {
    if (!confirm('Are you sure you want to withdraw this offer?')) return;
    
    setProcessing(true);
    try {
      await offersApi.withdraw(offerId);
      toast({
        title: 'Offer withdrawn',
        description: 'Your offer has been withdrawn.',
      });
      fetchOffers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to withdraw offer',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openCounterDialog = (offer: Offer) => {
    setSelectedOffer(offer);
    setCounterAmount(offer.listing.price.toString());
    setCounterDialogOpen(true);
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
      <div>
        <h1 className="text-3xl font-bold">Offers</h1>
        <p className="text-muted-foreground">Manage your offers</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {offers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold mb-2">No offers found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'received'
                    ? "You haven't received any offers yet."
                    : "You haven't made any offers yet."}
                </p>
                {activeTab === 'sent' && (
                  <Button asChild>
                    <Link href="/browse">Browse accounts</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <PlatformIcon
                          platform={offer.listing?.platform || 'other'}
                          size={40}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/listing/${offer.listing.id}`}
                            className="font-semibold hover:underline truncate"
                          >
                            {offer.listing.title}
                          </Link>
                          <Badge variant={statusColors[offer.status] || 'secondary'}>
                            {offer.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {activeTab === 'received'
                              ? `From @${offer.buyer.username}`
                              : `To @${offer.seller.username}`}
                          </span>
                          <span>{formatRelativeTime(offer.createdAt)}</span>
                        </div>
                        {offer.message && (
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {offer.message}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">
                          {formatCurrency(offer.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Listed: {formatCurrency(offer.listing.price)}
                        </div>
                      </div>
                      {offer.status === 'pending' && (
                        <div className="flex gap-2">
                          {activeTab === 'received' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleRespond(offer.id, 'accept')}
                                disabled={processing}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openCounterDialog(offer)}
                                disabled={processing}
                              >
                                Counter
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRespond(offer.id, 'reject')}
                                disabled={processing}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWithdraw(offer.id)}
                              disabled={processing}
                            >
                              Withdraw
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Counter offer dialog */}
      <Dialog open={counterDialogOpen} onOpenChange={setCounterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
            <DialogDescription>
              Send a counter offer to the buyer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Original Offer</Label>
              <p className="font-bold">{formatCurrency(selectedOffer?.amount || 0)}</p>
            </div>
            <div className="space-y-2">
              <Label>Your Counter Amount (USD)</Label>
              <Input
                type="number"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCounterDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleRespond(selectedOffer!.id, 'counter', parseInt(counterAmount))
              }
              disabled={processing || !counterAmount}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Counter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
