import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getRecommendedGigs, getGigMatchScore } from '../controllers/match.controller';

export const matchRouter = Router();

matchRouter.use(authenticate);
matchRouter.use(requireRole('STUDENT'));

matchRouter.get('/recommendations', getRecommendedGigs);
matchRouter.get('/score/:gigId', getGigMatchScore);
