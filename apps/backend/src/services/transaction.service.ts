import { prisma } from '../lib/prisma';
import { config } from '../config';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { TransactionStatus, EscrowStatus } from '@socialswapr/types';
import { createNotifications, createNotification } from '../utils/notifications';
import { Server as SocketServer } from 'socket.io';
import { emitNotification, emitTransactionUpdate } from '../websocket';

// Platform-specific transfer steps
const TRANSFER_STEPS = {
  instagram: [
    {
      stepNumber: 1,
      title: 'Verify Account Access',
      description: 'Seller confirms buyer can log into the account',
      instructions: [
        'Seller provides current login credentials to buyer',
        'Buyer verifies they can access the account',
        'Do NOT change any credentials yet',
      ],
    },
    {
      stepNumber: 2,
      title: 'Change Email Address',
      description: 'Update the email address associated with the account',
      instructions: [
        'Go to Settings > Account > Personal Information > Email',
        'Enter the new email address provided by the buyer',
        'Verify the new email address',
        'Upload screenshot of successful email change',
      ],
    },
    {
      stepNumber: 3,
      title: 'Change Phone Number',
      description: 'Update the phone number for account security',
      instructions: [
        'Go to Settings > Account > Personal Information > Phone',
        'Remove the current phone number',
        'Add the new phone number provided by buyer',
        'Verify with SMS code',
      ],
    },
    {
      stepNumber: 4,
      title: 'Change Password',
      description: 'Update the account password',
      instructions: [
        'Go to Settings > Security > Password',
        'Enter current password',
        'Set the new password agreed upon with buyer',
        'Confirm password change',
      ],
    },
    {
      stepNumber: 5,
      title: 'Disable Two-Factor Authentication',
      description: 'Remove 2FA so buyer can set up their own',
      instructions: [
        'Go to Settings > Security > Two-Factor Authentication',
        'Disable all 2FA methods',
        'Upload screenshot confirming 2FA is disabled',
      ],
    },
    {
      stepNumber: 6,
      title: 'Remove Linked Accounts',
      description: 'Unlink any connected Facebook or other accounts',
      instructions: [
        'Go to Settings > Account > Linked Accounts',
        'Disconnect all linked accounts',
        'Upload screenshot showing no linked accounts',
      ],
    },
    {
      stepNumber: 7,
      title: 'Final Verification',
      description: 'Buyer confirms full control of the account',
      instructions: [
        'Buyer logs in with new credentials',
        'Buyer sets up their own 2FA',
        'Buyer confirms all security settings are updated',
        'Mark transfer as complete',
      ],
    },
  ],
  youtube: [
    {
      stepNumber: 1,
      title: 'Google Account Access',
      description: 'Prepare Google account for transfer',
      instructions: [
        'This will involve transferring the entire Google account',
        'Or moving the channel to a Brand Account first',
        'Discuss preferred method with buyer',
      ],
    },
    {
      stepNumber: 2,
      title: 'Add Brand Account Manager',
      description: 'Add buyer as owner if using Brand Account method',
      instructions: [
        'Go to YouTube Studio > Settings > Channel > Permissions',
        'Click "Invite" and add buyer\'s email as Owner',
        'Wait for buyer to accept invitation',
      ],
    },
    {
      stepNumber: 3,
      title: 'Transfer Ownership',
      description: 'Complete the ownership transfer',
      instructions: [
        'Buyer accepts the manager invitation',
        'Seller removes themselves as owner',
        'Or: Transfer Google account credentials directly',
      ],
    },
    {
      stepNumber: 4,
      title: 'Update Recovery Options',
      description: 'Change all recovery email and phone',
      instructions: [
        'Update recovery email to buyer\'s email',
        'Update recovery phone to buyer\'s phone',
        'Remove seller\'s recovery options',
      ],
    },
    {
      stepNumber: 5,
      title: 'AdSense Transfer',
      description: 'Handle monetization account if applicable',
      instructions: [
        'If monetized, discuss AdSense account handling',
        'Option 1: Transfer AdSense account',
        'Option 2: Buyer sets up new AdSense',
        'Update payment information',
      ],
    },
    {
      stepNumber: 6,
      title: 'Final Verification',
      description: 'Confirm complete transfer',
      instructions: [
        'Buyer confirms full channel access',
        'Buyer confirms monetization status (if applicable)',
        'Seller confirms removal from account',
      ],
    },
  ],
  tiktok: [
    {
      stepNumber: 1,
      title: 'Verify Account Access',
      description: 'Confirm current login credentials work',
      instructions: [
        'Seller provides current login credentials',
        'Buyer verifies account access',
        'Note any linked accounts (Google, Apple, etc.)',
      ],
    },
    {
      stepNumber: 2,
      title: 'Unlink Third-Party Logins',
      description: 'Remove Google, Apple, or other linked logins',
      instructions: [
        'Go to Settings > Security > Login Methods',
        'Remove all third-party login connections',
        'Ensure only email/phone login remains',
      ],
    },
    {
      stepNumber: 3,
      title: 'Change Email/Phone',
      description: 'Update contact information',
      instructions: [
        'Go to Settings > Manage Account',
        'Change email to buyer\'s email',
        'Change phone number to buyer\'s phone',
        'Verify both with codes sent',
      ],
    },
    {
      stepNumber: 4,
      title: 'Change Password',
      description: 'Set new password for buyer',
      instructions: [
        'Go to Settings > Manage Account > Password',
        'Enter current password',
        'Set new agreed-upon password',
      ],
    },
    {
      stepNumber: 5,
      title: 'Final Verification',
      description: 'Complete transfer confirmation',
      instructions: [
        'Buyer logs in with new credentials',
        'Buyer verifies all settings are updated',
        'Confirm TikTok Creator Fund status if applicable',
      ],
    },
  ],
  twitter: [
    {
      stepNumber: 1,
      title: 'Verify Account Access',
      description: 'Confirm login credentials',
      instructions: [
        'Seller provides login credentials',
        'Buyer verifies account access',
        'Note current email and phone on account',
      ],
    },
    {
      stepNumber: 2,
      title: 'Change Email',
      description: 'Update account email',
      instructions: [
        'Go to Settings > Account > Account Information > Email',
        'Enter new email address',
        'Verify with code sent to new email',
      ],
    },
    {
      stepNumber: 3,
      title: 'Change Phone',
      description: 'Update phone number',
      instructions: [
        'Go to Settings > Account > Account Information > Phone',
        'Remove old phone number',
        'Add buyer\'s phone number',
        'Verify with SMS code',
      ],
    },
    {
      stepNumber: 4,
      title: 'Change Password',
      description: 'Set new password',
      instructions: [
        'Go to Settings > Account > Change Password',
        'Enter current password',
        'Set new password',
      ],
    },
    {
      stepNumber: 5,
      title: 'Disable 2FA',
      description: 'Remove two-factor authentication',
      instructions: [
        'Go to Settings > Security > Two-Factor Authentication',
        'Turn off all 2FA methods',
        'Buyer will set up their own 2FA',
      ],
    },
    {
      stepNumber: 6,
      title: 'Final Verification',
      description: 'Complete transfer',
      instructions: [
        'Buyer logs in with new credentials',
        'Buyer sets up 2FA',
        'Buyer confirms Blue subscription status if applicable',
      ],
    },
  ],
  facebook: [
    {
      stepNumber: 1,
      title: 'Verify Page/Account Type',
      description: 'Determine if transferring Page or Profile',
      instructions: [
        'Clarify what is being transferred (Page vs Profile)',
        'Pages can add admins; Profiles cannot be transferred easily',
        'Discuss approach with buyer',
      ],
    },
    {
      stepNumber: 2,
      title: 'Add Page Admin',
      description: 'Add buyer as Page Admin (for Pages)',
      instructions: [
        'Go to Page Settings > Page Roles',
        'Add buyer\'s Facebook account as Admin',
        'Wait 7 days for admin privileges to fully activate',
      ],
    },
    {
      stepNumber: 3,
      title: 'Transfer Ownership',
      description: 'Make buyer the primary admin',
      instructions: [
        'After 7 days, buyer can remove seller admin',
        'Or transfer the Business Asset if using Business Manager',
      ],
    },
    {
      stepNumber: 4,
      title: 'Final Verification',
      description: 'Confirm complete transfer',
      instructions: [
        'Buyer confirms full admin access',
        'Seller confirms removal from Page',
        'Update any connected Instagram accounts',
      ],
    },
  ],
};

export class TransactionService {
  async create(listingId: string, buyerId: string, offerId?: string) {
    // Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.status !== 'active') {
      throw new BadRequestError('This listing is no longer available');
    }

    if (listing.sellerId === buyerId) {
      throw new BadRequestError('You cannot purchase your own listing');
    }

    // Prevent duplicate active transactions for the same listing
    const existingActive = await prisma.transaction.findFirst({
      where: {
        listingId,
        status: { notIn: ['cancelled', 'refunded', 'payment_failed', 'completed'] },
      },
    });
    if (existingActive) {
      throw new BadRequestError('An active transaction already exists for this listing');
    }

    // Velocity check: max N transactions per day per buyer
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTxCount = await prisma.transaction.count({
      where: {
        buyerId,
        createdAt: { gte: oneDayAgo },
        status: { notIn: ['cancelled', 'payment_failed'] },
      },
    });
    if (recentTxCount >= config.maxTransactionsPerDay) {
      throw new BadRequestError('Transaction limit reached. Please try again later.');
    }

    // Calculate fees
    let amount = listing.price;

    // Check if there's an accepted offer
    if (offerId) {
      const offer = await prisma.offer.findUnique({
        where: { id: offerId },
      });

      if (!offer || offer.status !== 'accepted') {
        throw new BadRequestError('Invalid or unaccepted offer');
      }

      amount = offer.amount;
    }

    const platformFee = this.calculatePlatformFee(amount);
    const sellerPayout = amount - platformFee;

    // Get transfer steps for this platform
    const transferSteps = this.getTransferSteps(listing.platform);

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        amount,
        platformFee,
        sellerPayout,
        currency: listing.currency,
        transferProgress: transferSteps as unknown as Prisma.JsonValue[],
        status: 'initiated',
      },
      include: {
        listing: {
          select: {
            id: true,
            platform: true,
            username: true,
            displayName: true,
            price: true,
          },
        },
        buyer: {
          select: { id: true, username: true, email: true },
        },
        seller: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    // Create conversation for this transaction
    await prisma.conversation.create({
      data: {
        transactionId: transaction.id,
        participants: {
          create: [
            { userId: buyerId },
            { userId: listing.sellerId },
          ],
        },
      },
    });

    // Create notifications for both parties
    await createNotifications([
      {
        userId: buyerId,
        type: 'transaction_update',
        title: 'Transaction Created',
        message: `Transaction created for ${listing.displayName || listing.username}. Proceed to payment.`,
        data: { transactionId: transaction.id },
      },
      {
        userId: listing.sellerId,
        type: 'transaction_update',
        title: 'New Sale',
        message: `Someone wants to buy ${listing.displayName || listing.username}. Waiting for payment.`,
        data: { transactionId: transaction.id },
      },
    ]);

    return transaction;
  }

  async getById(id: string, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                trustScore: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            trustScore: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            trustScore: true,
          },
        },
        conversation: true,
        reviews: true,
        dispute: true,
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction');
    }

    // Check if user is part of this transaction
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenError('You are not part of this transaction');
    }

    return transaction;
  }

  async getMyTransactions(userId: string, role: 'buyer' | 'seller' | 'all' = 'all') {
    const where: Prisma.TransactionWhereInput = {};

    if (role === 'buyer') {
      where.buyerId = userId;
    } else if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    return prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            platform: true,
            username: true,
            displayName: true,
            screenshots: true,
          },
        },
        buyer: {
          select: { id: true, username: true, avatarUrl: true },
        },
        seller: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });
  }

  async updateStatus(id: string, status: TransactionStatus, userId?: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction');
    }

    // Validate status transition
    this.validateStatusTransition(transaction.status as TransactionStatus, status);

    const updates: Prisma.TransactionUpdateInput = { status };

    if (status === 'completed') {
      updates.completedAt = new Date();
      updates.escrowStatus = 'released';
      updates.paymentStatus = 'captured';

      // Mark listing as sold
      await prisma.listing.update({
        where: { id: transaction.listingId },
        data: { status: 'sold' },
      });
    }

    return prisma.transaction.update({
      where: { id },
      data: updates,
    });
  }

  async completeTransferStep(
    transactionId: string,
    stepNumber: number,
    userId: string,
    data: { proofUrl?: string; notes?: string },
    io?: SocketServer
  ) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: { select: { id: true, email: true, username: true } },
        seller: { select: { id: true, email: true, username: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenError('You are not part of this transaction');
    }

    if (transaction.status !== 'transfer_in_progress' && 
        transaction.status !== 'escrow_funded') {
      throw new BadRequestError('Transfer not in progress');
    }

    const transferProgress = transaction.transferProgress as any[];
    const stepIndex = transferProgress.findIndex((s) => s.stepNumber === stepNumber);

    if (stepIndex === -1) {
      throw new BadRequestError('Invalid step number');
    }

    const step = transferProgress[stepIndex];
    const isSellerStep = userId === transaction.sellerId;

    // Update step
    transferProgress[stepIndex] = {
      ...transferProgress[stepIndex],
      status: 'completed',
      completedAt: new Date(),
      proofUrl: data.proofUrl,
      notes: data.notes,
    };

    // Mark next step as in_progress
    if (stepIndex + 1 < transferProgress.length) {
      transferProgress[stepIndex + 1].status = 'in_progress';
    }

    const updates: Prisma.TransactionUpdateInput = {
      transferProgress: transferProgress as unknown as Prisma.JsonValue[],
      currentStep: stepNumber + 1,
    };

    // If this was first step, update status
    if (transaction.status === 'escrow_funded') {
      updates.status = 'transfer_in_progress';
    }

    // If all steps complete, mark transfer as completed
    const allComplete = transferProgress.every((s) => s.status === 'completed');
    if (allComplete) {
      updates.status = 'transfer_completed';
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updates,
      include: {
        buyer: { select: { id: true, email: true, username: true } },
        seller: { select: { id: true, email: true, username: true } },
      },
    });

    // Create notifications
    const notifications = [];
    const otherPartyId = isSellerStep ? transaction.buyerId : transaction.sellerId;
    
    notifications.push({
      userId: otherPartyId,
      type: 'transfer_step',
      title: 'Transfer Step Completed',
      message: `${isSellerStep ? 'Seller' : 'Buyer'} completed step ${stepNumber}: ${step.title}`,
      data: { transactionId, stepNumber },
    });

    if (allComplete) {
      notifications.push({
        userId: transaction.buyerId,
        type: 'transfer_completed',
        title: 'Transfer Steps Complete',
        message: 'All transfer steps are complete. Please verify account access and confirm.',
        data: { transactionId },
      });
    }

    if (notifications.length > 0) {
      await createNotifications(notifications);
      
      // Emit WebSocket events
      if (io) {
        try {
          notifications.forEach(notif => {
            emitNotification(io, notif.userId, notif);
          });
          emitTransactionUpdate(io, transaction.buyerId, transaction.sellerId, {
            transactionId,
            status: updatedTransaction.status,
            currentStep: updatedTransaction.currentStep,
          });
        } catch (error) {
          // Log but don't fail
          console.error('Failed to emit WebSocket events:', error);
        }
      }
    }

    return updatedTransaction;
  }

  async confirmTransferComplete(transactionId: string, userId: string, io?: SocketServer) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: { select: { id: true, email: true, username: true } },
        seller: { select: { id: true, email: true, username: true } },
        listing: { select: { id: true, displayName: true, username: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction');
    }

    // Only buyer can confirm transfer
    if (transaction.buyerId !== userId) {
      throw new ForbiddenError('Only the buyer can confirm transfer completion');
    }

    if (transaction.status !== 'transfer_completed') {
      throw new BadRequestError('Transfer steps are not completed');
    }

    // Complete the transaction and release escrow
    const completed = await this.updateStatus(transactionId, 'completed');

    // Create notifications
    await createNotifications([
      {
        userId: transaction.buyerId,
        type: 'transaction_complete',
        title: 'Transaction Complete',
        message: `Your purchase of ${transaction.listing.displayName || transaction.listing.username} is complete!`,
        data: { transactionId },
      },
      {
        userId: transaction.sellerId,
        type: 'payment_released',
        title: 'Payment Released',
        message: `Your payment has been released. Transaction completed successfully.`,
        data: { transactionId },
      },
    ]);

    // Emit WebSocket events
    if (io) {
      try {
        emitNotification(io, transaction.buyerId, {
          type: 'transaction_complete',
          title: 'Transaction Complete',
          message: 'Your purchase is complete!',
          data: { transactionId },
        });
        emitNotification(io, transaction.sellerId, {
          type: 'payment_released',
          title: 'Payment Released',
          message: 'Your payment has been released.',
          data: { transactionId },
        });
        emitTransactionUpdate(io, transaction.buyerId, transaction.sellerId, {
          transactionId,
          status: 'completed',
        });
      } catch (error) {
        console.error('Failed to emit WebSocket events:', error);
      }
    }

    return completed;
  }

  async cancel(id: string, userId: string, reason: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenError('You are not part of this transaction');
    }

    // Can only cancel before transfer starts
    const cancelableStatuses: TransactionStatus[] = [
      'initiated',
      'payment_pending',
      'payment_processing',
    ];

    if (!cancelableStatuses.includes(transaction.status as TransactionStatus)) {
      throw new BadRequestError('This transaction cannot be cancelled at this stage');
    }

    return prisma.transaction.update({
      where: { id },
      data: {
        status: 'cancelled',
        escrowStatus: transaction.escrowStatus === 'funded' ? 'refunded' : 'pending',
      },
    });
  }

  private calculatePlatformFee(amount: number): number {
    let fee = amount * (config.platformFeePercent / 100);
    fee = Math.max(fee, config.minPlatformFee);
    fee = Math.min(fee, config.maxPlatformFee);
    return Math.round(fee * 100) / 100; // Round to 2 decimal places
  }

  private getTransferSteps(platform: string) {
    const steps = TRANSFER_STEPS[platform as keyof typeof TRANSFER_STEPS];
    
    if (!steps) {
      // Default generic steps
      return [
        {
          stepNumber: 1,
          title: 'Verify Account Access',
          description: 'Confirm login credentials work',
          instructions: ['Seller provides credentials', 'Buyer verifies access'],
          status: 'pending',
        },
        {
          stepNumber: 2,
          title: 'Change Security Settings',
          description: 'Update email, phone, and password',
          instructions: ['Change email', 'Change phone', 'Change password'],
          status: 'pending',
        },
        {
          stepNumber: 3,
          title: 'Final Verification',
          description: 'Confirm complete transfer',
          instructions: ['Buyer confirms full access', 'All security updated'],
          status: 'pending',
        },
      ];
    }

    return steps.map((step) => ({
      ...step,
      status: 'pending',
    }));
  }

  private validateStatusTransition(current: TransactionStatus, next: TransactionStatus) {
    const validTransitions: Record<TransactionStatus, TransactionStatus[]> = {
      initiated: ['payment_pending', 'cancelled'],
      payment_pending: ['payment_processing', 'cancelled'],
      payment_processing: ['escrow_funded', 'payment_failed'],
      payment_failed: ['payment_pending', 'cancelled'],
      escrow_funded: ['transfer_in_progress', 'disputed', 'refunded'],
      transfer_in_progress: ['transfer_completed', 'disputed'],
      transfer_completed: ['verification_pending', 'completed'],
      verification_pending: ['completed', 'disputed'],
      completed: [],
      disputed: ['completed', 'refunded'],
      cancelled: [],
      refunded: [],
    };

    if (!validTransitions[current]?.includes(next)) {
      throw new BadRequestError(
        `Cannot transition from ${current} to ${next}`
      );
    }
  }
}

export const transactionService = new TransactionService();
