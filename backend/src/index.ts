import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import { authRouter } from './routes/auth.routes';
import { studentRouter } from './routes/student.routes';
import { businessRouter } from './routes/business.routes';
import { gigRouter } from './routes/gig.routes';
import { applicationRouter } from './routes/application.routes';
import { adminRouter } from './routes/admin.routes';
import { reportRouter } from './routes/report.routes';
import { matchRouter } from './routes/match.routes';
import { smartMatchRouter } from './routes/smartmatch.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'GigNova API' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/business', businessRouter);
app.use('/api/gigs', gigRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportRouter);
app.use('/api/match', matchRouter);
app.use('/api/smartmatch', smartMatchRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 GigNova API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  });
}

export default app;
