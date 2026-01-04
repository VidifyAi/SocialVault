import { Router, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';
import { validate } from '../middleware/validate';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { sendMessageSchema } from '../validators/schemas';

const router: Router = Router();

// GET /messages/conversations - Get all conversations
router.get(
  '/conversations',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const conversations = await messageService.getConversations(
        req.user!.userId
      );
      res.json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /messages/unread-count - Get unread message count
router.get(
  '/unread-count',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const count = await messageService.getUnreadCount(req.user!.userId);
      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /messages/conversations/:id - Get conversation details
router.get(
  '/conversations/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await messageService.getConversation(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /messages/conversations/:id/messages - Get messages in conversation
router.get(
  '/conversations/:id/messages',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const before = req.query.before as string | undefined;

      const messages = await messageService.getMessages(
        req.params.id,
        req.user!.userId,
        limit,
        before
      );
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /messages - Send a message
router.post(
  '/',
  authenticate,
  validate(sendMessageSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await messageService.sendMessage({
        senderId: req.user!.userId,
        ...req.body,
      });
      
      // Return message with warning if content was flagged
      res.status(201).json({
        success: true,
        data: result.message,
        warning: result.warning,
        flagged: result.flagged,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /messages/conversations/:id/read - Mark messages as read
router.post(
  '/conversations/:id/read',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await messageService.markAsRead(
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

export { router as messageRouter };
