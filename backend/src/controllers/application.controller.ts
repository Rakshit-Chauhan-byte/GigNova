import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const applySchema = z.object({
  gigId: z.string().uuid(),
  coverLetter: z.string().optional(),
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: ['COMPLETED', 'WITHDRAWN'],
  REJECTED: [],
  WITHDRAWN: [],
  COMPLETED: [],
};

export const applyToGig = async (req: AuthRequest, res: Response): Promise<void> => {
  const { gigId, coverLetter } = applySchema.parse(req.body);

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });
  if (!gig || gig.status !== 'ACTIVE')
    throw new AppError('Gig is not available for applications', 400);
  if (gig.deadline && new Date(gig.deadline) < new Date())
    throw new AppError('Application deadline has passed', 400);

  const existing = await prisma.application.findFirst({
    where: { gigId, studentId: req.user!.id },
  });
  if (existing) throw new AppError('You have already applied to this gig', 409);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: req.user!.id },
  });

  let matchScore = 0;
  if (studentProfile) {
    const studentSkills: string[] = JSON.parse(studentProfile.skills || '[]').map((s: string) =>
      s.toLowerCase()
    );
    const gigSkills: string[] = JSON.parse(gig.requiredSkills || '[]').map((s: string) =>
      s.toLowerCase()
    );

    if (gigSkills.length > 0) {
      const matched = studentSkills.filter((s) => gigSkills.includes(s));
      matchScore = Math.round((matched.length / gigSkills.length) * 60);
    } else {
      matchScore = 60;
    }

    if (studentProfile.availability && gig.requiredAvailability) {
      matchScore += 15;
    } else if (!gig.requiredAvailability) {
      matchScore += 15;
    }

    if (!studentProfile.preferredWorkType || studentProfile.preferredWorkType === gig.workType) {
      matchScore += 10;
    }

    matchScore = Math.min(100, matchScore);
  }

  const application = await prisma.application.create({
    data: { gigId, studentId: req.user!.id, coverLetter, matchScore },
  });

  res.status(201).json({ message: 'Application submitted successfully', application });
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const applications = await prisma.application.findMany({
    where: { studentId: req.user!.id },
    include: {
      gig: {
        include: {
          business: { select: { businessName: true, verificationStatus: true, logoUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    applications: applications.map((a) => ({
      ...a,
      gig: { ...a.gig, requiredSkills: JSON.parse(a.gig.requiredSkills || '[]') },
    })),
  });
};

export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) throw new AppError('Application not found', 404);
  if (application.studentId !== req.user!.id) throw new AppError('Unauthorized', 403);

  if (!VALID_TRANSITIONS[application.status]?.includes('WITHDRAWN')) {
    throw new AppError(`Cannot withdraw an application with status: ${application.status}`, 400);
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status: 'WITHDRAWN' },
  });

  res.json({ message: 'Application withdrawn', application: updated });
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, providerNote } = z
    .object({
      status: z.enum(['UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED']),
      providerNote: z.string().optional(),
    })
    .parse(req.body);

  const application = await prisma.application.findUnique({
    where: { id },
    include: { gig: { include: { business: true } } },
  });

  if (!application) throw new AppError('Application not found', 404);
  if (application.gig.business.userId !== req.user!.id)
    throw new AppError('Unauthorized', 403);

  const allowed = VALID_TRANSITIONS[application.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Cannot change status from ${application.status} to ${status}`,
      400
    );
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status, providerNote: providerNote || application.providerNote },
  });

  res.json({ message: 'Application status updated', application: updated });
};

export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      gig: {
        include: {
          business: {
            select: {
              businessName: true,
              verificationStatus: true,
              logoUrl: true,
              userId: true,
            },
          },
        },
      },
      student: { include: { studentProfile: true } },
    },
  });

  if (!application) throw new AppError('Application not found', 404);

  const userId = req.user!.id;
  const isStudent = application.studentId === userId;
  const isBusiness = application.gig.business.userId === userId;

  if (!isStudent && !isBusiness && req.user!.role !== 'ADMIN') {
    throw new AppError('Unauthorized', 403);
  }

  res.json({
    application: {
      ...application,
      gig: { ...application.gig, requiredSkills: JSON.parse(application.gig.requiredSkills || '[]') },
      student: {
        ...application.student,
        studentProfile: application.student.studentProfile
          ? {
              ...application.student.studentProfile,
              skills: JSON.parse(application.student.studentProfile.skills || '[]'),
            }
          : null,
      },
    },
  });
};
