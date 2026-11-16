import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getDashboard,
  getPublicProfile,
} from '../controllers/student.controller';

export const studentRouter = Router();

studentRouter.use(authenticate);

studentRouter.get('/profile', requireRole('STUDENT'), getProfile);
studentRouter.put('/profile', requireRole('STUDENT'), updateProfile);
studentRouter.post(
  '/profile/picture',
  requireRole('STUDENT'),
  upload.single('picture'),
  uploadProfilePicture
);
studentRouter.get('/dashboard', requireRole('STUDENT'), getDashboard);
studentRouter.get('/profile/:id/public', getPublicProfile);
