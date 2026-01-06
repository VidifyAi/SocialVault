import { CheckCircle, Camera, FileText, Shield, MessageSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    icon: FileText,
    title: 'Creating an Effective Listing',
    content: [
      'Use high-quality screenshots of your account analytics',
      'Be honest about your follower count and engagement rates',
      'Describe your account niche and target audience clearly',
      'Include information about monetization history if applicable',
      'Set a competitive price based on market research',
    ],
  },
  {
    icon: Camera,
    title: 'Account Verification',
    content: [
      'Verify your ownership through our secure verification process',
      'Provide accurate metrics that can be independently verified',
      'Keep your account active during the listing period',
      'Be prepared to share additional verification if requested',
      'Maintain account security until transfer is complete',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Communicating with Buyers',
    content: [
      'Respond to inquiries promptly and professionally',
      'Answer questions honestly and thoroughly',
      'Use our secure messaging system for all communications',
      'Never share account credentials before payment is secured',
      'Be open to reasonable negotiations on price',
    ],
  },
  {
    icon: Shield,
    title: 'Safe Account Transfer',
    content: [
      'Only transfer after payment is confirmed in escrow',
      'Change the email to buyer\'s email first, then password',
      'Remove any linked payment methods before transfer',
      'Provide all necessary credentials and recovery information',
      'Confirm transfer completion through the platform',
    ],
  },
];

const tips = [
  'Price your account competitively - research similar listings before setting your price',
  'High-quality screenshots of analytics help buyers make decisions faster',
  'Accounts with consistent posting history sell for premium prices',
  'Respond to buyer inquiries within 24 hours to increase sale chances',
  'Be transparent about any limitations or issues with the account',
];

const warnings = [
  'Never communicate with buyers outside our platform',
  'Never share credentials before payment is secured in escrow',
  'Never accept direct payments - always use our escrow system',
  'Never create fake engagement or misleading metrics',
];

export default function SellerGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Seller Guide
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know to successfully sell your social media accounts 
            on SocialSwapr. Follow these best practices for the best results.
          </p>
        </div>
      </section>

      {/* Main Guide Sections */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <section.icon className="h-6 w-6 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pro Tips for Sellers</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Warnings Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Important Safety Warnings</h2>
          <div className="max-w-3xl mx-auto">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {warnings.map((warning) => (
                    <li key={warning} className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Put your knowledge into action and create your first listing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard/listings/new">Create Listing</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
