import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'BUSINESS']),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  businessName: z.string().min(2, 'Business name required').optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  if (data.role === 'STUDENT') {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        fullName: data.fullName || data.email.split('@')[0],
      },
    });
  } else if (data.role === 'BUSINESS') {
    await prisma.businessProfile.create({
      data: {
        userId: user.id,
        businessName: data.businessName || data.email.split('@')[0],
      },
    });
  }

  const token = generateToken(user);

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Account is inactive', 401);
  if (user.isSuspended)
    throw new AppError('Your account has been suspended. Contact support.', 403);

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) throw new AppError('Invalid email or password', 401);

  const token = generateToken(user);

  let profile = null;
  if (user.role === 'STUDENT') {
    profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  } else if (user.role === 'BUSINESS') {
    profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  }

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, role: user.role, profile },
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      isSuspended: true,
      createdAt: true,
      studentProfile: true,
      businessProfile: true,
    },
  });

  if (!user) throw new AppError('User not found', 404);
  res.json({ user });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    })
    .parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new AppError('User not found', 404);

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new AppError('Current password is incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  res.json({ message: 'Password changed successfully' });
};
