import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
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
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using SocialSwapr (&quot;the Platform&quot;), you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              SocialSwapr provides a marketplace platform that enables users to buy and sell social 
              media accounts. We act as an intermediary, providing escrow services to protect both 
              buyers and sellers during transactions.
            </p>

            <h2>3. Eligibility</h2>
            <p>You must be at least 18 years old to use our services. By using SocialSwapr, you represent that you:</p>
            <ul>
              <li>Are at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Are not prohibited from using our services under applicable law</li>
              <li>Have the right to sell any accounts you list on the platform</li>
            </ul>

            <h2>4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and 
              for all activities that occur under your account. You agree to notify us immediately 
              of any unauthorized use of your account.
            </p>

            <h2>5. Listing Guidelines</h2>
            <p>When listing accounts for sale, you agree to:</p>
            <ul>
              <li>Provide accurate and truthful information about the account</li>
              <li>Have full ownership and authority to sell the account</li>
              <li>Not misrepresent account metrics, engagement, or history</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not list accounts that have been obtained fraudulently</li>
            </ul>

            <h2>6. Transactions and Escrow</h2>
            <p>
              All transactions on SocialSwapr are processed through our escrow system. Funds are 
              held securely until the buyer confirms receipt of the account. We reserve the right 
              to hold funds during dispute resolution.
            </p>

            <h2>7. Fees and Payments</h2>
            <p>
              Sellers are charged a 5% platform fee on successful transactions. Additional payment 
              processing fees may apply. All fees are non-refundable except as required by law or 
              our refund policy.
            </p>

            <h2>8. Dispute Resolution</h2>
            <p>
              In the event of a dispute, both parties agree to submit to our dispute resolution 
              process. Our team will review evidence from both parties and make a binding decision. 
              Users agree to abide by our dispute resolution decisions.
            </p>

            <h2>9. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for any illegal purpose</li>
              <li>Circumvent the escrow system or conduct off-platform transactions</li>
              <li>Create fake accounts or listings</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Manipulate reviews or ratings</li>
              <li>Upload malicious content or attempt to compromise platform security</li>
            </ul>

            <h2>10. Intellectual Property</h2>
            <p>
              All content, features, and functionality of SocialSwapr are owned by us and are 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2>11. Disclaimer of Warranties</h2>
            <p>
              SocialSwapr is provided &quot;as is&quot; without warranties of any kind. We do not guarantee 
              the accuracy of listings, the behavior of users, or the outcome of transactions. 
              We are not responsible for any social media platform&apos;s terms of service.
            </p>

            <h2>12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SocialSwapr shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages resulting from 
              your use of the platform.
            </p>

            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless SocialSwapr and its officers, directors, 
              employees, and agents from any claims, damages, or expenses arising from your use 
              of the platform or violation of these terms.
            </p>

            <h2>14. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violations 
              of these terms or for any other reason at our sole discretion.
            </p>

            <h2>15. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the platform after changes 
              constitutes acceptance of the modified terms.
            </p>

            <h2>16. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable laws, 
              without regard to conflict of law principles.
            </p>

            <h2>17. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <Link href="mailto:legal@socialswapr.com" className="text-primary hover:underline">
                legal@socialswapr.com
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
