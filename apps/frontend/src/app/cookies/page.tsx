import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation, secure area access, and remembering your preferences.',
    examples: ['Session ID', 'Authentication tokens', 'Security cookies'],
    canDisable: false,
  },
  {
    name: 'Functional Cookies',
    description: 'These cookies enhance the functionality of our website by storing your preferences and settings.',
    examples: ['Language preferences', 'Theme settings', 'Recently viewed items'],
    canDisable: true,
  },
  {
    name: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website by collecting anonymous data.',
    examples: ['Google Analytics', 'Page visit statistics', 'User journey tracking'],
    canDisable: true,
  },
  {
    name: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
    examples: ['Advertising cookies', 'Social media cookies', 'Retargeting cookies'],
    canDisable: true,
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Cookie className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-gray dark:prose-invert mb-12">
              <h2>What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit a website. 
                They are widely used to make websites work more efficiently and provide information 
                to website owners.
              </p>

              <h2>How We Use Cookies</h2>
              <p>
                SocialSwapr uses cookies and similar technologies to improve your browsing experience, 
                analyze site traffic, personalize content, and serve targeted advertisements. This 
                policy explains the types of cookies we use and how you can manage them.
              </p>
            </div>

            {/* Cookie Types */}
            <h2 className="text-2xl font-bold mb-6">Types of Cookies We Use</h2>
            <div className="space-y-6 mb-12">
              {cookieTypes.map((cookie) => (
                <Card key={cookie.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {cookie.name}
                      <span className={`text-sm font-normal px-2 py-1 rounded ${cookie.canDisable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}>
                        {cookie.canDisable ? 'Optional' : 'Required'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{cookie.description}</p>
                    <div>
                      <span className="text-sm font-medium">Examples: </span>
                      <span className="text-sm text-muted-foreground">
                        {cookie.examples.join(', ')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="prose prose-gray dark:prose-invert">
              <h2>Third-Party Cookies</h2>
              <p>
                In addition to our own cookies, we may also use various third-party cookies to 
                report usage statistics, deliver advertisements, and so on. These cookies are 
                governed by the respective third parties&apos; privacy policies.
              </p>

              <h2>Managing Cookies</h2>
              <p>
                Most web browsers allow you to manage cookies through their settings. You can:
              </p>
              <ul>
                <li>Delete all cookies from your browser</li>
                <li>Block all cookies from being set</li>
                <li>Allow all cookies to be set</li>
                <li>Block third-party cookies</li>
                <li>Clear all cookies when you close the browser</li>
                <li>Open a &quot;private browsing&quot; / &quot;incognito&quot; session</li>
              </ul>

              <p>
                Please note that blocking certain cookies may impact your experience on our website 
                and limit the services we can provide.
              </p>

              <h2>Browser Settings</h2>
              <p>
                Here are links to cookie management instructions for popular browsers:
              </p>
              <ul>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>

              <h2>Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in technology, 
                legislation, or our data practices. Any changes will be posted on this page with an 
                updated revision date.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about our use of cookies, please contact us at{' '}
                <Link href="mailto:privacy@socialswapr.com" className="text-primary hover:underline">
                  privacy@socialswapr.com
                </Link>
                .
              </p>

              <h2>Related Policies</h2>
              <p>
                For more information about how we handle your data, please see our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
