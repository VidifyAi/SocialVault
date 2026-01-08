// Razorpay Payment Service
// Handles payment creation, verification, and escrow management

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Server as SocketServer } from 'socket.io';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { emailService } from './email.service';
import { logger } from '../utils/logger';
import { createNotifications } from '../utils/notifications';
import { emitNotification, emitTransactionUpdate } from '../websocket';

let razorpay: Razorpay | null = null;

// Lazy initialization to avoid crashing if API keys are missing
const getRazorpayClient = () => {
  if (!razorpay && config.razorpayKeyId && config.razorpayKeySecret) {
    razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
  }
  
  if (!razorpay) {
    throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  
  return razorpay;
};

interface CreateOrderParams {
  amount: number;
  currency?: string;
  transactionId: string;
  buyerId: string;
  notes?: Record<string, string>;
}

interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

class PaymentService {
  /**
   * Create a Razorpay order for transaction
   */
  async createOrder(params: CreateOrderParams) {
    const { amount, currency = 'INR', transactionId, buyerId, notes = {} } = params;

    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: amountInPaise,
      currency,
      receipt: transactionId,
      notes: {
        transactionId,
        buyerId,
        ...notes,
      },
    });

    // Update transaction with order ID
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        razorpayOrderId: order.id,
        paymentStatus: 'order_created',
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpayKeyId,
    };
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  /**
   * Capture payment after verification (escrow funded)
   */
  async capturePayment(transactionId: string, paymentDetails: VerifyPaymentParams, io?: SocketServer) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentDetails;

    // Verify signature
    const isValid = this.verifyPaymentSignature(paymentDetails);
    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Get payment details from Razorpay
    const razorpayClient = getRazorpayClient();
    if (!razorpayClient) {
      throw new Error('Razorpay client not configured');
    }
    const payment = await razorpayClient.payments.fetch(razorpayPaymentId);

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'captured',
        escrowStatus: 'funded',
        status: 'escrow_funded',
      },
      include: {
        listing: true,
        buyer: true,
        seller: true,
      },
    });

    // Send notification emails
    await emailService.sendEscrowFundedEmail({
      buyerEmail: transaction.buyer.email,
      buyerName: transaction.buyer.firstName || transaction.buyer.username,
      sellerEmail: transaction.seller.email,
      sellerName: transaction.seller.firstName || transaction.seller.username,
      listingTitle: transaction.listing.displayName || transaction.listing.username,
      amount: transaction.amount,
      transactionId: transaction.id,
    });

    // Create notifications
    await createNotifications([
      {
        userId: transaction.buyerId,
        type: 'payment_captured',
        title: 'Payment Successful',
        message: `Your payment of ₹${transaction.amount} has been captured and is now in escrow.`,
        data: { transactionId: transaction.id },
      },
      {
        userId: transaction.sellerId,
        type: 'escrow_funded',
        title: 'Payment Received in Escrow',
        message: `Buyer has funded the escrow. You can now begin the transfer process.`,
        data: { transactionId: transaction.id },
      },
    ]);

    // Emit WebSocket events
    if (io) {
      try {
        emitNotification(io, transaction.buyerId, {
          type: 'payment_captured',
          title: 'Payment Successful',
          message: `Your payment of ₹${transaction.amount} has been captured.`,
          data: { transactionId: transaction.id },
        });
        emitNotification(io, transaction.sellerId, {
          type: 'escrow_funded',
          title: 'Payment Received in Escrow',
          message: `Buyer has funded the escrow. You can now begin the transfer process.`,
          data: { transactionId: transaction.id },
        });
        emitTransactionUpdate(io, transaction.buyerId, transaction.sellerId, {
          transactionId: transaction.id,
          status: transaction.status,
          escrowStatus: transaction.escrowStatus,
        });
      } catch (error) {
        logger.error('Failed to emit WebSocket events:', error);
      }
    }

    return transaction;
  }

  /**
   * Release escrow to seller (transfer complete)
   */
  async releaseEscrow(transactionId: string, adminId?: string, io?: SocketServer) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        listing: true,
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.escrowStatus !== 'funded') {
      throw new Error('Escrow is not in funded state');
    }

    // In production, you would transfer funds to seller's linked account
    // For now, we just update the status
    // You can use Razorpay Route (split payments) or manual transfers

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        escrowStatus: 'released',
        paymentStatus: 'completed',
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Send completion emails
    await emailService.sendTransactionCompleteEmail({
      buyerEmail: transaction.buyer.email,
      buyerName: transaction.buyer.firstName || transaction.buyer.username,
      sellerEmail: transaction.seller.email,
      sellerName: transaction.seller.firstName || transaction.seller.username,
      listingTitle: transaction.listing.displayName || transaction.listing.username,
      amount: transaction.amount,
      sellerPayout: transaction.sellerPayout,
      transactionId: transaction.id,
    });

    // Create notifications
    await createNotifications([
      {
        userId: transaction.buyerId,
        type: 'transaction_complete',
        title: 'Transaction Complete',
        message: `Your purchase is complete. Enjoy your new account!`,
        data: { transactionId: transaction.id },
      },
      {
        userId: transaction.sellerId,
        type: 'payment_released',
        title: 'Payment Released',
        message: `₹${transaction.sellerPayout} has been released to your account.`,
        data: { transactionId: transaction.id },
      },
    ]);

    // Emit WebSocket events
    if (io) {
      try {
        emitNotification(io, transaction.buyerId, {
          type: 'transaction_complete',
          title: 'Transaction Complete',
          message: `Your purchase is complete. Enjoy your new account!`,
          data: { transactionId: transaction.id },
        });
        emitNotification(io, transaction.sellerId, {
          type: 'payment_released',
          title: 'Payment Released',
          message: `₹${transaction.sellerPayout} has been released to your account.`,
          data: { transactionId: transaction.id },
        });
        emitTransactionUpdate(io, transaction.buyerId, transaction.sellerId, {
          transactionId: transaction.id,
          status: transaction.status,
          escrowStatus: transaction.escrowStatus,
        });
      } catch (error) {
        logger.error('Failed to emit WebSocket events:', error);
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'escrow_released',
        resource: 'transaction',
        resourceId: transactionId,
        newData: { escrowStatus: 'released' },
      },
    });

    return updatedTransaction;
  }

  /**
   * Refund payment to buyer (dispute resolved in buyer's favor)
   */
  async refundPayment(transactionId: string, reason: string, adminId?: string, io?: SocketServer) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true,
        listing: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (!transaction.razorpayPaymentId) {
      throw new Error('No payment found for this transaction');
    }

    // Create refund in Razorpay
    const razorpayClient = getRazorpayClient();
    if (!razorpayClient) {
      throw new Error('Razorpay client not configured');
    }
    
    const refund = await razorpayClient.payments.refund(transaction.razorpayPaymentId, {
      amount: Math.round(transaction.amount * 100), // Full refund
      notes: {
        reason,
        transactionId,
      },
    });

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        escrowStatus: 'refunded',
        paymentStatus: 'refunded',
        status: 'cancelled',
        razorpayRefundId: refund.id,
      },
    });

    // Send refund emails
    await emailService.sendRefundEmail({
      buyerEmail: transaction.buyer.email,
      buyerName: transaction.buyer.firstName || transaction.buyer.username,
      sellerEmail: transaction.seller.email,
      sellerName: transaction.seller.firstName || transaction.seller.username,
      amount: transaction.amount,
      reason,
      transactionId: transaction.id,
    });

    // Create notifications
    await createNotifications([
      {
        userId: transaction.buyerId,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `₹${transaction.amount} has been refunded to your account.`,
        data: { transactionId: transaction.id },
      },
      {
        userId: transaction.sellerId,
        type: 'transaction_cancelled',
        title: 'Transaction Cancelled',
        message: `The transaction has been cancelled and buyer has been refunded.`,
        data: { transactionId: transaction.id },
      },
    ]);

    // Emit WebSocket events
    if (io) {
      try {
        emitNotification(io, transaction.buyerId, {
          type: 'refund_processed',
          title: 'Refund Processed',
          message: `₹${transaction.amount} has been refunded to your account.`,
          data: { transactionId: transaction.id },
        });
        emitNotification(io, transaction.sellerId, {
          type: 'transaction_cancelled',
          title: 'Transaction Cancelled',
          message: `The transaction has been cancelled and buyer has been refunded.`,
          data: { transactionId: transaction.id },
        });
        emitTransactionUpdate(io, transaction.buyerId, transaction.sellerId, {
          transactionId: transaction.id,
          status: transaction.status,
          escrowStatus: transaction.escrowStatus,
        });
      } catch (error) {
        logger.error('Failed to emit WebSocket events:', error);
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'payment_refunded',
        resource: 'transaction',
        resourceId: transactionId,
        newData: { refundId: refund.id, reason },
      },
    });

    return updatedTransaction;
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string) {
    const razorpayClient = getRazorpayClient();
    if (!razorpayClient) {
      throw new Error('Razorpay client not configured');
    }
    return razorpayClient.payments.fetch(paymentId);
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string) {
    const razorpayClient = getRazorpayClient();
    if (!razorpayClient) {
      throw new Error('Razorpay client not configured');
    }
    return razorpayClient.orders.fetch(orderId);
  }

  /**
   * Handle Razorpay webhook events
   */
  async handleWebhook(body: any, signature: string) {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayWebhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature');
    }

    const event = body.event;
    const payload = body.payload;

    switch (event) {
      case 'payment.captured': {
        // Payment was captured
        const paymentCaptured = payload.payment.entity;
        console.log('Payment captured:', paymentCaptured.id);
        break;
      }

      case 'payment.failed': {
        // Payment failed
        const paymentFailed = payload.payment.entity;
        const orderId = paymentFailed.order_id;
        
        await prisma.transaction.updateMany({
          where: { razorpayOrderId: orderId },
          data: {
            paymentStatus: 'failed',
            status: 'payment_failed',
          },
        });
        break;
      }

      case 'refund.created': {
        // Refund was created
        const refund = payload.refund.entity;
        console.log('Refund created:', refund.id);
        break;
      }

      default:
        console.log('Unhandled webhook event:', event);
    }

    return { received: true };
  }
}

export const paymentService = new PaymentService();
