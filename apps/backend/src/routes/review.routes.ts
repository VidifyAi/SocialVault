import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createReviewSchema = z.object({
  transactionId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Create a review
router.post('/', authenticate, validate(createReviewSchema), async (req, res, next) => {
  try {
    const { transactionId, rating, comment } = req.body;
    const userId = req.user!.id;

    // Check if transaction exists and is completed
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed transactions' });
    }

    // Determine who is being reviewed
    let revieweeId: string;
    if (transaction.buyerId === userId) {
      revieweeId = transaction.sellerId;
    } else if (transaction.sellerId === userId) {
      revieweeId = transaction.buyerId;
    } else {
      return res.status(403).json({ message: 'Not authorized to review this transaction' });
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        transactionId,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this transaction' });
    }

    const review = await prisma.review.create({
      data: {
        transactionId,
        reviewerId: userId,
        revieweeId,
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: {
            select: { id: true, username: true, avatarUrl: true },
          },
          transaction: {
            include: {
              listing: {
                select: { id: true, title: true, platform: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { revieweeId: userId } }),
    ]);

    // Calculate average rating
    const avgResult = await prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    });

    res.json({
      reviews,
      averageRating: avgResult._avg.rating || 0,
      totalReviews: avgResult._count,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Get reviews for a listing's seller
router.get('/listing/:listingId', async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: listing.sellerId },
      include: {
        reviewer: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate average rating
    const avgResult = await prisma.review.aggregate({
      where: { revieweeId: listing.sellerId },
      _avg: { rating: true },
      _count: true,
    });

    res.json({
      reviews,
      averageRating: avgResult._avg.rating || 0,
      totalReviews: avgResult._count,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
