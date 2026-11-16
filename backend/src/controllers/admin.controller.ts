import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import bcrypt from 'bcryptjs';

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role, search, suspended } = req.query;

  const where: Record<string, unknown> = {};
  if (role) where.role = String(role);
  if (suspended !== undefined) where.isSuspended = suspended === 'true';
  if (search) {
    where.email = { contains: String(search) };
  }

  const users = await prisma.user.findMany({
    where: where as any,
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      isSuspended: true,
      createdAt: true,
      studentProfile: { select: { fullName: true, profilePicture: true } },
      businessProfile: { select: { businessName: true, verificationStatus: true, logoUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ users, total: users.length });
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      isSuspended: true,
      createdAt: true,
      updatedAt: true,
      studentProfile: true,
      businessProfile: true,
      _count: { select: { applicationsAsStudent: true, reportsSubmitted: true, reportsAgainst: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);
  res.json({ user });
};

export const suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { suspend, reason } = z
    .object({ suspend: z.boolean(), reason: z.string().optional() })
    .parse(req.body);

  if (id === req.user!.id) throw new AppError('Cannot suspend yourself', 400);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot suspend another admin', 403);

  await prisma.user.update({ where: { id }, data: { isSuspended: suspend } });

  res.json({
    message: suspend ? `User suspended${reason ? `: ${reason}` : ''}` : 'User reactivated',
  });
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (id === req.user!.id) throw new AppError('Cannot delete yourself', 400);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot delete an admin', 403);

  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User deleted' });
};

// ─── Gigs ─────────────────────────────────────────────────────────────────────

export const getAllGigs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, suspended, reported } = req.query;

  const where: Record<string, unknown> = {};
  if (status) where.status = String(status);
  if (suspended !== undefined) where.isSuspended = suspended === 'true';
  if (reported !== undefined) where.isReported = reported === 'true';

  const gigs = await prisma.gig.findMany({
    where: where as any,
    include: {
      business: { select: { businessName: true, userId: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    gigs: gigs.map((g) => ({ ...g, requiredSkills: JSON.parse(g.requiredSkills || '[]') })),
    total: gigs.length,
  });
};

export const suspendGig = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const body = req.body;

  if (body.action === 'delete') {
    await prisma.gig.update({ where: { id }, data: { status: 'DELETED' } });
    res.json({ message: 'Gig deleted' });
    return;
  }

  let suspend = body.suspend;
  if (body.action === 'suspend') suspend = true;
  if (body.action === 'restore') suspend = false;

  const gig = await prisma.gig.findUnique({ where: { id } });
  if (!gig) throw new AppError('Gig not found', 404);

  await prisma.gig.update({ where: { id }, data: { isSuspended: Boolean(suspend) } });
  res.json({ message: suspend ? `Gig suspended` : 'Gig restored' });
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;

  const reports = await prisma.report.findMany({
    where: status ? { status: String(status) } : undefined,
    include: {
      reporter: { select: { email: true, role: true } },
      reportedUser: { select: { email: true, role: true } },
      reportedGig: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ reports, total: reports.length });
};

export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const body = req.body;
  const statusVal = body.action || body.status;
  const { status, adminNote } = z
    .object({
      status: z.enum(['REVIEWED', 'RESOLVED', 'DISMISSED']),
      adminNote: z.string().optional(),
    })
    .parse({ status: statusVal, adminNote: body.adminNote });

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new AppError('Report not found', 404);

  await prisma.report.update({ where: { id }, data: { status, adminNote } });
  res.json({ message: 'Report status updated' });
};

// ─── Verifications ────────────────────────────────────────────────────────────

export const getVerificationRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;

  const requests = await prisma.verificationRequest.findMany({
    where: status ? { status: String(status) } : undefined,
    include: {
      business: {
        select: {
          businessName: true,
          industry: true,
          location: true,
          userId: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ requests, total: requests.length });
};

export const reviewVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const body = req.body;
  const decisionVal = body.action || body.decision;
  const { decision, adminNote } = z
    .object({
      decision: z.enum(['APPROVED', 'REJECTED']),
      adminNote: z.string().optional(),
    })
    .parse({ decision: decisionVal, adminNote: body.adminNote });

  const request = await prisma.verificationRequest.findUnique({
    where: { id },
    include: { business: true },
  });
  if (!request) throw new AppError('Verification request not found', 404);
  if (request.status !== 'PENDING') {
    throw new AppError('This request has already been reviewed', 400);
  }

  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id },
      data: { status: decision, adminNote },
    }),
    prisma.businessProfile.update({
      where: { id: request.businessId },
      data: {
        verificationStatus: decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
        verificationNote: adminNote,
      },
    }),
  ]);

  res.json({ message: `Verification ${decision.toLowerCase()} successfully` });
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [
    totalUsers,
    totalStudents,
    totalBusinesses,
    suspendedUsers,
    totalGigs,
    activeGigs,
    suspendedGigs,
    totalApplications,
    pendingReports,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'BUSINESS' } }),
    prisma.user.count({ where: { isSuspended: true } }),
    prisma.gig.count({ where: { status: { not: 'DELETED' } } }),
    prisma.gig.count({ where: { status: 'ACTIVE' } }),
    prisma.gig.count({ where: { isSuspended: true } }),
    prisma.application.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
  ]);

  res.json({
    totalUsers,
    totalStudents,
    totalBusinesses,
    suspendedUsers,
    totalGigs,
    activeGigs,
    suspendedGigs,
    totalApplications,
    pendingReports,
    pendingVerifications,
    users: { total: totalUsers, students: totalStudents, businesses: totalBusinesses, suspended: suspendedUsers },
    gigs: { total: totalGigs, active: activeGigs, suspended: suspendedGigs },
    applications: { total: totalApplications },
    reports: { pending: pendingReports },
    verifications: { pending: pendingVerifications },
  });
};

// ─── Admin User Creation ───────────────────────────────────────────────────────

export const createAdminUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = z
    .object({ email: z.string().email(), password: z.string().min(8) })
    .parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, role: 'ADMIN' },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  res.status(201).json({ message: 'Admin user created', user });
};
