import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const gigSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  category: z.string().min(1),
  requiredSkills: z.array(z.string()),
  compensation: z.string().min(1),
  compensationType: z.enum(['fixed', 'hourly', 'monthly']).default('fixed'),
  workType: z.enum(['remote', 'onsite', 'hybrid']).default('remote'),
  location: z.string().optional(),
  duration: z.string().optional(),
  openings: z.number().int().positive().default(1),
  deadline: z.string().optional(),
  requiredAvailability: z.string().optional(),
});

export const createGig = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = gigSchema.parse(req.body);

  const business = await prisma.businessProfile.findUnique({ where: { userId: req.user!.id } });
  if (!business) throw new AppError('Business profile not found', 404);

  const gig = await prisma.gig.create({
    data: {
      businessId: business.id,
      title: data.title,
      description: data.description,
      category: data.category,
      requiredSkills: JSON.stringify(data.requiredSkills),
      compensation: data.compensation,
      compensationType: data.compensationType,
      workType: data.workType,
      location: data.location,
      duration: data.duration,
      openings: data.openings,
      deadline: data.deadline ? new Date(data.deadline) : null,
      requiredAvailability: data.requiredAvailability,
    },
  });

  res.status(201).json({
    message: 'Gig created successfully',
    gig: { ...gig, requiredSkills: JSON.parse(gig.requiredSkills) },
  });
};

export const getGigs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, category, workType, skills, sort } = req.query;

  const where: Record<string, unknown> = { status: 'ACTIVE', isSuspended: false };

  if (search) {
    where.OR = [
      { title: { contains: String(search) } },
      { description: { contains: String(search) } },
    ];
  }
  if (category) where.category = String(category);
  if (workType) where.workType = String(workType);

  let gigs = await prisma.gig.findMany({
    where: where as any,
    include: {
      business: {
        select: {
          businessName: true,
          verificationStatus: true,
          logoUrl: true,
          location: true,
          userId: true,
        },
      },
      _count: { select: { applications: true } },
    },
    orderBy: sort === 'compensation' ? { compensation: 'asc' } : { createdAt: 'desc' },
  });

  if (skills) {
    const skillList = String(skills)
      .split(',')
      .map((s) => s.trim().toLowerCase());
    gigs = gigs.filter((g) => {
      const gigSkills: string[] = JSON.parse(g.requiredSkills || '[]');
      return skillList.some((s) => gigSkills.map((gs) => gs.toLowerCase()).includes(s));
    });
  }

  const parsed = gigs.map((g) => ({ ...g, requiredSkills: JSON.parse(g.requiredSkills || '[]') }));

  res.json({ gigs: parsed, total: parsed.length });
};

export const getGigById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const gig = await prisma.gig.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          businessName: true,
          verificationStatus: true,
          logoUrl: true,
          location: true,
          userId: true,
          description: true,
          industry: true,
        },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!gig) throw new AppError('Gig not found', 404);
  if (gig.isSuspended && req.user?.role !== 'ADMIN') {
    throw new AppError('This gig is not available', 403);
  }

  let hasApplied = false;
  let applicationStatus: string | null = null;
  if (req.user?.role === 'STUDENT') {
    const existing = await prisma.application.findFirst({
      where: { gigId: id, studentId: req.user.id },
    });
    hasApplied = !!existing;
    applicationStatus = existing?.status || null;
  }

  res.json({
    gig: { ...gig, requiredSkills: JSON.parse(gig.requiredSkills || '[]') },
    hasApplied,
    applicationStatus,
  });
};

export const updateGig = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = gigSchema.partial().parse(req.body);

  const gig = await prisma.gig.findUnique({ where: { id }, include: { business: true } });
  if (!gig) throw new AppError('Gig not found', 404);
  if (gig.business.userId !== req.user!.id) throw new AppError('Unauthorized', 403);

  const updateData: Record<string, unknown> = { ...data };
  if (data.requiredSkills) updateData.requiredSkills = JSON.stringify(data.requiredSkills);
  if (data.deadline) updateData.deadline = new Date(data.deadline);

  const updated = await prisma.gig.update({ where: { id }, data: updateData });
  res.json({
    message: 'Gig updated',
    gig: { ...updated, requiredSkills: JSON.parse(updated.requiredSkills) },
  });
};

export const deleteGig = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const gig = await prisma.gig.findUnique({ where: { id }, include: { business: true } });
  if (!gig) throw new AppError('Gig not found', 404);
  if (gig.business.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Unauthorized', 403);
  }

  await prisma.gig.update({ where: { id }, data: { status: 'DELETED' } });
  res.json({ message: 'Gig deleted' });
};

export const getBusinessGigs = async (req: AuthRequest, res: Response): Promise<void> => {
  const business = await prisma.businessProfile.findUnique({ where: { userId: req.user!.id } });
  if (!business) throw new AppError('Business profile not found', 404);

  const gigs = await prisma.gig.findMany({
    where: { businessId: business.id, status: { not: 'DELETED' } },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    gigs: gigs.map((g) => ({ ...g, requiredSkills: JSON.parse(g.requiredSkills || '[]') })),
  });
};

export const getGigApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const gig = await prisma.gig.findUnique({ where: { id }, include: { business: true } });
  if (!gig) throw new AppError('Gig not found', 404);
  if (gig.business.userId !== req.user!.id) throw new AppError('Unauthorized', 403);

  const applications = await prisma.application.findMany({
    where: { gigId: id },
    include: { student: { include: { studentProfile: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const parsed = applications.map((a) => ({
    ...a,
    student: {
      ...a.student,
      studentProfile: a.student.studentProfile
        ? {
            ...a.student.studentProfile,
            skills: JSON.parse(a.student.studentProfile.skills || '[]'),
          }
        : null,
    },
  }));

  res.json({ applications: parsed });
};

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  const gigs = await prisma.gig.findMany({ where: { status: 'ACTIVE' }, select: { category: true } });
  const categories = [...new Set(gigs.map((g) => g.category))].filter(Boolean);
  res.json({ categories });
};
