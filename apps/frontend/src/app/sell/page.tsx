import { CheckCircle, DollarSign, Shield, Users, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
  {
    icon: DollarSign,
    title: 'Set Your Own Prices',
    description: 'You decide how much your account is worth. We never dictate pricing.',
  },
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'Our escrow system protects you from fraud and ensures you get paid.',
  },
  {
    icon: Users,
    title: 'Verified Buyers',
    description: 'Connect with serious, verified buyers ready to purchase quality accounts.',
  },
  {
    icon: Clock,
    title: 'Fast Payouts',
    description: 'Receive your funds quickly after successful account transfer verification.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Create Your Listing',
    description: 'Provide details about your account including followers, engagement rate, and niche.',
  },
  {
    number: '2',
    title: 'Get Verified',
    description: 'We verify your account ownership and metrics to build buyer trust.',
  },
  {
    number: '3',
    title: 'Receive Offers',
    description: 'Buyers will browse your listing and make offers on your account.',
  },
  {
    number: '4',
    title: 'Complete Transfer',
    description: 'Once you accept an offer, securely transfer the account and get paid.',
  },
];

export default function SellPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Start Selling Your Social Media Accounts
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Turn your social media presence into cash. List your accounts for free 
            and connect with verified buyers on the most trusted marketplace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard/listings/new">
                Create Your Listing <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/guides/sellers">Read Seller Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Sell on SocialSwapr?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <benefit.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Sell Your Account
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            No listing fees, no monthly subscriptions. We only charge a small 5% platform 
            fee when your account successfully sells.
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Full Pricing Details</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of sellers who have successfully sold their accounts on SocialSwapr.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard/listings/new">
              Create Your First Listing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
