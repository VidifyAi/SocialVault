// Email Service using Resend
// Handles all transactional emails

import { Resend } from 'resend';
import { config } from '../config';
import { logger } from '../utils/logger';

let resend: Resend | null = null;

// Lazy initialization to avoid crashing if API key is missing
const getResendClient = () => {
  if (!resend && config.resendApiKey) {
    resend = new Resend(config.resendApiKey);
  }
  return resend;
};

const FROM_EMAIL = config.emailFrom || 'SocialSwapr <noreply@socialswapr.com>';
const FRONTEND_URL = config.frontendUrl;

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EscrowFundedParams {
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  sellerName: string;
  listingTitle: string;
  amount: number;
  transactionId: string;
}

interface TransactionCompleteParams {
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  sellerName: string;
  listingTitle: string;
  amount: number;
  sellerPayout: number;
  transactionId: string;
}

interface RefundParams {
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  sellerName: string;
  amount: number;
  reason: string;
  transactionId: string;
}

interface DisputeParams {
  userEmail: string;
  userName: string;
  disputeId: string;
  transactionId: string;
  reason: string;
}

interface NewOfferParams {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  listingTitle: string;
  offerAmount: number;
  listingId: string;
}

interface OfferAcceptedParams {
  buyerEmail: string;
  buyerName: string;
  sellerName: string;
  listingTitle: string;
  amount: number;
  transactionId: string;
}

interface NewMessageParams {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  conversationId: string;
  preview: string;
}

class EmailService {
  private async send(params: EmailParams) {
    const client = getResendClient();
    
    if (!client) {
      logger.warn('RESEND_API_KEY not configured - skipping email send', {
        to: params.to,
        subject: params.subject
      });
      return { success: false, error: 'Email service not configured' };
    }
    
    try {
      const result = await client.emails.send({
        from: FROM_EMAIL,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private baseTemplate(content: string, title: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
    .title { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #111; }
    .content { margin-bottom: 24px; }
    .button { display: inline-block; background: #7c3aed; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .button:hover { background: #6d28d9; }
    .footer { text-align: center; margin-top: 32px; color: #666; font-size: 14px; }
    .highlight { background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .amount { font-size: 28px; font-weight: bold; color: #059669; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { color: #666; }
    .info-value { font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">🔐 SocialSwapr</div>
      </div>
      ${content}
      <div class="footer">
        <p>This is an automated message from SocialSwapr. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} SocialSwapr. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Welcome email for new users
   */
  async sendWelcomeEmail(email: string, name: string) {
    const html = this.baseTemplate(`
      <h1 class="title">Welcome to SocialSwapr, ${name}! 🎉</h1>
      <div class="content">
        <p>Thank you for joining SocialSwapr, the secure marketplace for social media accounts.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>🛒 <strong>Buy</strong> verified social media accounts</li>
          <li>💰 <strong>Sell</strong> your accounts with escrow protection</li>
          <li>🔒 <strong>Trade</strong> safely with our secure transfer process</li>
        </ul>
        <p>Get started by browsing our marketplace or listing your first account!</p>
        <center>
          <a href="${FRONTEND_URL}/browse" class="button">Browse Listings</a>
        </center>
      </div>
    `, 'Welcome to SocialSwapr');

    return this.send({
      to: email,
      subject: 'Welcome to SocialSwapr! 🎉',
      html,
    });
  }

  /**
   * Escrow funded notification
   */
  async sendEscrowFundedEmail(params: EscrowFundedParams) {
    // Email to buyer
    const buyerHtml = this.baseTemplate(`
      <h1 class="title">Payment Successful! 💳</h1>
      <div class="content">
        <p>Hi ${params.buyerName},</p>
        <p>Your payment has been successfully processed and is now held in escrow.</p>
        <div class="highlight">
          <div class="amount">$${params.amount.toLocaleString()}</div>
          <p style="margin: 8px 0 0 0; color: #666;">Held securely in escrow</p>
        </div>
        <div class="info-row"><span class="info-label">Account:</span><span class="info-value">${params.listingTitle}</span></div>
        <div class="info-row"><span class="info-label">Transaction ID:</span><span class="info-value">${params.transactionId.slice(0, 8)}...</span></div>
        <p>The seller has been notified and will begin the transfer process. You'll receive updates at each step.</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard/transactions/${params.transactionId}" class="button">View Transaction</a>
        </center>
      </div>
    `, 'Payment Successful');

    // Email to seller
    const sellerHtml = this.baseTemplate(`
      <h1 class="title">Escrow Funded! 💰</h1>
      <div class="content">
        <p>Hi ${params.sellerName},</p>
        <p>Great news! The buyer has funded the escrow for your listing.</p>
        <div class="highlight">
          <div class="amount">$${params.amount.toLocaleString()}</div>
          <p style="margin: 8px 0 0 0; color: #666;">Will be released upon transfer completion</p>
        </div>
        <div class="info-row"><span class="info-label">Account:</span><span class="info-value">${params.listingTitle}</span></div>
        <div class="info-row"><span class="info-label">Buyer:</span><span class="info-value">${params.buyerName}</span></div>
        <p><strong>Next Steps:</strong> Begin the account transfer process. Follow the step-by-step guide in your dashboard.</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard/transactions/${params.transactionId}" class="button">Start Transfer</a>
        </center>
      </div>
    `, 'Escrow Funded');

    await Promise.all([
      this.send({ to: params.buyerEmail, subject: 'Payment Successful - Escrow Funded', html: buyerHtml }),
      this.send({ to: params.sellerEmail, subject: 'Escrow Funded - Begin Transfer', html: sellerHtml }),
    ]);
  }

  /**
   * Transaction complete notification
   */
  async sendTransactionCompleteEmail(params: TransactionCompleteParams) {
    // Email to buyer
    const buyerHtml = this.baseTemplate(`
      <h1 class="title">Transaction Complete! 🎉</h1>
      <div class="content">
        <p>Hi ${params.buyerName},</p>
        <p>Congratulations! Your purchase is complete and the account is now yours.</p>
        <div class="highlight">
          <div class="info-row"><span class="info-label">Account:</span><span class="info-value">${params.listingTitle}</span></div>
          <div class="info-row"><span class="info-label">Amount Paid:</span><span class="info-value">$${params.amount.toLocaleString()}</span></div>
        </div>
        <p>Please leave a review to help other buyers and sellers in the community.</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard/transactions/${params.transactionId}/review" class="button">Leave Review</a>
        </center>
      </div>
    `, 'Transaction Complete');

    // Email to seller
    const sellerHtml = this.baseTemplate(`
      <h1 class="title">Payment Released! 💸</h1>
      <div class="content">
        <p>Hi ${params.sellerName},</p>
        <p>The transaction is complete and your payment has been released!</p>
        <div class="highlight">
          <div class="amount">$${params.sellerPayout.toLocaleString()}</div>
          <p style="margin: 8px 0 0 0; color: #666;">Released to your account</p>
        </div>
        <div class="info-row"><span class="info-label">Account Sold:</span><span class="info-value">${params.listingTitle}</span></div>
        <div class="info-row"><span class="info-label">Buyer:</span><span class="info-value">${params.buyerName}</span></div>
        <p>Thank you for using SocialSwapr!</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
        </center>
      </div>
    `, 'Payment Released');

    await Promise.all([
      this.send({ to: params.buyerEmail, subject: 'Transaction Complete! 🎉', html: buyerHtml }),
      this.send({ to: params.sellerEmail, subject: 'Payment Released - $' + params.sellerPayout.toLocaleString(), html: sellerHtml }),
    ]);
  }

  /**
   * Refund notification
   */
  async sendRefundEmail(params: RefundParams) {
    const buyerHtml = this.baseTemplate(`
      <h1 class="title">Refund Processed 💳</h1>
      <div class="content">
        <p>Hi ${params.buyerName},</p>
        <p>Your refund has been processed successfully.</p>
        <div class="highlight">
          <div class="amount">$${params.amount.toLocaleString()}</div>
          <p style="margin: 8px 0 0 0; color: #666;">Refunded to your payment method</p>
        </div>
        <div class="info-row"><span class="info-label">Reason:</span><span class="info-value">${params.reason}</span></div>
        <p>The refund should appear in your account within 5-10 business days.</p>
      </div>
    `, 'Refund Processed');

    const sellerHtml = this.baseTemplate(`
      <h1 class="title">Transaction Cancelled</h1>
      <div class="content">
        <p>Hi ${params.sellerName},</p>
        <p>A transaction has been cancelled and the buyer has been refunded.</p>
        <div class="info-row"><span class="info-label">Amount:</span><span class="info-value">$${params.amount.toLocaleString()}</span></div>
        <div class="info-row"><span class="info-label">Reason:</span><span class="info-value">${params.reason}</span></div>
        <p>If you have questions, please contact our support team.</p>
      </div>
    `, 'Transaction Cancelled');

    await Promise.all([
      this.send({ to: params.buyerEmail, subject: 'Refund Processed - $' + params.amount.toLocaleString(), html: buyerHtml }),
      this.send({ to: params.sellerEmail, subject: 'Transaction Cancelled', html: sellerHtml }),
    ]);
  }

  /**
   * Dispute opened notification
   */
  async sendDisputeOpenedEmail(params: DisputeParams) {
    const html = this.baseTemplate(`
      <h1 class="title">Dispute Opened ⚠️</h1>
      <div class="content">
        <p>Hi ${params.userName},</p>
        <p>A dispute has been opened for your transaction.</p>
        <div class="highlight">
          <div class="info-row"><span class="info-label">Dispute ID:</span><span class="info-value">${params.disputeId.slice(0, 8)}...</span></div>
          <div class="info-row"><span class="info-label">Reason:</span><span class="info-value">${params.reason}</span></div>
        </div>
        <p>Our team will review the dispute and may reach out for additional information. Funds will remain in escrow until the dispute is resolved.</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard/transactions/${params.transactionId}" class="button">View Details</a>
        </center>
      </div>
    `, 'Dispute Opened');

    return this.send({
      to: params.userEmail,
      subject: 'Dispute Opened - Action Required',
      html,
    });
  }

  /**
   * Dispute resolved notification
   */
  async sendDisputeResolvedEmail(
    email: string,
    name: string,
    resolution: string,
    disputeId: string
  ) {
    const html = this.baseTemplate(`
      <h1 class="title">Dispute Resolved ✅</h1>
      <div class="content">
        <p>Hi ${name},</p>
        <p>Your dispute has been resolved.</p>
        <div class="highlight">
          <div class="info-row"><span class="info-label">Resolution:</span><span class="info-value">${resolution}</span></div>
        </div>
        <p>If you have any questions about this decision, please contact our support team.</p>
      </div>
    `, 'Dispute Resolved');

    return this.send({
      to: email,
      subject: 'Dispute Resolved',
      html,
    });
  }

  /**
   * New offer notification
   */
  async sendNewOfferEmail(params: NewOfferParams) {
    const html = this.baseTemplate(`
      <h1 class="title">New Offer Received! 💰</h1>
      <div class="content">
        <p>Hi ${params.sellerName},</p>
        <p>You've received a new offer on your listing.</p>
        <div class="highlight">
          <div class="amount">$${params.offerAmount.toLocaleString()}</div>
          <p style="margin: 8px 0 0 0; color: #666;">Offer from ${params.buyerName}</p>
        </div>
        <div class="info-row"><span class="info-label">Listing:</span><span class="info-value">${params.listingTitle}</span></div>
        <p>Review the offer and accept, reject, or counter.</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard/offers" class="button">View Offer</a>
        </center>
      </div>
    `, 'New Offer Received');

    return this.send({
      to: params.sellerEmail,
      subject: `New Offer: $${params.offerAmount.toLocaleString()} for ${params.listingTitle}`,
      html,
    });
  }

  /**
   * Offer accepted notification
   */
  async sendOfferAcceptedEmail(params: OfferAcceptedParams) {
    const html = this.baseTemplate(`
      <h1 class="title">Offer Accepted! 🎉</h1>
      <div class="content">
        <p>Hi ${params.buyerName},</p>
        <p>Great news! ${params.sellerName} has accepted your offer.</p>
        <div class="highlight">
          <div class="amount">$${params.amount.toLocaleString()}</div>
          <p style="margin: 8px 0 0 0; color: #666;">${params.listingTitle}</p>
        </div>
        <p>Complete your purchase by funding the escrow.</p>
        <center>
          <a href="${FRONTEND_URL}/checkout/${params.transactionId}" class="button">Complete Purchase</a>
        </center>
      </div>
    `, 'Offer Accepted');

    return this.send({
      to: params.buyerEmail,
      subject: `Offer Accepted - ${params.listingTitle}`,
      html,
    });
  }

  /**
   * New message notification
   */
  async sendNewMessageEmail(params: NewMessageParams) {
    const html = this.baseTemplate(`
      <h1 class="title">New Message 💬</h1>
      <div class="content">
        <p>Hi ${params.recipientName},</p>
        <p>You have a new message from ${params.senderName}:</p>
        <div class="highlight">
          <p style="margin: 0; font-style: italic;">"${params.preview}..."</p>
        </div>
        <center>
          <a href="${FRONTEND_URL}/dashboard/messages/${params.conversationId}" class="button">View Message</a>
        </center>
      </div>
    `, 'New Message');

    return this.send({
      to: params.recipientEmail,
      subject: `New message from ${params.senderName}`,
      html,
    });
  }

  /**
   * Listing approved notification
   */
  async sendListingApprovedEmail(email: string, name: string, listingTitle: string, listingId: string) {
    const html = this.baseTemplate(`
      <h1 class="title">Listing Approved! ✅</h1>
      <div class="content">
        <p>Hi ${name},</p>
        <p>Your listing has been approved and is now live on the marketplace!</p>
        <div class="highlight">
          <div class="info-row"><span class="info-label">Listing:</span><span class="info-value">${listingTitle}</span></div>
        </div>
        <center>
          <a href="${FRONTEND_URL}/listing/${listingId}" class="button">View Listing</a>
        </center>
      </div>
    `, 'Listing Approved');

    return this.send({
      to: email,
      subject: `Listing Approved: ${listingTitle}`,
      html,
    });
  }

  /**
   * Listing rejected notification
   */
  async sendListingRejectedEmail(email: string, name: string, listingTitle: string, reason: string) {
    const html = this.baseTemplate(`
      <h1 class="title">Listing Needs Attention ⚠️</h1>
      <div class="content">
        <p>Hi ${name},</p>
        <p>Unfortunately, your listing could not be approved at this time.</p>
        <div class="highlight">
          <div class="info-row"><span class="info-label">Listing:</span><span class="info-value">${listingTitle}</span></div>
          <div class="info-row"><span class="info-label">Reason:</span><span class="info-value">${reason}</span></div>
        </div>
        <p>Please update your listing and resubmit for review.</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard/listings" class="button">Edit Listing</a>
        </center>
      </div>
    `, 'Listing Needs Attention');

    return this.send({
      to: email,
      subject: `Listing Update Required: ${listingTitle}`,
      html,
    });
  }

  /**
   * Transfer step reminder
   */
  async sendTransferReminderEmail(
    email: string,
    name: string,
    transactionId: string,
    currentStep: number,
    stepName: string
  ) {
    const html = this.baseTemplate(`
      <h1 class="title">Transfer Reminder ⏰</h1>
      <div class="content">
        <p>Hi ${name},</p>
        <p>Your account transfer is waiting for the next step to be completed.</p>
        <div class="highlight">
          <div class="info-row"><span class="info-label">Current Step:</span><span class="info-value">${currentStep}. ${stepName}</span></div>
        </div>
        <p>Please complete this step to continue the transfer process.</p>
        <center>
          <a href="${FRONTEND_URL}/dashboard/transactions/${transactionId}" class="button">Continue Transfer</a>
        </center>
      </div>
    `, 'Transfer Reminder');

    return this.send({
      to: email,
      subject: 'Transfer Waiting - Action Required',
      html,
    });
  }
}

export const emailService = new EmailService();
