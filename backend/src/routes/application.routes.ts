import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  applyToGig,
  getMyApplications,
  withdrawApplication,
  updateApplicationStatus,
  getApplicationById,
} from '../controllers/application.controller';

export const applicationRouter = Router();

applicationRouter.use(authenticate);

applicationRouter.post('/', requireRole('STUDENT'), applyToGig);
applicationRouter.get('/mine', requireRole('STUDENT'), getMyApplications);
applicationRouter.patch('/:id/withdraw', requireRole('STUDENT'), withdrawApplication);
applicationRouter.patch('/:id/status', requireRole('BUSINESS'), updateApplicationStatus);
applicationRouter.get('/:id', getApplicationById);
