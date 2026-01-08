import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { createNotifications } from '../utils/notifications';
import { Server as SocketServer } from 'socket.io';
import { emitNotification } from '../websocket';

interface CreateOfferData {
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  expiresInHours?: number;
}

export class OfferService {
  async create(data: CreateOfferData) {
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.status !== 'active') {
      throw new BadRequestError('This listing is not available');
    }

    if (listing.sellerId === data.buyerId) {
      throw new BadRequestError('You cannot make an offer on your own listing');
    }

    // Check for existing pending offer
    const existingOffer = await prisma.offer.findFirst({
      where: {
        listingId: data.listingId,
        buyerId: data.buyerId,
        status: 'pending',
      },
    });

    if (existingOffer) {
      throw new BadRequestError('You already have a pending offer on this listing');
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || 48));

    const offer = await prisma.offer.create({
      data: {
        listingId: data.listingId,
        buyerId: data.buyerId,
        sellerId: listing.sellerId,
        amount: data.amount,
        message: data.message,
        currency: listing.currency,
        expiresAt,
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
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            trustScore: true,
          },
        },
      },
    });

    // Create notification for seller
    await createNotifications([
      {
        userId: listing.sellerId,
        type: 'offer_received',
        title: 'New Offer Received',
        message: `You received an offer of ₹${offer.amount} for ${listing.displayName || listing.username}`,
        data: { offerId: offer.id, listingId: listing.id },
      },
    ]);

    return offer;
  }

  async getById(id: string, userId: string) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            platform: true,
            username: true,
            displayName: true,
            price: true,
            screenshots: true,
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
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    if (offer.buyerId !== userId && offer.sellerId !== userId) {
      throw new ForbiddenError('You are not part of this offer');
    }

    return offer;
  }

  async getMyOffers(userId: string, role: 'buyer' | 'seller' | 'all' = 'all') {
    const where: any = {};

    if (role === 'buyer') {
      where.buyerId = userId;
    } else if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    return prisma.offer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            platform: true,
            username: true,
            displayName: true,
            price: true,
            screenshots: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async respondToOffer(
    id: string,
    sellerId: string,
    action: 'accept' | 'reject' | 'counter',
    counterAmount?: number,
    message?: string
  ) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    if (offer.sellerId !== sellerId) {
      throw new ForbiddenError('Only the seller can respond to this offer');
    }

    if (offer.status !== 'pending') {
      throw new BadRequestError('This offer is no longer pending');
    }

    if (offer.expiresAt < new Date()) {
      await prisma.offer.update({
        where: { id },
        data: { status: 'expired' },
      });
      throw new BadRequestError('This offer has expired');
    }

    if (action === 'accept') {
      // Accept the offer
      const updatedOffer = await prisma.offer.update({
        where: { id },
        data: { status: 'accepted' },
      });

      // Reject all other pending offers for this listing
      await prisma.offer.updateMany({
        where: {
          listingId: offer.listingId,
          id: { not: id },
          status: 'pending',
        },
        data: { status: 'rejected' },
      });

      // Create notification for buyer
      await createNotifications([
        {
          userId: offer.buyerId,
          type: 'offer_accepted',
          title: 'Offer Accepted',
          message: `Your offer of ₹${offer.amount} has been accepted!`,
          data: { offerId: offer.id, listingId: offer.listingId },
        },
      ]);

      return updatedOffer;
    }

    if (action === 'reject') {
      const updatedOffer = await prisma.offer.update({
        where: { id },
        data: { status: 'rejected' },
      });

      // Create notification for buyer
      await createNotifications([
        {
          userId: offer.buyerId,
          type: 'offer_rejected',
          title: 'Offer Rejected',
          message: `Your offer of ₹${offer.amount} was rejected.`,
          data: { offerId: offer.id, listingId: offer.listingId },
        },
      ]);

      return updatedOffer;
    }

    if (action === 'counter') {
      if (!counterAmount) {
        throw new BadRequestError('Counter amount is required');
      }

      // Create counter offer
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const counterOffer = await prisma.offer.create({
        data: {
          listingId: offer.listingId,
          buyerId: offer.buyerId,
          sellerId: offer.sellerId,
          amount: counterAmount,
          message,
          currency: offer.currency,
          expiresAt,
          counterOfferId: offer.id,
        },
      });

      // Mark original offer as countered
      await prisma.offer.update({
        where: { id },
        data: { status: 'countered' },
      });

      // TODO: Create notification for buyer

      return counterOffer;
    }

    throw new BadRequestError('Invalid action');
  }

  async withdrawOffer(id: string, buyerId: string) {
    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    if (offer.buyerId !== buyerId) {
      throw new ForbiddenError('Only the buyer can withdraw this offer');
    }

    if (offer.status !== 'pending') {
      throw new BadRequestError('This offer cannot be withdrawn');
    }

    return prisma.offer.update({
      where: { id },
      data: { status: 'withdrawn' },
    });
  }

  async getOffersForListing(listingId: string, sellerId: string) {
    // Verify seller owns the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.sellerId !== sellerId) {
      throw new ForbiddenError('You do not own this listing');
    }

    return prisma.offer.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            trustScore: true,
            kycStatus: true,
          },
        },
      },
    });
  }

  // Cron job to expire old offers
  async expireOldOffers() {
    const result = await prisma.offer.updateMany({
      where: {
        status: 'pending',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'expired' },
    });

    return result.count;
  }
}

export const offerService = new OfferService();
