import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { listingService } from '../services/listing.service';
import { validate } from '../middleware/validate';
import {
  authenticate,
  optionalAuth,
  authorize,
  AuthenticatedRequest
} from '../middleware/auth';
import { requireKyc } from '../middleware/kycCheck';
import { 
  createListingSchema, 
  updateListingSchema,
  listingQuerySchema 
} from '../validators/schemas';

const router: Router = Router();

// Configure multer for memory storage (for image uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// GET /listings - Search listings (public)
router.get(
  '/',
  validate(listingQuerySchema),
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await listingService.search({
        ...(req.query as any),
        requestingUserId: req.user?.userId,
      });
      res.json({
        success: true,
        data: result.listings,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /listings/my - Get current user's listings
router.get(
  '/my',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const listings = await listingService.getMyListings(
        req.user!.userId,
        status as any
      );
      res.json({
        success: true,
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /listings/verification-code - generate a verification code for ownership proof
router.get(
  '/verification-code',
  authenticate,
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const code = await listingService.generateVerificationCode();
      res.json({ success: true, data: { code } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /listings/profile-preview - fetch public profile info for prefill
router.post(
  '/profile-preview',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { profileUrl } = req.body;
      if (!profileUrl) {
        return res.status(400).json({ success: false, error: 'profileUrl is required' });
      }
      const preview = await listingService.getProfilePreview(profileUrl);
      res.json({ success: true, data: preview });
    } catch (error) {
      next(error);
    }
  }
);

// POST /listings/verify-profile - verify ownership code on public profile
router.post(
  '/verify-profile',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { verificationUrl, verificationCode } = req.body;
      if (!verificationUrl || !verificationCode) {
        return res.status(400).json({ success: false, error: 'verificationUrl and verificationCode are required' });
      }
      const result = await listingService.verifyProfile(verificationUrl, verificationCode);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /listings/favorites - Get user's favorite listings
router.get(
  '/favorites',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listings = await listingService.getFavorites(req.user!.userId);
      res.json({
        success: true,
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /listings/pending - Admin: Get pending listings
router.get(
  '/pending',
  authenticate,
  authorize('admin', 'moderator'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listings = await listingService.getPendingListings();
      res.json({
        success: true,
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /listings/:id - Get single listing
router.get(
  '/:id',
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listing = await listingService.getById(
        req.params.id,
        req.user?.userId
      );
      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /listings/:id/verify - Verify ownership via platform-based proof
router.post(
  '/:id/verify',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listing = await listingService.verifyOwnership(
        req.params.id,
        req.user!.userId,
        req.body.verificationUrl,
        req.body.method
      );
      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /listings - Create new listing
// Any authenticated user can create listings (they become a seller)
router.post(
  '/',
  authenticate,
  requireKyc,
  upload.array('images', 10), // Handle image uploads
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Parse form data - multer puts fields in req.body as strings
      const body = req.body;
      
      // Convert string values to proper types
      const listingData = {
        title: body.title,
        platform: body.platform,
        category: body.category,
        handle: body.handle,
        description: body.description,
        price: parseFloat(body.price) || 0,
        followers: parseInt(body.followers, 10) || 0,
        engagement: parseFloat(body.engagement) || 0,
        accountAge: parseInt(body.accountAge, 10) || 1,
        monthlyRevenue: body.monthlyRevenue ? parseFloat(body.monthlyRevenue) : undefined,
        transferSteps: body.transferSteps,
        sellerId: req.user!.userId,
        // Images will be handled by upload service later
        screenshots: [],
      };

      const listing = await listingService.create(listingData);
      res.status(201).json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /listings/:id - Update listing
router.put(
  '/:id',
  authenticate,
  validate(updateListingSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listing = await listingService.update(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /listings/:id - Delete listing
router.delete(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const isAdmin = ['admin', 'moderator'].includes(req.user!.role);
      const result = await listingService.delete(
        req.params.id,
        req.user!.userId,
        isAdmin
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /listings/:id/favorite - Toggle favorite
router.post(
  '/:id/favorite',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await listingService.toggleFavorite(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /listings/:id/approve - Admin: Approve listing
router.post(
  '/:id/approve',
  authenticate,
  authorize('admin', 'moderator'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listing = await listingService.approveListing(req.params.id);
      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /listings/:id/reject - Admin: Reject listing
router.post(
  '/:id/reject',
  authenticate,
  authorize('admin', 'moderator'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const listing = await listingService.rejectListing(
        req.params.id,
        req.body.reason
      );
      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as listingRouter };
