import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getAllUsers,
  getUserById,
  suspendUser,
  deleteUser,
  getAllGigs,
  suspendGig,
  getAllReports,
  updateReportStatus,
  getVerificationRequests,
  reviewVerification,
  getAdminStats,
  createAdminUser,
} from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireRole('ADMIN'));

// Dashboard
adminRouter.get('/stats', getAdminStats);
adminRouter.get('/overview', getAdminStats);

// Users
adminRouter.get('/users', getAllUsers);
adminRouter.get('/users/:id', getUserById);
adminRouter.patch('/users/:id/suspend', suspendUser);
adminRouter.delete('/users/:id', deleteUser);
adminRouter.post('/users/admin', createAdminUser);
adminRouter.post('/create-admin', createAdminUser);

// Gigs
adminRouter.get('/gigs', getAllGigs);
adminRouter.patch('/gigs/:id/suspend', suspendGig);
adminRouter.patch('/gigs/:id/moderate', suspendGig);

// Reports
adminRouter.get('/reports', getAllReports);
adminRouter.patch('/reports/:id', updateReportStatus);
adminRouter.patch('/reports/:id/status', updateReportStatus);

// Verifications
adminRouter.get('/verifications', getVerificationRequests);
adminRouter.patch('/verifications/:id', reviewVerification);
adminRouter.patch('/verifications/:id/review', reviewVerification);
