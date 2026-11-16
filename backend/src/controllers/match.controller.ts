import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

interface MatchResult {
  gig: Record<string, unknown>;
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  availabilityMatch: boolean;
  workTypeMatch: boolean;
  explanation: string;
}

export const getRecommendedGigs = async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) throw new AppError('Student profile not found', 404);

  const studentSkills: string[] = JSON.parse(profile.skills || '[]').map((s: string) =>
    s.toLowerCase()
  );

  const gigs = await prisma.gig.findMany({
    where: { status: 'ACTIVE', isSuspended: false },
    include: {
      business: {
        select: { businessName: true, verificationStatus: true, logoUrl: true, userId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const results: MatchResult[] = gigs.map((gig) => {
    const gigSkills: string[] = JSON.parse(gig.requiredSkills || '[]').map((s: string) =>
      s.toLowerCase()
    );

    let skillScore = 0;
    let matchingSkills: string[] = [];
    let missingSkills: string[] = [];

    if (gigSkills.length === 0) {
      skillScore = 60;
    } else {
      matchingSkills = gigSkills.filter((s) => studentSkills.includes(s));
      missingSkills = gigSkills.filter((s) => !studentSkills.includes(s));
      skillScore = Math.round((matchingSkills.length / gigSkills.length) * 60);
    }

    let availabilityScore = 0;
    let availabilityMatch = false;
    if (!gig.requiredAvailability) {
      availabilityScore = 25;
      availabilityMatch = true;
    } else if (profile.availability) {
      availabilityScore = 25;
      availabilityMatch = true;
    } else {
      availabilityScore = 10;
    }

    let workTypeScore = 0;
    let workTypeMatch = false;
    if (!profile.preferredWorkType || profile.preferredWorkType === gig.workType) {
      workTypeScore = 15;
      workTypeMatch = true;
    } else if (gig.workType === 'hybrid') {
      workTypeScore = 10;
    } else {
      workTypeScore = 5;
    }

    const score = Math.min(100, skillScore + availabilityScore + workTypeScore);

    const reasons: string[] = [];
    if (matchingSkills.length > 0) {
      reasons.push(`You have ${matchingSkills.length} of ${gigSkills.length} required skills`);
    }
    if (availabilityMatch) reasons.push('Your availability matches');
    if (workTypeMatch) reasons.push(`Work type (${gig.workType}) matches your preference`);
    if (missingSkills.length > 0) {
      reasons.push(`You could improve by learning: ${missingSkills.slice(0, 2).join(', ')}`);
    }

    return {
      gig: { ...gig, requiredSkills: gigSkills },
      score,
      matchingSkills,
      missingSkills,
      availabilityMatch,
      workTypeMatch,
      explanation: reasons.join('. ') || 'This gig may interest you.',
    };
  });

  results.sort((a, b) => b.score - a.score);

  const appliedGigIds = (
    await prisma.application.findMany({
      where: { studentId: req.user!.id },
      select: { gigId: true },
    })
  ).map((a) => a.gigId);

  const filtered = results.filter((r) => !appliedGigIds.includes(r.gig.id as string));

  res.json({ recommendations: filtered.slice(0, 20) });
};

export const getGigMatchScore = async (req: AuthRequest, res: Response): Promise<void> => {
  const { gigId } = req.params;

  const [profile, gig] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId: req.user!.id } }),
    prisma.gig.findUnique({ where: { id: gigId } }),
  ]);

  if (!profile) throw new AppError('Student profile not found', 404);
  if (!gig) throw new AppError('Gig not found', 404);

  const studentSkills: string[] = JSON.parse(profile.skills || '[]').map((s: string) =>
    s.toLowerCase()
  );
  const gigSkills: string[] = JSON.parse(gig.requiredSkills || '[]').map((s: string) =>
    s.toLowerCase()
  );

  const matchingSkills = gigSkills.filter((s) => studentSkills.includes(s));
  const missingSkills = gigSkills.filter((s) => !studentSkills.includes(s));

  let skillScore = gigSkills.length === 0 ? 60 : Math.round((matchingSkills.length / gigSkills.length) * 60);

  let availabilityScore = 0;
  let availabilityMatch = false;
  if (!gig.requiredAvailability) {
    availabilityScore = 25;
    availabilityMatch = true;
  } else if (profile.availability) {
    availabilityScore = 25;
    availabilityMatch = true;
  } else {
    availabilityScore = 10;
  }

  let workTypeScore = 0;
  let workTypeMatch = false;
  if (!profile.preferredWorkType || profile.preferredWorkType === gig.workType) {
    workTypeScore = 15;
    workTypeMatch = true;
  } else if (gig.workType === 'hybrid') {
    workTypeScore = 10;
  } else {
    workTypeScore = 5;
  }

  const score = Math.min(100, skillScore + availabilityScore + workTypeScore);

  res.json({
    score,
    matchingSkills,
    missingSkills,
    availabilityMatch,
    workTypeMatch,
    breakdown: {
      skillScore,
      availabilityScore,
      workTypeScore,
    },
  });
};
