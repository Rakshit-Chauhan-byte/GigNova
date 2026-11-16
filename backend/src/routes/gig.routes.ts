import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getBusinessGigs,
  getGigApplications,
  getCategories,
} from '../controllers/gig.controller';

export const gigRouter = Router();

gigRouter.get('/', authenticate, getGigs);
gigRouter.get('/categories', authenticate, getCategories);
gigRouter.get('/business/mine', authenticate, requireRole('BUSINESS'), getBusinessGigs);
gigRouter.get('/:id', authenticate, getGigById);
gigRouter.post('/', authenticate, requireRole('BUSINESS'), createGig);
gigRouter.put('/:id', authenticate, requireRole('BUSINESS'), updateGig);
gigRouter.delete('/:id', authenticate, deleteGig);
gigRouter.get('/:id/applications', authenticate, requireRole('BUSINESS'), getGigApplications);
