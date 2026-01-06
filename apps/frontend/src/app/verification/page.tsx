import { Shield, CheckCircle, BadgeCheck, Eye, Lock, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const verificationTypes = [
  {
    icon: BadgeCheck,
    title: 'Account Ownership',
    description: 'We verify that you have full ownership and control of the account you\'re listing.',
    details: [
      'Confirm login access to the account',
      'Verify email/phone number ownership',
      'Check account settings access',
    ],
  },
  {
    icon: Eye,
    title: 'Metrics Verification',
    description: 'We verify that the metrics displayed on your listing match the actual account.',
    details: [
      'Follower count verification',
      'Engagement rate analysis',
      'Account age confirmation',
    ],
  },
  {
    icon: FileCheck,
    title: 'Content Review',
    description: 'We review the account content to ensure it meets our community guidelines.',
    details: [
      'Content appropriateness check',
      'Copyright compliance review',
      'Policy violation screening',
    ],
  },
];

const verificationLevels = [
  {
    level: 'Basic',
    description: 'Standard verification for all listings',
    features: ['Account ownership verification', 'Basic metrics check', 'Content review'],
    color: 'bg-blue-500',
  },
  {
    level: 'Verified',
    description: 'Enhanced verification with badge display',
    features: ['All Basic features', 'Analytics screenshot review', 'Verified badge on listing'],
    color: 'bg-green-500',
  },
  {
    level: 'Premium',
    description: 'Comprehensive verification for high-value accounts',
    features: ['All Verified features', 'Live verification call', 'Priority listing placement'],
    color: 'bg-purple-500',
  },
];

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Account Verification
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our verification process ensures that all accounts listed on SocialSwapr 
            are legitimate, accurately represented, and safe to purchase.
          </p>
        </div>
      </section>

      {/* What We Verify */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What We Verify</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {verificationTypes.map((type) => (
              <Card key={type.title}>
                <CardHeader>
                  <type.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Levels */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Verification Levels</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {verificationLevels.map((level) => (
              <Card key={level.level} className="relative overflow-hidden">
                <div className={`h-2 ${level.color}`} />
                <CardHeader>
                  <CardTitle>{level.level}</CardTitle>
                  <CardDescription>{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {level.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How Verification Works</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <h3 className="font-semibold">Submit Your Listing</h3>
                      <p className="text-sm text-muted-foreground">Create your listing with all required information and screenshots.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <div>
                      <h3 className="font-semibold">Verification Request</h3>
                      <p className="text-sm text-muted-foreground">Our team reviews your submission and may request additional verification.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <div>
                      <h3 className="font-semibold">Complete Verification</h3>
                      <p className="text-sm text-muted-foreground">Follow the verification steps to prove account ownership and metrics accuracy.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">4</div>
                    <div>
                      <h3 className="font-semibold">Get Verified Badge</h3>
                      <p className="text-sm text-muted-foreground">Once verified, your listing receives a badge indicating its verification status.</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Security is Our Priority</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            All verification data is encrypted and stored securely. We never share your 
            personal information or account credentials with anyone.
          </p>
          <Button asChild>
            <Link href="/privacy">View Privacy Policy</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Verified?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Create your listing and start the verification process today.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard/listings/new">Create Listing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
