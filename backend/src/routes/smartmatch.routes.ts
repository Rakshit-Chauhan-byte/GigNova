import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getGigSmartMatchResults,
  getApplicantSmartMatchReport,
  recalculateGigScores,
  toggleApplicantShortlist,
  bulkShortlistTopCandidates,
} from '../controllers/smartmatch.controller';

export const smartMatchRouter = Router();

smartMatchRouter.use(authenticate);
smartMatchRouter.use(requireRole('BUSINESS', 'ADMIN'));

// Get all smart match results for a gig (ranked, filtered, stats)
smartMatchRouter.get('/gig/:gigId', getGigSmartMatchResults);

// Get single applicant detailed compatibility report
smartMatchRouter.get('/gig/:gigId/applicant/:applicationId', getApplicantSmartMatchReport);

// Force recalculate scores for a gig
smartMatchRouter.post('/gig/:gigId/recalculate', recalculateGigScores);

// Toggle shortlist flag for an applicant
smartMatchRouter.patch('/application/:applicationId/shortlist', toggleApplicantShortlist);

// Bulk shortlist top N eligible applicants
smartMatchRouter.post('/gig/:gigId/bulk-shortlist', bulkShortlistTopCandidates);
