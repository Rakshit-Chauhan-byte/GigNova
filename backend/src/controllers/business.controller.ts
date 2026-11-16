import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const updateProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
});

const verificationSchema = z.object({
  taxId: z.string().optional(),
  registrationNo: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.businessProfile.findUnique({
    where: { userId: req.user!.id },
    include: { user: { select: { email: true, createdAt: true } } },
  });
  if (!profile) throw new AppError('Business profile not found', 404);
  res.json({ profile });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = updateProfileSchema.parse(req.body);
  const profile = await prisma.businessProfile.update({
    where: { userId: req.user!.id },
    data,
  });
  res.json({ message: 'Profile updated', profile });
};

export const uploadLogo = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const url = `/uploads/${req.file.filename}`;
  await prisma.businessProfile.update({
    where: { userId: req.user!.id },
    data: { logoUrl: url },
  });
  res.json({ message: 'Logo updated', url });
};

export const submitVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = verificationSchema.parse(req.body);

  const business = await prisma.businessProfile.findUnique({ where: { userId: req.user!.id } });
  if (!business) throw new AppError('Business profile not found', 404);

  if (business.verificationStatus === 'VERIFIED') {
    throw new AppError('Business is already verified', 400);
  }
  if (business.verificationStatus === 'PENDING') {
    throw new AppError('A verification request is already pending', 400);
  }

  await prisma.$transaction([
    prisma.verificationRequest.create({
      data: { businessId: business.id, ...data, status: 'PENDING' },
    }),
    prisma.businessProfile.update({
      where: { id: business.id },
      data: { verificationStatus: 'PENDING' },
    }),
  ]);

  res.json({ message: 'Verification request submitted successfully' });
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const business = await prisma.businessProfile.findUnique({ where: { userId } });
  if (!business) throw new AppError('Business profile not found', 404);

  const [gigs, totalApplications, pendingApplications, acceptedApplications] = await Promise.all([
    prisma.gig.findMany({
      where: { businessId: business.id, status: { not: 'DELETED' } },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.application.count({ where: { gig: { businessId: business.id } } }),
    prisma.application.count({
      where: { gig: { businessId: business.id }, status: 'PENDING' },
    }),
    prisma.application.count({
      where: { gig: { businessId: business.id }, status: 'ACCEPTED' },
    }),
  ]);

  const stats = {
    totalGigs: gigs.length,
    activeGigs: gigs.filter((g) => g.status === 'ACTIVE').length,
    totalApplications,
    pendingApplications,
    acceptedApplications,
  };

  res.json({ business, stats, recentGigs: gigs.slice(0, 5) });
};

export const getPublicProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const profile = await prisma.businessProfile.findUnique({
    where: { userId: id },
    select: {
      businessName: true,
      description: true,
      industry: true,
      businessEmail: true,
      website: true,
      location: true,
      logoUrl: true,
      verificationStatus: true,
    },
  });
  if (!profile) throw new AppError('Business profile not found', 404);
  res.json({ profile });
};
