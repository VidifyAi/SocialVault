import { Search, Book, MessageCircle, CreditCard, Shield, Users, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const categories = [
  {
    icon: Users,
    title: 'Getting Started',
    description: 'Learn the basics of using SocialSwapr',
    articles: [
      { title: 'Creating your account', href: '#' },
      { title: 'Setting up your profile', href: '#' },
      { title: 'How to browse listings', href: '#' },
      { title: 'Understanding account metrics', href: '#' },
    ],
  },
  {
    icon: Book,
    title: 'Buying Accounts',
    description: 'Everything about purchasing accounts',
    articles: [
      { title: 'How to make an offer', href: '#' },
      { title: 'Understanding the escrow process', href: '#' },
      { title: 'Verifying account access', href: '#' },
      { title: 'Completing a purchase', href: '#' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Selling Accounts',
    description: 'Guide to listing and selling accounts',
    articles: [
      { title: 'Creating effective listings', href: '/guides/sellers' },
      { title: 'Verification requirements', href: '/verification' },
      { title: 'Responding to offers', href: '#' },
      { title: 'Transferring account ownership', href: '#' },
    ],
  },
  {
    icon: Shield,
    title: 'Safety & Security',
    description: 'Stay safe while using our platform',
    articles: [
      { title: 'Avoiding scams', href: '#' },
      { title: 'Secure account transfers', href: '#' },
      { title: 'Protecting your information', href: '/privacy' },
      { title: 'Reporting suspicious activity', href: '#' },
    ],
  },
  {
    icon: MessageCircle,
    title: 'Communication',
    description: 'Messaging and negotiations',
    articles: [
      { title: 'Using the messaging system', href: '#' },
      { title: 'Negotiation best practices', href: '#' },
      { title: 'Communication guidelines', href: '#' },
      { title: 'Blocking users', href: '#' },
    ],
  },
  {
    icon: Settings,
    title: 'Account Settings',
    description: 'Manage your SocialSwapr account',
    articles: [
      { title: 'Updating your profile', href: '#' },
      { title: 'Payment methods', href: '#' },
      { title: 'Notification preferences', href: '#' },
      { title: 'Deleting your account', href: '#' },
    ],
  },
];

const quickLinks = [
  { title: 'FAQs', href: '/faq', icon: HelpCircle },
  { title: 'Contact Us', href: '/contact', icon: MessageCircle },
  { title: 'Dispute Resolution', href: '/disputes', icon: Shield },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Help Center
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to your questions and learn how to get the most out of SocialSwapr.
          </p>
          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link) => (
              <Button key={link.title} variant="outline" asChild>
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Card key={category.title}>
                <CardHeader>
                  <category.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.href}
                          className="text-sm text-muted-foreground hover:text-primary hover:underline"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
