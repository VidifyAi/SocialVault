// Payment Routes (Razorpay)
// Handles payment creation, verification, and webhooks

import { Router, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// POST /payments/create-order - Create Razorpay order
router.post('/create-order', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction ID is required' 
      });
    }

    // Get transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }

    // Verify buyer
    if (transaction.buyerId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to pay for this transaction' 
      });
    }

    // Check if already paid
    if (transaction.paymentStatus === 'captured' || transaction.escrowStatus === 'funded') {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction already paid' 
      });
    }

    // Create Razorpay order
    const order = await paymentService.createOrder({
      amount: transaction.amount,
      currency: transaction.currency === 'USD' ? 'INR' : transaction.currency, // Razorpay primarily uses INR
      transactionId: transaction.id,
      buyerId: req.user!.id,
      notes: {
        listingId: transaction.listingId,
        listingName: transaction.listing.displayName || transaction.listing.username,
      },
    });

    res.json({ 
      success: true, 
      data: {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        transactionId: transaction.id,
      }
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /payments/verify - Verify payment after completion
router.post('/verify', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      transactionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!transactionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required payment details' 
      });
    }

    // Capture payment
    const transaction = await paymentService.capturePayment(transactionId, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.json({ 
      success: true, 
      data: {
        transactionId: transaction.id,
        status: transaction.status,
        paymentStatus: transaction.paymentStatus,
        escrowStatus: transaction.escrowStatus,
      }
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /payments/:transactionId/status - Get payment status
router.get('/:transactionId/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.transactionId },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        paymentStatus: true,
        escrowStatus: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Check authorization
    const fullTransaction = await prisma.transaction.findUnique({
      where: { id: req.params.transactionId },
    });
    
    if (fullTransaction!.buyerId !== req.user!.id && fullTransaction!.sellerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    res.json({ success: true, data: transaction });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /payments/webhook - Razorpay webhook handler
router.post('/webhook', async (req, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing webhook signature' 
      });
    }

    await paymentService.handleWebhook(req.body, signature);

    res.json({ success: true, received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /payments/:transactionId/release - Buyer confirms transfer, request escrow release
router.post('/:transactionId/release', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Only buyer can confirm transfer
    if (transaction.buyerId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only the buyer can confirm transfer completion' 
      });
    }

    // Check escrow status
    if (transaction.escrowStatus !== 'funded') {
      return res.status(400).json({ 
        success: false, 
        error: 'Escrow is not in funded state' 
      });
    }

    // Release escrow
    const updatedTransaction = await paymentService.releaseEscrow(transactionId);

    res.json({ success: true, data: updatedTransaction });
  } catch (error: any) {
    console.error('Error releasing escrow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const paymentRouter = router;
