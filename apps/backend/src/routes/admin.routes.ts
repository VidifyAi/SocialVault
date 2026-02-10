// Admin Routes
// Protected routes for admin operations

import { Router, Response } from 'express';
import { adminService } from '../services/admin.service';
import { messageService } from '../services/message.service';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router: Router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// ==================== DASHBOARD ====================

// GET /admin/dashboard - Get dashboard statistics
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FLAGGED MESSAGES ====================

// GET /admin/messages/flagged - Get flagged messages
router.get('/messages/flagged', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, severity } = req.query;
    const result = await messageService.getFlaggedMessages({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      severity: severity as 'low' | 'medium' | 'high' | undefined,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching flagged messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /admin/messages/flagged/stats - Get flagged message statistics
router.get('/messages/flagged/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await messageService.getFlaggedStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching flagged message stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// GET /admin/users - List all users with filters
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, status, role, kycStatus, search } = req.query;
    const result = await adminService.getUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
      role: role as string,
      kycStatus: kycStatus as string,
      search: search as string,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /admin/users/:id - Get user details
router.get('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await adminService.getUserDetails(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /admin/users/:id/status - Update user status
router.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    const user = await adminService.updateUserStatus(
      req.params.id,
      status,
      reason,
      req.user!.id
    );
    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /admin/users/:id/role - Update user role
router.patch('/users/:id/role', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(
      req.params.id,
      role,
      req.user!.id
    );
    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LISTING MANAGEMENT ====================

// GET /admin/listings - List all listings with filters
router.get('/listings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, status, verificationStatus, platform } = req.query;
    const result = await adminService.getListings({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
      verificationStatus: verificationStatus as string,
      platform: platform as string,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /admin/listings/:id - Get listing details
router.get('/listings/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const listing = await adminService.getListingDetails(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /admin/listings/:id/verify - Verify a listing
router.post('/listings/:id/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const listing = await adminService.verifyListing(req.params.id, req.user!.id);
    res.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Error verifying listing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /admin/listings/:id/reject - Reject a listing
router.post('/listings/:id/reject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Reason is required' });
    }
    const listing = await adminService.rejectListing(req.params.id, reason, req.user!.id);
    res.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Error rejecting listing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /admin/listings/:id/suspend - Suspend a listing
router.post('/listings/:id/suspend', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Reason is required' });
    }
    const listing = await adminService.suspendListing(req.params.id, reason, req.user!.id);
    res.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Error suspending listing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== TRANSACTION MANAGEMENT ====================

// GET /admin/transactions - List all transactions with filters
router.get('/transactions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, status, escrowStatus } = req.query;
    const result = await adminService.getTransactions({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
      escrowStatus: escrowStatus as string,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /admin/transactions/:id - Get transaction details
router.get('/transactions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transaction = await adminService.getTransactionDetails(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /admin/transactions/:id/release-escrow - Release escrow to seller
router.post('/transactions/:id/release-escrow', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transaction = await adminService.releaseEscrow(req.params.id, req.user!.id);
    res.json({ success: true, data: transaction });
  } catch (error: any) {
    console.error('Error releasing escrow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /admin/transactions/:id/refund - Refund transaction
router.post('/transactions/:id/refund', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Reason is required' });
    }
    const transaction = await adminService.refundTransaction(req.params.id, reason, req.user!.id);
    res.json({ success: true, data: transaction });
  } catch (error: any) {
    console.error('Error refunding transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DISPUTE MANAGEMENT ====================

// GET /admin/disputes - List all disputes with filters
router.get('/disputes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, status } = req.query;
    const result = await adminService.getDisputes({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /admin/disputes/:id - Get dispute details
router.get('/disputes/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dispute = await adminService.getDisputeDetails(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, error: 'Dispute not found' });
    }
    res.json({ success: true, data: dispute });
  } catch (error: any) {
    console.error('Error fetching dispute:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /admin/disputes/:id/resolve - Resolve a dispute
router.post('/disputes/:id/resolve', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resolution, notes } = req.body;
    if (!resolution || !notes) {
      return res.status(400).json({ 
        success: false, 
        error: 'Resolution and notes are required' 
      });
    }
    const dispute = await adminService.resolveDispute(
      req.params.id,
      resolution,
      notes,
      req.user!.id
    );
    res.json({ success: true, data: dispute });
  } catch (error: any) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== AUDIT LOGS ====================

// GET /admin/audit-logs - Get audit logs
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, userId, action } = req.query;
    const result = await adminService.getAuditLogs({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      userId: userId as string,
      action: action as string,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const adminRouter = router;
