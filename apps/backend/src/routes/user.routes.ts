import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/schemas';
import { NotFoundError } from '../utils/errors';
import { markNotificationAsRead, getUnreadCount } from '../utils/notifications';

const router: Router = Router();

// GET /users/profile - Get current user's full profile
router.get(
  '/profile',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
          kycStatus: true,
          kycVerifiedAt: true,
          status: true,
          trustScore: true,
          createdAt: true,
          _count: {
            select: {
              listings: true,
              soldTransactions: { where: { status: 'completed' } },
              purchasedTransactions: { where: { status: 'completed' } },
              reviewsReceived: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Calculate average rating
      const reviews = await prisma.review.aggregate({
        where: { revieweeId: req.user!.userId },
        _avg: { rating: true },
      });

      res.json({
        success: true,
        data: {
          ...user,
          averageRating: reviews._avg.rating || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /users/profile - Update profile
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: req.body,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
        },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/dashboard-stats - Get dashboard statistics for current user
router.get(
  '/dashboard-stats',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      // Get counts for various entities
      const [listings, transactions, offers, messages] = await Promise.all([
        prisma.listing.count({ where: { sellerId: userId } }),
        prisma.transaction.count({
          where: {
            OR: [{ buyerId: userId }, { sellerId: userId }],
          },
        }),
        prisma.offer.count({
          where: {
            OR: [
              { buyerId: userId },
              { listing: { sellerId: userId } },
            ],
          },
        }),
        prisma.message.count({
          where: {
            conversation: {
              participants: { some: { id: userId } },
            },
          },
        }),
      ]);

      // Get active listings count
      const activeListings = await prisma.listing.count({
        where: { sellerId: userId, status: 'active' },
      });

      // Get pending offers count
      const pendingOffers = await prisma.offer.count({
        where: {
          listing: { sellerId: userId },
          status: 'pending',
        },
      });

      // Get completed transactions count and total earnings
      const completedTransactions = await prisma.transaction.findMany({
        where: {
          sellerId: userId,
          status: 'completed',
        },
        select: { sellerPayout: true },
      });

      const totalEarnings = completedTransactions.reduce(
        (sum, t) => sum + (t.sellerPayout || 0),
        0
      );

      // Get unread notifications count
      const unreadNotifications = await prisma.notification.count({
        where: { userId, read: false },
      });

      res.json({
        success: true,
        data: {
          listings: {
            total: listings,
            active: activeListings,
          },
          transactions: {
            total: transactions,
            completed: completedTransactions.length,
          },
          offers: {
            total: offers,
            pending: pendingOffers,
          },
          messages: {
            total: messages,
          },
          earnings: {
            total: totalEarnings,
          },
          notifications: {
            unread: unreadNotifications,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/me - Get current user (lightweight)
router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          clerkId: true,
          email: true,
          username: true,
          role: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
          kycStatus: true,
          kycVerifiedAt: true,
          status: true,
          trustScore: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/:id - Get public profile
router.get(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Guard against malformed ObjectId to avoid Prisma errors
      if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
        throw new NotFoundError('User');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          role: true,
          kycStatus: true,
          trustScore: true,
          createdAt: true,
          _count: {
            select: {
              listings: { where: { status: 'active' } },
              soldTransactions: { where: { status: 'completed' } },
              reviewsReceived: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Get reviews
      const reviews = await prisma.review.aggregate({
        where: { revieweeId: req.params.id },
        _avg: { rating: true },
      });

      // Get recent reviews
      const recentReviews = await prisma.review.findMany({
        where: { revieweeId: req.params.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
          reviewer: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: {
          ...user,
          averageRating: reviews._avg.rating || 0,
          recentReviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/:id/listings - Get user's public listings
router.get(
  '/:id/listings',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listings = await prisma.listing.findMany({
        where: {
          sellerId: req.params.id,
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          platform: true,
          username: true,
          displayName: true,
          niche: true,
          metrics: true,
          price: true,
          currency: true,
          screenshots: true,
          verificationStatus: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/:id/reviews - Get user's reviews
router.get(
  '/:id/reviews',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { revieweeId: req.params.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            reviewer: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            transaction: {
              select: {
                listing: {
                  select: {
                    platform: true,
                    username: true,
                  },
                },
              },
            },
          },
        }),
        prisma.review.count({ where: { revieweeId: req.params.id } }),
      ]);

      res.json({
        success: true,
        data: reviews,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin routes
// GET /users - List all users (admin only)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = (page - 1) * limit;
      const status = req.query.status as string | undefined;
      const role = req.query.role as string | undefined;

      const where: any = {};
      if (status) where.status = status;
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
            kycStatus: true,
            trustScore: true,
            createdAt: true,
            lastLoginAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /users/:id/status - Update user status (admin only)
router.put(
  '/:id/status',
  authenticate,
  authorize('admin'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { status },
        select: {
          id: true,
          email: true,
          username: true,
          status: true,
        },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== NOTIFICATIONS ====================

// GET /users/notifications - Get current user's notifications
router.get(
  '/notifications',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = (page - 1) * limit;
      const unreadOnly = req.query.unreadOnly === 'true';

      const where: any = { userId: req.user!.userId };
      if (unreadOnly) {
        where.read = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      res.json({
        success: true,
        data: notifications,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/notifications/unread-count - Get unread notification count
router.get(
  '/notifications/unread-count',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const count = await getUnreadCount(req.user!.userId);
      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /users/notifications/:id/read - Mark notification as read
router.post(
  '/notifications/:id/read',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Verify notification belongs to user
      const notification = await prisma.notification.findUnique({
        where: { id: req.params.id },
      });

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      if (notification.userId !== req.user!.userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized',
        });
      }

      await markNotificationAsRead(req.params.id, req.user!.userId);

      res.json({
        success: true,
        data: { id: req.params.id, read: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /users/notifications/read-all - Mark all notifications as read
router.post(
  '/notifications/read-all',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: req.user!.userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      res.json({
        success: true,
        data: { message: 'All notifications marked as read' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as userRouter };
