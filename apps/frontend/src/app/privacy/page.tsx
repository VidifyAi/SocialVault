import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
            <h2>1. Introduction</h2>
            <p>
              SocialSwapr (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This 
              Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our platform.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li>Name and email address</li>
              <li>Phone number</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Profile information you provide</li>
              <li>Government ID (for verification purposes)</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you use our platform, we automatically collect:</p>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Usage data and browsing patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process transactions and payments</li>
              <li>Verify user identity and account ownership</li>
              <li>Communicate with you about transactions and updates</li>
              <li>Improve our platform and user experience</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Other Users:</strong> Limited information is shared with transaction counterparties</li>
              <li><strong>Service Providers:</strong> Third parties who help us operate our platform</li>
              <li><strong>Payment Processors:</strong> To process transactions securely</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments</li>
              <li>Access controls and monitoring</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your personal information</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide our services and comply 
              with legal obligations. Transaction records are kept for a minimum of 7 years for 
              regulatory compliance.
            </p>

            <h2>8. International Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our platform is not intended for users under 18 years of age. We do not knowingly 
              collect information from children. If we become aware of such collection, we will 
              delete the information promptly.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              Our platform may contain links to third-party websites. We are not responsible for 
              the privacy practices of these websites. We encourage you to review their privacy 
              policies.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant 
              changes via email or platform notification. Your continued use of the platform 
              constitutes acceptance of the updated policy.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please 
              contact us at{' '}
              <Link href="mailto:privacy@socialswapr.com" className="text-primary hover:underline">
                privacy@socialswapr.com
              </Link>
              .
            </p>

            <h2>13. Cookie Policy</h2>
            <p>
              For detailed information about how we use cookies and similar technologies, please 
              see our{' '}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
