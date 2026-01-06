import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email and we\'ll respond within 24 hours',
    contact: 'support@socialswapr.com',
    href: 'mailto:support@socialswapr.com',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    contact: 'Available Mon-Fri, 9AM-6PM IST',
    href: '#',
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'Our typical response time',
    contact: 'Within 24 hours',
    href: '#',
  },
];

const departments = [
  {
    title: 'General Inquiries',
    email: 'info@socialswapr.com',
    description: 'For general questions about our platform',
  },
  {
    title: 'Sales & Enterprise',
    email: 'enterprise@socialswapr.com',
    description: 'For business and enterprise inquiries',
  },
  {
    title: 'Technical Support',
    email: 'support@socialswapr.com',
    description: 'For technical issues and account problems',
  },
  {
    title: 'Disputes',
    email: 'disputes@socialswapr.com',
    description: 'For transaction disputes and resolutions',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions or need assistance? We&apos;re here to help. Reach out to our 
            team through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {contactMethods.map((method) => (
              <Card key={method.title} className="text-center">
                <CardHeader>
                  <method.icon className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle>{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {method.href !== '#' ? (
                    <a
                      href={method.href}
                      className="text-primary font-medium hover:underline"
                    >
                      {method.contact}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{method.contact}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Send Us a Message</h2>
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select a topic...</option>
                      <option value="general">General Inquiry</option>
                      <option value="buying">Buying Help</option>
                      <option value="selling">Selling Help</option>
                      <option value="technical">Technical Issue</option>
                      <option value="dispute">Dispute</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contact by Department</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {departments.map((dept) => (
              <Card key={dept.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{dept.title}</CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={`mailto:${dept.email}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {dept.email}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking for Quick Answers?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Check out our frequently asked questions for instant answers to common queries.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/faq">Browse FAQs</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
