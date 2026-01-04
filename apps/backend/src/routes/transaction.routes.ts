import { Router, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { validate } from '../middleware/validate';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { 
  initiateTransactionSchema, 
  updateTransferStepSchema 
} from '../validators/schemas';

const router = Router();

// GET /transactions - Get my transactions
router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.query.role as 'buyer' | 'seller' | 'all' | undefined;
      const transactions = await transactionService.getMyTransactions(
        req.user!.userId,
        role || 'all'
      );
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /transactions/my - Alias for getting my transactions (frontend compatibility)
router.get(
  '/my',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const type = req.query.type as 'buyer' | 'seller' | 'all' | undefined;
      const transactions = await transactionService.getMyTransactions(
        req.user!.userId,
        type || 'all'
      );
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /transactions/:id - Get single transaction
router.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.getById(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /transactions - Create new transaction (purchase)
router.post(
  '/',
  authenticate,
  validate(initiateTransactionSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.create(
        req.body.listingId,
        req.user!.userId,
        req.body.offerId
      );
      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /transactions/:id/transfer/steps/:stepNumber/complete
router.post(
  '/:id/transfer/steps/:stepNumber/complete',
  authenticate,
  validate(updateTransferStepSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.completeTransferStep(
        req.params.id,
        parseInt(req.params.stepNumber, 10),
        req.user!.userId,
        req.body
      );
      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /transactions/:id/confirm-transfer
router.post(
  '/:id/confirm-transfer',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.confirmTransferComplete(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /transactions/:id/cancel
router.post(
  '/:id/cancel',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.cancel(
        req.params.id,
        req.user!.userId,
        req.body.reason
      );
      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as transactionRouter };
