'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Lock,
  CheckCircle,
  Users,
  Star,
  TrendingUp,
  Award,
  Headphones,
  ChevronDown,
  Eye,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/platform-icon';

const platforms = [
  { name: 'Instagram', id: 'instagram', color: 'from-pink-500 to-purple-500' },
  { name: 'YouTube', id: 'youtube', color: 'from-red-500 to-red-600' },
];

const features = [
  {
    icon: Shield,
    title: 'Secure Escrow',
    description: 'Funds are held safely until transfer is complete and verified.',
  },
  {
    icon: CheckCircle,
    title: 'Verified Accounts',
    description: 'All listings are reviewed and verified before going live.',
  },
  {
    icon: Lock,
    title: 'Safe Transfers',
    description: 'Step-by-step guided transfer process with dedicated support.',
  },
  {
    icon: Users,
    title: 'Trusted Community',
    description: 'Verified sellers with reviews and trust scores.',
  },
];

const stats = [
  { value: '\u20B92Cr+', label: 'Total Volume', icon: TrendingUp },
  { value: '5,000+', label: 'Accounts Sold', icon: Award },
  { value: '98%', label: 'Success Rate', icon: CheckCircle },
  { value: '24/7', label: 'Support', icon: Headphones },
];

const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'Bought Instagram account',
    quote:
      'The escrow system gave me complete peace of mind. The seller was verified and the transfer was seamless. Grew the account 3x in 6 months!',
    rating: 5,
    avatar: 'AM',
  },
  {
    name: 'Priya Sharma',
    role: 'Sold YouTube channel',
    quote:
      'Listed my channel and had a serious buyer within a week. SocialSwapr handled everything \u2014 verification, payment, transfer support. Highly recommend.',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'Rohan Kapoor',
    role: 'Bought YouTube channel',
    quote:
      'Was skeptical at first, but the verified badges and escrow protection convinced me. Got a great channel at a fair price. Smooth process.',
    rating: 4,
    avatar: 'RK',
  },
];

const featuredListings = [
  {
    platform: 'instagram',
    handle: '@life*****ly',
    followers: '125K',
    engagement: '4.2%',
    price: '\u20B92,50,000',
    category: 'Lifestyle',
  },
  {
    platform: 'youtube',
    handle: 'Tech*****ia',
    followers: '89K',
    engagement: '6.1%',
    price: '\u20B94,75,000',
    category: 'Technology',
  },
  {
    platform: 'instagram',
    handle: '@fitn*****on',
    followers: '210K',
    engagement: '3.8%',
    price: '\u20B95,20,000',
    category: 'Fitness',
  },
];

const faqs = [
  {
    q: 'How does the escrow system work?',
    a: 'When a buyer makes a purchase, funds are held securely by SocialSwapr. The seller then transfers the account following our guided process. Once the buyer confirms they have full access, funds are released to the seller.',
  },
  {
    q: 'How are accounts verified?',
    a: 'Every listing goes through a verification process where we confirm account ownership, check follower authenticity, and validate engagement metrics before the listing goes live.',
  },
  {
    q: 'What platforms do you support?',
    a: 'We currently support Instagram and YouTube accounts. We focus on these two platforms to ensure the highest quality verification and transfer experience.',
  },
  {
    q: 'What are the fees?',
    a: 'SocialSwapr charges a 5% platform fee on each transaction, with a minimum of \u20B9100 and a maximum of \u20B95,000. There are no listing fees \u2014 you only pay when a sale is completed.',
  },
  {
    q: 'What if something goes wrong during transfer?',
    a: 'Our dedicated support team is available 24/7 to assist with any transfer issues. If a transfer cannot be completed, the buyer receives a full refund through our escrow system.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left font-medium hover:text-primary transition-colors"
      >
        {q}
        <ChevronDown
          className={`ml-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Floating platform badges */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
                <PlatformIcon
                  platform="instagram"
                  className="h-4 w-4"
                  colored={false}
                  size={16}
                />
                Instagram
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
                <PlatformIcon
                  platform="youtube"
                  className="h-4 w-4"
                  colored={false}
                  size={16}
                />
                YouTube
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Where Digital Influence{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Changes Hands
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              The trusted marketplace for buying and selling social media
              accounts. Secure escrow, verified sellers, and guided transfers.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/browse">
                  Browse Accounts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sell">Start Selling</Link>
              </Button>
            </div>

            {/* Trust line */}
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {['AM', 'PS', 'RK', 'VN', 'SK'].map((initials) => (
                  <div
                    key={initials}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[10px] font-medium text-primary"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span>Trusted by 5,000+ creators</span>
            </div>
          </div>
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-72 w-72 animate-glow rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-72 w-72 animate-glow-delayed rounded-full bg-purple-500/10 blur-[100px]" />
      </section>

      {/* Social Proof Bar */}
      <section className="border-y bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Buttons */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
            BROWSE BY PLATFORM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={`/browse?platform=${platform.id}`}
                className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${platform.color} px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
              >
                <PlatformIcon
                  platform={platform.id as any}
                  className="h-5 w-5"
                  colored={false}
                />
                <span className="font-medium">{platform.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">
              Get started in minutes with our straightforward process.
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connecting line (desktop) */}
            <div className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block" />

            <div className="grid gap-8 md:grid-cols-4">
              {[
                { step: 1, title: 'Browse', desc: 'Find accounts that match your needs' },
                { step: 2, title: 'Purchase', desc: 'Pay securely with escrow protection' },
                { step: 3, title: 'Transfer', desc: 'Follow our guided transfer process' },
                { step: 4, title: 'Own It', desc: 'The account is yours!' },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Choose SocialSwapr</h2>
            <p className="text-muted-foreground">
              Our secure platform ensures safe transactions for both buyers and
              sellers.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">What Our Users Say</h2>
            <p className="text-muted-foreground">
              Join thousands of satisfied buyers and sellers.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < t.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Preview */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Popular Right Now</h2>
            <p className="text-muted-foreground">
              Top listings from verified sellers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredListings.map((listing, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
              >
                {/* Header with platform color */}
                <div
                  className={`flex items-center gap-2 px-4 py-3 ${
                    listing.platform === 'instagram'
                      ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10'
                      : 'bg-gradient-to-r from-red-500/10 to-red-600/10'
                  }`}
                >
                  <PlatformIcon
                    platform={listing.platform}
                    className="h-5 w-5"
                    size={20}
                  />
                  <span className="text-sm font-medium">{listing.handle}</span>
                  <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                    {listing.category}
                  </span>
                </div>

                <div className="p-4">
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <span className="font-medium">{listing.followers}</span>{' '}
                        <span className="text-muted-foreground">followers</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <span className="font-medium">{listing.engagement}</span>{' '}
                        <span className="text-muted-foreground">engagement</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {listing.price}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/browse">View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="ghost" asChild>
              <Link href="/browse">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Buyer vs Seller Split */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Buyer Side */}
            <div className="rounded-xl border bg-card p-8">
              <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">Looking to Buy?</h3>
              <ul className="mb-6 space-y-3">
                {[
                  'Access thousands of verified listings',
                  'Secure escrow protects every purchase',
                  'Detailed analytics and audience insights',
                  'Guided transfer with 24/7 support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild>
                <Link href="/browse">
                  Browse Accounts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Seller Side */}
            <div className="rounded-xl border bg-card p-8">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">Ready to Sell?</h3>
              <ul className="mb-6 space-y-3">
                {[
                  'List your account in minutes for free',
                  'Reach serious, verified buyers',
                  'Get paid securely via Razorpay',
                  'Only 5% fee when you make a sale',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" asChild>
                <Link href="/sell">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about buying and selling on
                SocialSwapr.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6">
              {faqs.map((faq, index) => (
                <FAQItem key={index} q={faq.q} a={faq.a} />
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="ghost" asChild>
                <Link href="/faq">
                  View All FAQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-primary-foreground/80">
            Join thousands of successful buyers and sellers on SocialSwapr.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">Create Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 bg-white/10 text-white hover:bg-white/20"
              asChild
            >
              <Link href="/browse">Browse Listings</Link>
            </Button>
          </div>
          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-primary-foreground/60">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Escrow Protected
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Verified Sellers
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Secure Payments
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
