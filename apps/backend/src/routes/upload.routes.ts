// Upload Routes
// Handles file uploads for listings, transactions, disputes, etc.

import { Router, Response } from 'express';
import multer from 'multer';
import { uploadService } from '../services/upload.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/quicktime',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// POST /uploads/listing/:listingId/screenshots - Upload listing screenshots
router.post('/listing/:listingId/screenshots', upload.array('files', 10), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (listing.sellerId !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Upload files
    const uploadResults = await Promise.all(
      files.map((file) =>
        uploadService.uploadListingScreenshot(
          file.buffer,
          file.originalname,
          file.mimetype,
          listingId
        )
      )
    );

    // Update listing with new screenshot URLs
    const newScreenshots = uploadResults.map((r) => r.url);
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        screenshots: {
          push: newScreenshots,
        },
      },
    });

    res.json({
      success: true,
      data: {
        files: uploadResults.map((r) => ({
          key: r.key,
          url: r.url,
          size: r.size,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error uploading screenshots:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /uploads/listing/:listingId/verification - Upload verification proof
router.post('/listing/:listingId/verification', upload.array('files', 5), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (listing.sellerId !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Upload files
    const uploadResults = await Promise.all(
      files.map((file) =>
        uploadService.uploadVerificationProof(
          file.buffer,
          file.originalname,
          file.mimetype,
          listingId
        )
      )
    );

    // Update listing with verification proof URLs
    const newProofs = uploadResults.map((r) => r.url);
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        verificationProof: {
          push: newProofs,
        },
        verificationStatus: 'pending', // Mark for review
      },
    });

    res.json({
      success: true,
      data: {
        files: uploadResults.map((r) => ({
          key: r.key,
          url: r.url,
          size: r.size,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error uploading verification proof:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /uploads/transaction/:transactionId/transfer-proof - Upload transfer step proof
router.post('/transaction/:transactionId/transfer-proof', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { stepNumber } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    if (!stepNumber) {
      return res.status(400).json({ success: false, error: 'Step number is required' });
    }

    // Verify transaction access
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    if (transaction.buyerId !== req.user!.userId && transaction.sellerId !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Upload file
    const result = await uploadService.uploadTransferProof(
      file.buffer,
      file.originalname,
      file.mimetype,
      transactionId,
      parseInt(stepNumber)
    );

    // Update transfer progress
    const transferProgress = (transaction.transferProgress as any[]) || [];
    const stepIndex = transferProgress.findIndex((s: any) => s.step === parseInt(stepNumber));

    if (stepIndex >= 0) {
      transferProgress[stepIndex] = {
        ...transferProgress[stepIndex],
        proofUrl: result.url,
        completedAt: new Date(),
        completedBy: req.user!.userId,
      };
    } else {
      transferProgress.push({
        step: parseInt(stepNumber),
        proofUrl: result.url,
        completedAt: new Date(),
        completedBy: req.user!.userId,
      });
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        transferProgress: transferProgress,
        currentStep: Math.max(transaction.currentStep, parseInt(stepNumber)),
      },
    });

    res.json({
      success: true,
      data: {
        key: result.key,
        url: result.url,
        stepNumber: parseInt(stepNumber),
      },
    });
  } catch (error: any) {
    console.error('Error uploading transfer proof:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /uploads/dispute/:disputeId/evidence - Upload dispute evidence
router.post('/dispute/:disputeId/evidence', upload.array('files', 10), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    // Verify dispute access
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { transaction: true },
    });

    if (!dispute) {
      return res.status(404).json({ success: false, error: 'Dispute not found' });
    }

    // Allow both buyer and seller to upload evidence
    if (
      dispute.transaction.buyerId !== req.user!.userId &&
      dispute.transaction.sellerId !== req.user!.userId
    ) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Upload files
    const uploadResults = await Promise.all(
      files.map((file) =>
        uploadService.uploadDisputeEvidence(
          file.buffer,
          file.originalname,
          file.mimetype,
          disputeId
        )
      )
    );

    // Update dispute with evidence URLs
    const newEvidence = uploadResults.map((r) => r.url);
    await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        evidence: {
          push: newEvidence,
        },
      },
    });

    res.json({
      success: true,
      data: {
        files: uploadResults.map((r) => ({
          key: r.key,
          url: r.url,
          size: r.size,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error uploading dispute evidence:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /uploads/message/:conversationId/attachment - Upload message attachment
router.post('/message/:conversationId/attachment', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Verify conversation access
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: req.user!.userId,
        },
      },
    });

    if (!participant) {
      return res.status(403).json({ success: false, error: 'Not a participant' });
    }

    // Upload file
    const result = await uploadService.uploadMessageAttachment(
      file.buffer,
      file.originalname,
      file.mimetype,
      conversationId
    );

    res.json({
      success: true,
      data: {
        key: result.key,
        url: result.url,
        size: result.size,
        contentType: result.contentType,
      },
    });
  } catch (error: any) {
    console.error('Error uploading message attachment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /uploads/avatar - Upload user avatar
router.post('/avatar', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Upload file
    const result = await uploadService.uploadAvatar(
      file.buffer,
      file.originalname,
      file.mimetype,
      req.user!.userId
    );

    // Update user avatar
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatarUrl: result.url },
    });

    res.json({
      success: true,
      data: {
        url: result.url,
      },
    });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /uploads/presign - Get presigned URL for client-side upload
router.post('/presign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { folder, filename, contentType } = req.body;

    if (!folder || !filename || !contentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'folder, filename, and contentType are required' 
      });
    }

    const result = await uploadService.createUploadSession(folder, filename, contentType);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error creating presigned URL:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /uploads - Delete a file
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ success: false, error: 'Key is required' });
    }

    await uploadService.deleteFile(key);

    res.json({ success: true, message: 'File deleted' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const uploadRouter = router;
