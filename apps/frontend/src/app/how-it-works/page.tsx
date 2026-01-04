import { CheckCircle, Shield, MessageSquare, CreditCard, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    number: '01',
    title: 'Browse Listings',
    description: 'Explore verified social media accounts across Instagram, TikTok, YouTube, Twitter, and more. Filter by platform, followers, engagement rate, and price.',
    icon: FileCheck,
  },
  {
    number: '02',
    title: 'Make an Offer',
    description: 'Found an account you like? Submit an offer to the seller. You can negotiate the price or accept the listed amount.',
    icon: MessageSquare,
  },
  {
    number: '03',
    title: 'Secure Escrow Payment',
    description: 'Once both parties agree, the buyer makes a payment that\'s held securely in escrow. The seller only receives payment after successful transfer.',
    icon: CreditCard,
  },
  {
    number: '04',
    title: 'Account Transfer',
    description: 'The seller transfers the account credentials to the buyer. Both parties confirm the transfer is complete through our platform.',
    icon: ArrowRight,
  },
  {
    number: '05',
    title: 'Verification & Release',
    description: 'After the buyer verifies full access to the account, the funds are released to the seller. Both parties can leave reviews.',
    icon: CheckCircle,
  },
];

const forBuyers = [
  'Verified account metrics and authenticity',
  'Secure escrow payment protection',
  'Direct communication with sellers',
  'Dispute resolution support',
  'Full ownership transfer guarantee',
];

const forSellers = [
  'List your accounts for free',
  'Set your own prices',
  'Receive payments securely',
  'Build reputation with reviews',
  'Access to serious buyers only',
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            How SocialSwapr Works
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Buy and sell social media accounts safely with our secure escrow system. 
            We protect both buyers and sellers throughout the entire transaction.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple 5-Step Process
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{step.number}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-border mx-auto mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <step.icon className="h-5 w-5 text-primary" />
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Benefits for Everyone
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  For Buyers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {forBuyers.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  For Sellers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {forSellers.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Your Security is Our Priority
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            All transactions are protected by our escrow system. Funds are only released 
            when both parties confirm a successful transfer. Our dispute resolution team 
            is available 24/7 to help with any issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/browse">Browse Accounts</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard/listings/new">Sell Your Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
