import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqCategories = [
  {
    category: 'General',
    questions: [
      {
        question: 'What is SocialSwapr?',
        answer: 'SocialSwapr is a trusted marketplace for buying and selling social media accounts. We provide a secure platform with escrow protection to ensure safe transactions for both buyers and sellers.',
      },
      {
        question: 'Is it legal to buy and sell social media accounts?',
        answer: 'The legality varies by platform and jurisdiction. While most social media platforms\' terms of service prohibit account transfers, many users still engage in account trading. We recommend reviewing each platform\'s terms before proceeding.',
      },
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the navigation bar and follow the registration process. You\'ll need to provide a valid email address and create a password.',
      },
    ],
  },
  {
    category: 'Buying',
    questions: [
      {
        question: 'How do I purchase an account?',
        answer: 'Browse our listings, find an account you\'re interested in, and click "Make Offer" or "Buy Now". Once the seller accepts, you\'ll complete payment through our secure escrow system.',
      },
      {
        question: 'How is my payment protected?',
        answer: 'We use an escrow system where your payment is held securely until you confirm receipt of the account. If there\'s any issue, you can open a dispute and our team will help resolve it.',
      },
      {
        question: 'What if the account is not as described?',
        answer: 'If the account differs significantly from the listing description, you can open a dispute within 48 hours of receiving access. Our team will review the case and issue a refund if warranted.',
      },
      {
        question: 'How do I verify an account before purchasing?',
        answer: 'All listings include verified metrics such as follower count, engagement rate, and account age. Look for verified badges on listings for additional assurance.',
      },
    ],
  },
  {
    category: 'Selling',
    questions: [
      {
        question: 'How do I list my account for sale?',
        answer: 'Go to your dashboard and click "Create Listing". Fill in the account details, upload screenshots of your analytics, and set your price. Our team will verify the listing before it goes live.',
      },
      {
        question: 'What fees does SocialSwapr charge?',
        answer: 'We charge a 5% platform fee on successful sales. There are no listing fees or monthly subscriptions. Payment processing fees (2-3%) may also apply.',
      },
      {
        question: 'How do I get paid?',
        answer: 'Once the buyer confirms receipt of the account, the funds (minus our platform fee) are released to your account. You can then withdraw to your bank account or other payment method.',
      },
      {
        question: 'How long does the verification process take?',
        answer: 'Basic verification typically takes 24-48 hours. Premium verification may take longer but provides enhanced trust badges on your listings.',
      },
    ],
  },
  {
    category: 'Security & Trust',
    questions: [
      {
        question: 'How does the escrow system work?',
        answer: 'When a buyer makes a purchase, the payment is held in escrow. The seller then transfers the account. Once the buyer confirms they have full access, the funds are released to the seller.',
      },
      {
        question: 'What happens if there\'s a dispute?',
        answer: 'Both parties can open a dispute through the transaction page. Our team reviews all evidence and makes a fair decision, typically within 48-72 hours.',
      },
      {
        question: 'How do you prevent fraud?',
        answer: 'We verify all accounts before listing, use secure escrow payments, monitor transactions for suspicious activity, and maintain a rating system to build trust.',
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Yes, we use industry-standard encryption and security practices. We never share your personal information with third parties without your consent.',
      },
    ],
  },
  {
    category: 'Payments',
    questions: [
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept credit/debit cards, UPI, net banking, and digital wallets through our payment partner Razorpay. Available methods may vary by region.',
      },
      {
        question: 'When are funds released to sellers?',
        answer: 'Funds are released once the buyer confirms successful account transfer. If no confirmation is received within 7 days and no dispute is opened, funds are automatically released.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are processed if a dispute is resolved in favor of the buyer, or if a transaction is cancelled before the account transfer begins.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about buying and selling social media 
            accounts on SocialSwapr.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq) => (
                    <Card key={faq.question}>
                      <CardHeader>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Can&apos;t find the answer you&apos;re looking for? Our support team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link href="/help">Help Center</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
