import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { transactionService } from '../services/transaction.service';
import { uploadService } from '../services/upload.service';
import { validate } from '../middleware/validate';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { 
  initiateTransactionSchema, 
  updateTransferStepSchema 
} from '../validators/schemas';
import { io } from '../index';

const router: Router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  },
});

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
  upload.single('proof'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let proofUrl: string | undefined;
      
      // Upload proof file if provided
      if (req.file) {
        const uploadResult = await uploadService.uploadTransferProof(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          req.params.id,
          parseInt(req.params.stepNumber, 10)
        );
        proofUrl = uploadResult.url;
      }

      const transaction = await transactionService.completeTransferStep(
        req.params.id,
        parseInt(req.params.stepNumber, 10),
        req.user!.userId,
        {
          proofUrl,
          notes: req.body.notes,
        },
        io
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

// GET /transactions/:id/transfer/status - Get transfer status and steps
router.get(
  '/:id/transfer/status',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.getById(
        req.params.id,
        req.user!.userId
      );
      
      const transferProgress = transaction.transferProgress as any[];
      const currentStep = transferProgress.find((s) => s.status === 'in_progress');
      
      res.json({
        success: true,
        data: {
          currentStep: transaction.currentStep,
          totalSteps: transferProgress.length,
          steps: transferProgress,
          status: transaction.status,
          escrowStatus: transaction.escrowStatus,
        },
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
        req.user!.userId,
        io
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
