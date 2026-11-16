import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  getProfile,
  updateProfile,
  uploadLogo,
  submitVerification,
  getDashboard,
  getPublicProfile,
} from '../controllers/business.controller';

export const businessRouter = Router();

businessRouter.use(authenticate);
businessRouter.get('/profile', requireRole('BUSINESS'), getProfile);
businessRouter.put('/profile', requireRole('BUSINESS'), updateProfile);
businessRouter.post('/profile/logo', requireRole('BUSINESS'), upload.single('logo'), uploadLogo);
businessRouter.post('/verification', requireRole('BUSINESS'), submitVerification);
businessRouter.get('/dashboard', requireRole('BUSINESS'), getDashboard);
businessRouter.get('/profile/:id/public', getPublicProfile);
