import { Shield, AlertTriangle, CheckCircle, Clock, FileText, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const disputeReasons = [
  'Account access not received',
  'Account metrics don\'t match listing',
  'Account was suspended after transfer',
  'Seller not responding',
  'Payment issues',
  'Other concerns',
];

const steps = [
  {
    icon: FileText,
    title: 'File a Dispute',
    description: 'Go to your transaction page and click "Open Dispute". Provide detailed information about the issue.',
  },
  {
    icon: MessageCircle,
    title: 'Gather Evidence',
    description: 'Upload screenshots, messages, and any other evidence supporting your case.',
  },
  {
    icon: Clock,
    title: 'Review Process',
    description: 'Our team reviews all evidence from both parties within 48-72 hours.',
  },
  {
    icon: CheckCircle,
    title: 'Resolution',
    description: 'We make a fair decision and take appropriate action, including refunds if warranted.',
  },
];

const tips = [
  'Always communicate through our platform to maintain a record',
  'Take screenshots of all account metrics before and after transfer',
  'Document any issues immediately when they occur',
  'Respond promptly to requests from our dispute team',
  'Keep all credentials and access information until the dispute is resolved',
];

export default function DisputesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Dispute Resolution
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to fair resolution of disputes. Our dedicated team reviews 
            each case carefully to ensure the best outcome for all parties.
          </p>
        </div>
      </section>

      {/* When to File */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">When to File a Dispute</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">
                  You may file a dispute if you experience any of the following issues:
                </p>
                <ul className="space-y-3">
                  {disputeReasons.map((reason) => (
                    <li key={reason} className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dispute Process */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Dispute Resolution Process</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-sm text-primary font-medium mb-2">Step {index + 1}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeframes */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Resolution Timeframes</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">48h</CardTitle>
                <CardDescription>Dispute Acknowledgment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We acknowledge your dispute within 48 hours of filing.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">72h</CardTitle>
                <CardDescription>Initial Review</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our team completes initial review within 72 hours.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">7 days</CardTitle>
                <CardDescription>Final Resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Most disputes are resolved within 7 days of filing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tips for a Successful Resolution</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need to File a Dispute?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            If you&apos;re experiencing issues with a transaction, we&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard/transactions">Go to Transactions</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
