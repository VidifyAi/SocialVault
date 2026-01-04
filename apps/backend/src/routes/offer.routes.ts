import { Router, Response, NextFunction } from 'express';
import { offerService } from '../services/offer.service';
import { validate } from '../middleware/validate';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createOfferSchema, offerResponseSchema } from '../validators/schemas';

const router: Router = Router();

// GET /offers - Get my offers
router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.query.role as 'buyer' | 'seller' | 'all' | undefined;
      const offers = await offerService.getMyOffers(
        req.user!.userId,
        role || 'all'
      );
      res.json({
        success: true,
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /offers/:id - Get single offer
router.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await offerService.getById(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /offers - Create new offer
router.post(
  '/',
  authenticate,
  validate(createOfferSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await offerService.create({
        ...req.body,
        buyerId: req.user!.userId,
      });
      res.status(201).json({
        success: true,
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /offers/:id/respond - Accept, reject, or counter an offer
router.post(
  '/:id/respond',
  authenticate,
  validate(offerResponseSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await offerService.respondToOffer(
        req.params.id,
        req.user!.userId,
        req.body.action,
        req.body.counterAmount,
        req.body.message
      );
      res.json({
        success: true,
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /offers/:id/withdraw - Withdraw an offer
router.post(
  '/:id/withdraw',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await offerService.withdrawOffer(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /offers/listing/:listingId - Get all offers for a listing (seller only)
router.get(
  '/listing/:listingId',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const offers = await offerService.getOffersForListing(
        req.params.listingId,
        req.user!.userId
      );
      res.json({
        success: true,
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as offerRouter };
