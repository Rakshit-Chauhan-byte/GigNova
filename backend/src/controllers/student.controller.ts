import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  college: z.string().optional(),
  degree: z.string().optional(),
  yearOfStudy: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  availability: z.any().optional(),
  preferredWorkType: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  bio: z.string().max(500).optional(),
});

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user!.id },
    include: { user: { select: { email: true, createdAt: true } } },
  });
  if (!profile) throw new AppError('Profile not found', 404);

  res.json({
    profile: {
      ...profile,
      skills: JSON.parse(profile.skills || '[]'),
      availability: profile.availability ? JSON.parse(profile.availability) : null,
    },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = updateProfileSchema.parse(req.body);

  const updateData: Record<string, unknown> = { ...data };
  if (data.skills !== undefined) {
    updateData.skills = JSON.stringify(data.skills);
  }
  if (data.availability !== undefined) {
    updateData.availability = JSON.stringify(data.availability);
  }

  const profile = await prisma.studentProfile.update({
    where: { userId: req.user!.id },
    data: updateData,
  });

  res.json({
    message: 'Profile updated successfully',
    profile: {
      ...profile,
      skills: JSON.parse(profile.skills || '[]'),
      availability: profile.availability ? JSON.parse(profile.availability) : null,
    },
  });
};

export const uploadProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const url = `/uploads/${req.file.filename}`;
  await prisma.studentProfile.update({
    where: { userId: req.user!.id },
    data: { profilePicture: url },
  });

  res.json({ message: 'Profile picture updated', url });
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const [profile, applications] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.application.findMany({
      where: { studentId: userId },
      include: {
        gig: {
          include: {
            business: {
              select: { businessName: true, verificationStatus: true, logoUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'PENDING').length,
    underReview: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
    accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
    withdrawn: applications.filter((a) => a.status === 'WITHDRAWN').length,
    completed: applications.filter((a) => a.status === 'COMPLETED').length,
  };

  res.json({ profile, stats, recentApplications: applications.slice(0, 5) });
};

export const getPublicProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: id },
    select: {
      fullName: true,
      profilePicture: true,
      college: true,
      degree: true,
      yearOfStudy: true,
      skills: true,
      experience: true,
      portfolioUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      bio: true,
      preferredWorkType: true,
    },
  });
  if (!profile) throw new AppError('Student profile not found', 404);

  res.json({
    profile: {
      ...profile,
      skills: JSON.parse(profile.skills || '[]'),
    },
  });
};
