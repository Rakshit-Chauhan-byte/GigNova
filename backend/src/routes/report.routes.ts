import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createReport, getMyReports } from '../controllers/report.controller';

export const reportRouter = Router();

reportRouter.use(authenticate);
reportRouter.post('/', createReport);
reportRouter.get('/mine', getMyReports);
