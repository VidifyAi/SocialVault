'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  Shield,
  Copy,
  ExternalLink,
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { transactionsApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  status: string;
  amount: number;
  platformFee: number;
  escrowStatus: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    platform: string;
    price: number;
    transferSteps: string[];
    handle?: string;
  };
  buyer: {
    id: string;
    username: string;
  };
  seller: {
    id: string;
    username: string;
  };
  credentials?: {
    username: string;
    password: string;
    email?: string;
    notes?: string;
  };
}

const statusSteps = [
  { key: 'payment_pending', label: 'Payment Pending' },
  { key: 'payment_confirmed', label: 'Payment Confirmed' },
  { key: 'transfer_pending', label: 'Transfer In Progress' },
  { key: 'verification_pending', label: 'Verification' },
  { key: 'completed', label: 'Completed' },
];

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  pending: 'warning',
  payment_pending: 'warning',
  payment_confirmed: 'secondary',
  in_progress: 'default',
  transfer_pending: 'default',
  verification_pending: 'default',
  completed: 'success',
  disputed: 'destructive',
  cancelled: 'secondary',
  refunded: 'secondary',
};

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);

  const isBuyer = user?.id === transaction?.buyer.id;
  const isSeller = user?.id === transaction?.seller.id;

  useEffect(() => {
    fetchTransaction();
  }, [params.id]);

  const fetchTransaction = async () => {
    try {
      const response = await transactionsApi.getById(params.id as string);
      setTransaction(response.data);
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction',
        variant: 'destructive',
      });
      router.push('/dashboard/transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!confirm('Are you sure you want to confirm the transfer? This will release the payment to the seller.')) return;

    setProcessing(true);
    try {
      await transactionsApi.confirmTransfer(transaction!.id);
      toast({
        title: 'Transfer confirmed!',
        description: 'The payment has been released to the seller.',
      });
      fetchTransaction();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to confirm transfer',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for the dispute',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      await transactionsApi.dispute(transaction!.id, disputeReason);
      toast({
        title: 'Dispute opened',
        description: 'Our team will review your case within 24-48 hours.',
      });
      setShowDisputeDialog(false);
      fetchTransaction();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to open dispute',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.key === transaction?.status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to transactions
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Details</h1>
          <p className="text-muted-foreground">
            {isBuyer ? 'Purchasing' : 'Selling'} • Started{' '}
            {formatRelativeTime(transaction.createdAt)}
          </p>
        </div>
        <Badge
          variant={statusColors[transaction.status] || 'secondary'}
          className="text-sm"
        >
          {transaction.status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Progress steps */}
      {transaction.status !== 'disputed' && transaction.status !== 'cancelled' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const currentIndex = getCurrentStepIndex();
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isCurrent ? 'font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          index < currentIndex ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <PlatformIcon platform={transaction.listing.platform} size={48} />
              <div>
                <h3 className="font-semibold">{transaction.listing.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {getPlatformName(transaction.listing.platform)}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>{formatCurrency(transaction.platformFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(transaction.amount + transaction.platformFee)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <Card>
          <CardHeader>
            <CardTitle>Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buyer</p>
                <Link
                  href={`/user/${transaction.buyer.username}`}
                  className="font-medium hover:underline"
                >
                  @{transaction.buyer.username}
                </Link>
              </div>
              {isBuyer && <Badge>You</Badge>}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Seller</p>
                <Link
                  href={`/user/${transaction.seller.username}`}
                  className="font-medium hover:underline"
                >
                  @{transaction.seller.username}
                </Link>
              </div>
              {isSeller && <Badge>You</Badge>}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/messages">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message {isBuyer ? 'Seller' : 'Buyer'}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Credentials (shown during transfer) */}
        {transaction.credentials && (transaction.status === 'transfer_pending' || transaction.status === 'verification_pending') && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Account Credentials
              </CardTitle>
              <CardDescription>
                Use these credentials to verify and access the account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username / Handle</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {transaction.credentials.username}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(transaction.credentials!.username, 'Username')
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {transaction.credentials.password}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(transaction.credentials!.password, 'Password')
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {transaction.credentials.email && (
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-sm">
                        {transaction.credentials.email}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(transaction.credentials!.email!, 'Email')
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {transaction.credentials.notes && (
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <p className="p-3 bg-muted rounded text-sm">
                    {transaction.credentials.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {isBuyer && transaction.status === 'verification_pending' && (
                <Button onClick={handleConfirmTransfer} disabled={processing}>
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Transfer & Release Payment
                </Button>
              )}

              {['transfer_pending', 'verification_pending'].includes(transaction.status) && (
                <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Open Dispute
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Open a Dispute</DialogTitle>
                      <DialogDescription>
                        Please describe the issue you&apos;re experiencing. Our
                        team will review your case within 24-48 hours.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="Describe the problem..."
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        rows={5}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowDisputeDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDispute}
                        disabled={processing}
                      >
                        {processing && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Submit Dispute
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <Button variant="outline" asChild>
                <Link href={`/listing/${transaction.listing.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Listing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
