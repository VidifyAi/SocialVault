import Link from 'next/link';
import { ArrowRight, Shield, Lock, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/platform-icon';

const platforms = [
  { name: 'Instagram', id: 'instagram', color: 'from-pink-500 to-purple-500' },
  { name: 'YouTube', id: 'youtube', color: 'from-red-500 to-red-600' },
  { name: 'TikTok', id: 'tiktok', color: 'from-gray-900 to-gray-800' },
  { name: 'Twitter', id: 'twitter', color: 'from-blue-400 to-blue-500' },
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
    description: 'Step-by-step guided transfer process with support.',
  },
  {
    icon: Users,
    title: 'Trusted Community',
    description: 'Verified sellers with reviews and trust scores.',
  },
];

const stats = [
  { value: '$2.5M+', label: 'Total Volume' },
  { value: '5,000+', label: 'Accounts Sold' },
  { value: '98%', label: 'Success Rate' },
  { value: '24/7', label: 'Support' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Where Digital Influence{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Changes Hands
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              The trusted marketplace for buying and selling social media accounts.
              Secure escrow, verified sellers, and guided transfers.
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
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </section>

      {/* Platform Buttons */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
            BROWSE BY PLATFORM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={`/browse?platform=${platform.id}`}
                className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${platform.color} px-6 py-3 text-white shadow-lg transition-transform hover:scale-105`}
              >
                <PlatformIcon platform={platform.id as any} className="h-5 w-5" colored={false} />
                <span className="font-medium">{platform.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">
              Our secure platform ensures safe transactions for both buyers and sellers.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
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

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Simple Process</h2>
            <p className="text-muted-foreground">
              Get started in minutes with our straightforward process.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { step: '01', title: 'Browse', desc: 'Find accounts that match your needs' },
                { step: '02', title: 'Purchase', desc: 'Pay securely with escrow protection' },
                { step: '03', title: 'Transfer', desc: 'Follow our guided transfer process' },
                { step: '04', title: 'Own It', desc: 'The account is yours!' },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-5xl font-bold text-primary/20">{item.step}</div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  {index < 3 && (
                    <ArrowRight className="absolute right-0 top-8 hidden h-6 w-6 text-muted-foreground/30 md:block" />
                  )}
                </div>
              ))}
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
            <Button size="lg" variant="outline" className="border-white/50 bg-white/10 text-white hover:bg-white/20" asChild>
              <Link href="/browse">Browse Listings</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
