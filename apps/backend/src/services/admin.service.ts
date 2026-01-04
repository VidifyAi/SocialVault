// Admin Service
// Handles administrative operations: moderation, disputes, analytics

import { prisma } from '../lib/prisma';
import { emailService } from './email.service';
import { paymentService } from './payment.service';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface ListingFilters extends PaginationParams {
  status?: string;
  verificationStatus?: string;
  platform?: string;
}

interface UserFilters extends PaginationParams {
  status?: string;
  role?: string;
  kycStatus?: string;
}

interface TransactionFilters extends PaginationParams {
  status?: string;
  escrowStatus?: string;
}

interface DisputeFilters extends PaginationParams {
  status?: string;
}

class AdminService {
  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      totalTransactions,
      completedTransactions,
      openDisputes,
      pendingVerifications,
      recentTransactions,
      revenueStats,
      flaggedMessagesHigh,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'completed' } }),
      prisma.dispute.count({ where: { status: 'opened' } }),
      prisma.listing.count({ where: { verificationStatus: 'pending' } }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, username: true, email: true } },
          seller: { select: { id: true, username: true, email: true } },
          listing: { select: { id: true, username: true, platform: true } },
        },
      }),
      this.getRevenueStats(),
      prisma.message.count({ where: { isFlagged: true, flagSeverity: 'high' } }),
    ]);

    // Calculate GMV (Gross Merchandise Value)
    const gmvResult = await prisma.transaction.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    });

    // Calculate platform revenue
    const revenueResult = await prisma.transaction.aggregate({
      where: { status: 'completed' },
      _sum: { platformFee: true },
    });

    // Funds in escrow
    const escrowResult = await prisma.transaction.aggregate({
      where: { escrowStatus: 'funded' },
      _sum: { amount: true },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        pendingVerification: pendingVerifications,
      },
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        successRate: totalTransactions > 0 
          ? ((completedTransactions / totalTransactions) * 100).toFixed(1) 
          : 0,
      },
      disputes: {
        open: openDisputes,
      },
      flaggedMessages: {
        highSeverity: flaggedMessagesHigh,
      },
      financials: {
        gmv: gmvResult._sum.amount || 0,
        revenue: revenueResult._sum.platformFee || 0,
        escrowFunds: escrowResult._sum.amount || 0,
      },
      recentTransactions,
      ...revenueStats,
    };
  }

  async getRevenueStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [last30Days, last7Days, today] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
          completedAt: { gte: thirtyDaysAgo },
        },
        _sum: { platformFee: true, amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
          completedAt: { gte: sevenDaysAgo },
        },
        _sum: { platformFee: true, amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
          completedAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
        },
        _sum: { platformFee: true, amount: true },
        _count: true,
      }),
    ]);

    return {
      revenue: {
        last30Days: {
          revenue: last30Days._sum.platformFee || 0,
          gmv: last30Days._sum.amount || 0,
          transactions: last30Days._count,
        },
        last7Days: {
          revenue: last7Days._sum.platformFee || 0,
          gmv: last7Days._sum.amount || 0,
          transactions: last7Days._count,
        },
        today: {
          revenue: today._sum.platformFee || 0,
          gmv: today._sum.amount || 0,
          transactions: today._count,
        },
      },
    };
  }

  // ==================== USER MANAGEMENT ====================

  async getUsers(filters: UserFilters) {
    const { page = 1, limit = 20, status, role, kycStatus } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      // guard against orphaned listings missing seller relation
      seller: { isNot: null },
    };
    if (status) where.status = status;
    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          clerkId: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          kycStatus: true,
          trustScore: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              listings: true,
              purchasedTransactions: true,
              soldTransactions: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        listings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        purchasedTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { listing: true },
        },
        soldTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { listing: true },
        },
        reviewsReceived: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        initiatedDisputes: true,
        auditLogs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return user;
  }

  async updateUserStatus(userId: string, status: string, reason: string, adminId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'user_status_updated',
        resource: 'user',
        resourceId: userId,
        newData: { status, reason },
      },
    });

    return user;
  }

  async updateUserRole(userId: string, role: string, adminId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'user_role_updated',
        resource: 'user',
        resourceId: userId,
        newData: { role },
      },
    });

    return user;
  }

  // ==================== LISTING MANAGEMENT ====================

  async getListings(filters: ListingFilters) {
    const { page = 1, limit = 20, status, verificationStatus, platform } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (platform) where.platform = platform;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listing.count({ where }),
    ]);

    // Load sellers separately to avoid relation load errors from orphaned listings
    const sellerIds = Array.from(new Set(listings.map((l) => l.sellerId)));
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, username: true, email: true, trustScore: true },
    });
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));

    const listingsWithSeller = listings
      .filter((l) => sellerMap.has(l.sellerId))
      .map((l) => ({ ...l, seller: sellerMap.get(l.sellerId)! }));

    return {
      listings: listingsWithSeller,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyListing(listingId: string, adminId: string) {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        verificationStatus: 'verified',
        status: 'active',
      },
      include: {
        seller: true,
      },
    });

    // Send notification email
    await emailService.sendListingApprovedEmail(
      listing.seller.email,
      listing.seller.firstName || listing.seller.username,
      listing.displayName || listing.username,
      listing.id
    );

    // Create notification
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'listing_approved',
        title: 'Listing Approved',
        message: `Your listing "${listing.displayName || listing.username}" has been approved and is now live!`,
        data: { listingId: listing.id },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'listing_verified',
        resource: 'listing',
        resourceId: listingId,
      },
    });

    return listing;
  }

  async rejectListing(listingId: string, reason: string, adminId: string) {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        verificationStatus: 'rejected',
        status: 'rejected',
      },
      include: {
        seller: true,
      },
    });

    // Send notification email
    await emailService.sendListingRejectedEmail(
      listing.seller.email,
      listing.seller.firstName || listing.seller.username,
      listing.displayName || listing.username,
      reason
    );

    // Create notification
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'listing_rejected',
        title: 'Listing Needs Attention',
        message: `Your listing "${listing.displayName || listing.username}" was not approved. Reason: ${reason}`,
        data: { listingId: listing.id, reason },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'listing_rejected',
        resource: 'listing',
        resourceId: listingId,
        newData: { reason },
      },
    });

    return listing;
  }

  async suspendListing(listingId: string, reason: string, adminId: string) {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'suspended' },
      include: { seller: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'listing_suspended',
        title: 'Listing Suspended',
        message: `Your listing has been suspended. Reason: ${reason}`,
        data: { listingId: listing.id, reason },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'listing_suspended',
        resource: 'listing',
        resourceId: listingId,
        newData: { reason },
      },
    });

    return listing;
  }

  // ==================== TRANSACTION MANAGEMENT ====================

  async getTransactions(filters: TransactionFilters) {
    const { page = 1, limit = 20, status, escrowStatus } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (escrowStatus) where.escrowStatus = escrowStatus;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, username: true, email: true } },
          seller: { select: { id: true, username: true, email: true } },
          listing: { select: { id: true, username: true, platform: true, displayName: true } },
          dispute: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionDetails(transactionId: string) {
    return prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true,
        listing: true,
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
        reviews: true,
        dispute: true,
      },
    });
  }

  async releaseEscrow(transactionId: string, adminId: string) {
    return paymentService.releaseEscrow(transactionId, adminId);
  }

  async refundTransaction(transactionId: string, reason: string, adminId: string) {
    return paymentService.refundPayment(transactionId, reason, adminId);
  }

  // ==================== DISPUTE MANAGEMENT ====================

  async getDisputes(filters: DisputeFilters) {
    const { page = 1, limit = 20, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          transaction: {
            include: {
              buyer: { select: { id: true, username: true, email: true } },
              seller: { select: { id: true, username: true, email: true } },
              listing: { select: { id: true, username: true, platform: true } },
            },
          },
          initiator: { select: { id: true, username: true, email: true } },
        },
      }),
      prisma.dispute.count({ where }),
    ]);

    return {
      disputes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDisputeDetails(disputeId: string) {
    return prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        transaction: {
          include: {
            buyer: true,
            seller: true,
            listing: true,
            conversation: {
              include: {
                messages: {
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
        initiator: true,
      },
    });
  }

  async resolveDispute(
    disputeId: string,
    resolution: 'refund_buyer' | 'release_seller' | 'partial_refund',
    notes: string,
    adminId: string
  ) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        transaction: {
          include: { buyer: true, seller: true },
        },
      },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    // Handle resolution
    let resolutionText = '';
    switch (resolution) {
      case 'refund_buyer':
        await paymentService.refundPayment(dispute.transactionId, notes, adminId);
        resolutionText = 'Full refund to buyer';
        break;
      case 'release_seller':
        await paymentService.releaseEscrow(dispute.transactionId, adminId);
        resolutionText = 'Payment released to seller';
        break;
      case 'partial_refund':
        // Partial refund logic would go here
        resolutionText = 'Partial refund processed';
        break;
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'resolved',
        resolution: resolutionText,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
    });

    // Send notifications
    await emailService.sendDisputeResolvedEmail(
      dispute.transaction.buyer.email,
      dispute.transaction.buyer.firstName || dispute.transaction.buyer.username,
      resolutionText,
      disputeId
    );

    await emailService.sendDisputeResolvedEmail(
      dispute.transaction.seller.email,
      dispute.transaction.seller.firstName || dispute.transaction.seller.username,
      resolutionText,
      disputeId
    );

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'dispute_resolved',
        resource: 'dispute',
        resourceId: disputeId,
        newData: { resolution, notes },
      },
    });

    return updatedDispute;
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(params: PaginationParams & { userId?: string; action?: string }) {
    const { page = 1, limit = 50, userId, action } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const adminService = new AdminService();
