import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const tiers = [
  {
    name: 'Buyer',
    description: 'For individuals looking to purchase social media accounts',
    price: 'Free',
    priceDetail: 'No listing fees',
    features: [
      { text: 'Browse all listings', included: true },
      { text: 'Make offers on accounts', included: true },
      { text: 'Secure escrow payments', included: true },
      { text: 'Direct messaging with sellers', included: true },
      { text: 'Dispute resolution support', included: true },
      { text: 'Transaction history', included: true },
    ],
    cta: 'Start Buying',
    href: '/browse',
    popular: false,
  },
  {
    name: 'Seller',
    description: 'For individuals selling their social media accounts',
    price: '5%',
    priceDetail: 'Platform fee on successful sales',
    features: [
      { text: 'List unlimited accounts', included: true },
      { text: 'Set your own prices', included: true },
      { text: 'Receive offers from buyers', included: true },
      { text: 'Secure payment processing', included: true },
      { text: 'Analytics & insights', included: true },
      { text: 'Priority customer support', included: true },
    ],
    cta: 'Start Selling',
    href: '/dashboard/listings/new',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For agencies and businesses with high-volume needs',
    price: 'Custom',
    priceDetail: 'Contact us for pricing',
    features: [
      { text: 'Everything in Seller plan', included: true },
      { text: 'Reduced platform fees', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'API access', included: true },
      { text: 'Bulk listing tools', included: true },
      { text: 'Custom contracts', included: true },
    ],
    cta: 'Contact Sales',
    href: 'mailto:enterprise@socialswapr.com',
    popular: false,
  },
];

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including credit/debit cards, UPI, net banking, and wallets through our secure payment partner Razorpay.',
  },
  {
    question: 'How does the escrow system work?',
    answer: 'When a buyer makes a purchase, the payment is held securely in escrow. The funds are only released to the seller after the buyer confirms they have received full access to the account.',
  },
  {
    question: 'What happens if there\'s a dispute?',
    answer: 'Our dedicated dispute resolution team reviews all evidence from both parties and makes a fair decision. We aim to resolve all disputes within 48-72 hours.',
  },
  {
    question: 'Are there any hidden fees?',
    answer: 'No hidden fees! Buyers pay no platform fees. Sellers pay a 5% platform fee only on successful sales. Payment processing fees (2-3%) may apply depending on your payment method.',
  },
  {
    question: 'How do I verify an account is legitimate?',
    answer: 'All listings include verified metrics such as follower count, engagement rate, and account age. We also display seller ratings and transaction history to help you make informed decisions.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            No subscription required. Pay only when you make a sale.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <p className="text-sm text-muted-foreground mt-1">{tier.priceDetail}</p>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Breakdown */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fee Breakdown
          </h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Buyer Fee</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Listing Fee</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Platform Fee (on successful sale)</span>
                    <span className="font-semibold">5%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Payment Processing</span>
                    <span className="font-semibold">2-3% (varies by method)</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span>Minimum Platform Fee</span>
                    <span className="font-semibold">₹100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of users buying and selling social media accounts securely on SocialSwapr.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/browse">Browse Accounts</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
