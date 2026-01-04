import { Injectable, Logger } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);
  private readonly keySecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      this.logger.warn('Razorpay credentials not configured');
    }

    this.keySecret = keySecret;
    this.razorpay = new Razorpay({
      key_id: keyId || 'test_key',
      key_secret: keySecret || 'test_secret',
    });
  }

  /**
   * Create a Razorpay order with manual capture
   */
  async createOrder(params: CreateOrderParams): Promise<any> {
    try {
      const order = await this.razorpay.orders.create({
        amount: params.amount * 100, // Convert to paise
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes,
        payment_capture: false, // Manual capture for escrow
      });

      this.logger.log(`Order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify payment signature using HMAC
   */
  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${params.orderId}|${params.paymentId}`)
        .digest('hex');

      return generatedSignature === params.signature;
    } catch (error) {
      this.logger.error(`Error verifying signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Capture payment (release from escrow)
   */
  async capturePayment(paymentId: string, amount: number): Promise<any> {
    try {
      const payment = await this.razorpay.payments.capture(
        paymentId,
        amount * 100, // Convert to paise
        'INR',
      );

      this.logger.log(`Payment captured: ${paymentId}`);
      return payment;
    } catch (error) {
      this.logger.error(`Error capturing payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount ? amount * 100 : undefined, // Convert to paise if provided
      });

      this.logger.log(`Payment refunded: ${paymentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Error refunding payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string): Promise<any> {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      this.logger.error(`Error fetching payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch order details
   */
  async fetchOrder(orderId: string): Promise<any> {
    try {
      return await this.razorpay.orders.fetch(orderId);
    } catch (error) {
      this.logger.error(`Error fetching order: ${error.message}`);
      throw error;
    }
  }
}
