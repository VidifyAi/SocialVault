import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';

export interface CreateOrderDto {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface VerifySignatureDto {
  orderId: string;
  paymentId: string;
  signature: string;
}

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;
  private keySecret: string;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      console.warn('Razorpay credentials not configured');
      return;
    }

    this.keySecret = keySecret;
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create a Razorpay order with manual capture enabled (for escrow)
   */
  async createOrder(dto: CreateOrderDto) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    const options = {
      amount: Math.round(dto.amount * 100), // Convert to paise
      currency: dto.currency || 'INR',
      receipt: dto.receipt,
      payment_capture: 0, // Manual capture for escrow
      notes: dto.notes || {},
    };

    return await this.razorpay.orders.create(options);
  }

  /**
   * Verify HMAC signature from Razorpay webhook or payment response
   */
  verifySignature(dto: VerifySignatureDto): boolean {
    if (!this.keySecret) {
      throw new Error('Razorpay key secret not configured');
    }

    const { orderId, paymentId, signature } = dto;
    const body = `${orderId}|${paymentId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Capture payment (release from escrow)
   */
  async capturePayment(paymentId: string, amount: number, currency = 'INR') {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    return await this.razorpay.payments.capture(paymentId, Math.round(amount * 100), currency);
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    const refundData: any = {};
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    return await this.razorpay.payments.refund(paymentId, refundData);
  }

  /**
   * Fetch payment details
   */
  async getPayment(paymentId: string) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    return await this.razorpay.payments.fetch(paymentId);
  }

  /**
   * Fetch order details
   */
  async getOrder(orderId: string) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    return await this.razorpay.orders.fetch(orderId);
  }
}
