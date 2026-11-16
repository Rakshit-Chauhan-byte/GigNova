import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const reportSchema = z.object({
  reportedUserId: z.string().uuid().optional(),
  reportedGigId: z.string().uuid().optional(),
  reason: z.string().min(3),
  description: z.string().optional(),
}).refine((d) => d.reportedUserId || d.reportedGigId, {
  message: 'Must provide reportedUserId or reportedGigId',
});

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = reportSchema.parse(req.body);

  if (data.reportedUserId === req.user!.id) {
    throw new AppError('You cannot report yourself', 400);
  }

  // Verify target exists
  if (data.reportedUserId) {
    const user = await prisma.user.findUnique({ where: { id: data.reportedUserId } });
    if (!user) throw new AppError('Reported user not found', 404);
  }
  if (data.reportedGigId) {
    const gig = await prisma.gig.findUnique({ where: { id: data.reportedGigId } });
    if (!gig) throw new AppError('Reported gig not found', 404);
    // Flag the gig
    await prisma.gig.update({ where: { id: data.reportedGigId }, data: { isReported: true } });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: req.user!.id,
      reportedUserId: data.reportedUserId,
      reportedGigId: data.reportedGigId,
      reason: data.reason,
      description: data.description,
    },
  });

  res.status(201).json({ message: 'Report submitted', report });
};

export const getMyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const reports = await prisma.report.findMany({
    where: { reporterId: req.user!.id },
    include: {
      reportedUser: { select: { email: true } },
      reportedGig: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ reports });
};
