import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { calculateSmartMatchScore } from '../services/matching.service';
import { rankApplicants, getTopNEligible } from '../services/ranking.service';

/**
 * Helper to safely parse JSON strings
 */
function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

/**
 * Helper to verify that the authenticated business owns the gig
 */
async function verifyGigOwnership(gigId: string, userId: string, userRole?: string) {
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: { business: true },
  });

  if (!gig) {
    throw new AppError('Gig listing not found', 404);
  }

  if (userRole !== 'ADMIN' && gig.business.userId !== userId) {
    throw new AppError('Unauthorized: You do not own this gig listing', 403);
  }

  return gig;
}

/**
 * Calculates or updates SmartMatch score for an application
 */
async function computeAndSaveScoreForApplication(
  applicationId: string,
  gig: any
): Promise<any> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      student: {
        include: {
          studentProfile: true,
        },
      },
      smartMatchScore: true,
    },
  });

  if (!application) return null;

  const studentProfile = application.student.studentProfile;
  const gigSkills = safeJsonParse<string[]>(gig.requiredSkills, []);
  const studentSkills = studentProfile ? safeJsonParse<string[]>(studentProfile.skills, []) : [];

  const calculated = calculateSmartMatchScore({
    gig: {
      id: gig.id,
      title: gig.title,
      description: gig.description,
      category: gig.category,
      requiredSkills: gigSkills,
      workType: gig.workType,
      location: gig.location,
      duration: gig.duration,
      requiredAvailability: gig.requiredAvailability,
      deadline: gig.deadline,
      status: gig.status,
    },
    studentProfile: studentProfile
      ? {
          fullName: studentProfile.fullName,
          skills: studentSkills,
          experience: studentProfile.experience,
          portfolioUrl: studentProfile.portfolioUrl,
          linkedinUrl: studentProfile.linkedinUrl,
          githubUrl: studentProfile.githubUrl,
          availability: safeJsonParse(studentProfile.availability, studentProfile.availability),
          preferredWorkType: studentProfile.preferredWorkType,
          bio: studentProfile.bio,
          college: studentProfile.college,
          degree: studentProfile.degree,
          yearOfStudy: studentProfile.yearOfStudy,
        }
      : null,
    application: {
      id: application.id,
      coverLetter: application.coverLetter,
      createdAt: application.createdAt,
    },
  });

  // Preserve existing shortlist status if present
  const isShortlisted = application.smartMatchScore?.isShortlisted || false;

  const scoreRecord = await prisma.smartMatchScore.upsert({
    where: { applicationId: application.id },
    create: {
      applicationId: application.id,
      gigId: gig.id,
      studentId: application.studentId,
      skillScore: calculated.skillScore,
      experienceScore: calculated.experienceScore,
      availabilityScore: calculated.availabilityScore,
      workModeScore: calculated.workModeScore,
      assessmentScore: calculated.assessmentScore,
      totalScore: calculated.totalScore,
      matchedSkills: JSON.stringify(calculated.matchedSkills),
      missingSkills: JSON.stringify(calculated.missingSkills),
      partiallyMatchedSkills: JSON.stringify(calculated.partiallyMatchedSkills),
      explanation: JSON.stringify(calculated.explanation),
      isEligible: calculated.isEligible,
      eligibilityReasons: JSON.stringify(calculated.eligibilityReasons),
      isShortlisted,
    },
    update: {
      skillScore: calculated.skillScore,
      experienceScore: calculated.experienceScore,
      availabilityScore: calculated.availabilityScore,
      workModeScore: calculated.workModeScore,
      assessmentScore: calculated.assessmentScore,
      totalScore: calculated.totalScore,
      matchedSkills: JSON.stringify(calculated.matchedSkills),
      missingSkills: JSON.stringify(calculated.missingSkills),
      partiallyMatchedSkills: JSON.stringify(calculated.partiallyMatchedSkills),
      explanation: JSON.stringify(calculated.explanation),
      isEligible: calculated.isEligible,
      eligibilityReasons: JSON.stringify(calculated.eligibilityReasons),
    },
  });

  // Sync application matchScore with totalScore
  await prisma.application.update({
    where: { id: application.id },
    data: { matchScore: calculated.totalScore },
  });

  return scoreRecord;
}

/**
 * GET /api/smartmatch/gig/:gigId
 * Returns ranked applicants with overview stats, filtering, sorting, and pagination
 */
export const getGigSmartMatchResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { gigId } = req.params;
  const {
    page = '1',
    limit = '20',
    sortBy = 'score',
    filter = 'all',
    minScore,
    maxScore,
    status,
    skills,
    recalculate,
  } = req.query;

  const gig = await verifyGigOwnership(gigId, req.user!.id, req.user!.role);

  // Fetch all applications for this gig
  let applications = await prisma.application.findMany({
    where: { gigId },
    include: {
      student: {
        include: {
          studentProfile: true,
        },
      },
      smartMatchScore: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate scores for any application that doesn't have one, or if recalculate=true
  const shouldRecalculateAll = recalculate === 'true';

  for (const app of applications) {
    if (!app.smartMatchScore || shouldRecalculateAll) {
      const score = await computeAndSaveScoreForApplication(app.id, gig);
      app.smartMatchScore = score;
    }
  }

  // Refetch to have clean in-memory representations
  applications = await prisma.application.findMany({
    where: { gigId },
    include: {
      student: {
        include: {
          studentProfile: true,
        },
      },
      smartMatchScore: true,
    },
  });

  // Rank all applicants
  const itemsToRank = applications.map((app) => ({
    app,
    totalScore: app.smartMatchScore?.totalScore || 0,
    isEligible: app.smartMatchScore?.isEligible ?? true,
    createdAt: app.createdAt,
  }));

  const rankedItems = rankApplicants(itemsToRank);

  // Compute aggregate statistics across ALL applications for this gig
  const total = applications.length;
  let eligibleCount = 0;
  let ineligibleCount = 0;
  let shortlistedCount = 0;
  let highestScore = 0;
  let totalScoreSum = 0;

  for (const app of applications) {
    const score = app.smartMatchScore?.totalScore || 0;
    const isEligible = app.smartMatchScore?.isEligible ?? true;
    const isShortlisted = app.smartMatchScore?.isShortlisted || false;

    if (isEligible) eligibleCount++;
    else ineligibleCount++;

    if (isShortlisted) shortlistedCount++;
    if (score > highestScore) highestScore = score;
    totalScoreSum += score;
  }

  const averageScore = total > 0 ? Math.round(totalScoreSum / total) : 0;

  // Format ranked applicant items
  let formattedApplicants = rankedItems.map((r) => {
    const app = r.data.app;
    const score = app.smartMatchScore!;
    const profile = app.student?.studentProfile;

    return {
      rank: r.rank,
      application: {
        id: app.id,
        gigId: app.gigId,
        studentId: app.studentId,
        coverLetter: app.coverLetter,
        status: app.status,
        matchScore: app.matchScore,
        providerNote: app.providerNote,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        student: {
          id: app.student.id,
          email: app.student.email,
          studentProfile: profile
            ? {
                ...profile,
                skills: safeJsonParse<string[]>(profile.skills, []),
                availability: safeJsonParse(profile.availability, profile.availability),
                createdAt: profile.createdAt.toISOString(),
                updatedAt: profile.updatedAt.toISOString(),
              }
            : null,
        },
      },
      smartMatchScore: {
        id: score.id,
        applicationId: score.applicationId,
        gigId: score.gigId,
        studentId: score.studentId,
        skillScore: score.skillScore,
        experienceScore: score.experienceScore,
        availabilityScore: score.availabilityScore,
        workModeScore: score.workModeScore,
        assessmentScore: score.assessmentScore,
        totalScore: score.totalScore,
        matchedSkills: safeJsonParse<string[]>(score.matchedSkills, []),
        missingSkills: safeJsonParse<string[]>(score.missingSkills, []),
        partiallyMatchedSkills: safeJsonParse<string[]>(score.partiallyMatchedSkills, []),
        explanation: safeJsonParse(score.explanation, {
          summary: '',
          skillAnalysis: '',
          experienceAnalysis: '',
          availabilityAnalysis: '',
          workModeAnalysis: '',
          assessmentAnalysis: '',
        }),
        isEligible: score.isEligible,
        eligibilityReasons: safeJsonParse<string[]>(score.eligibilityReasons, []),
        isShortlisted: score.isShortlisted,
        calculatedAt: score.calculatedAt.toISOString(),
      },
    };
  });

  // Apply filters
  if (filter === 'eligible') {
    formattedApplicants = formattedApplicants.filter((a) => a.smartMatchScore.isEligible);
  } else if (filter === 'ineligible') {
    formattedApplicants = formattedApplicants.filter((a) => !a.smartMatchScore.isEligible);
  } else if (filter === 'shortlisted') {
    formattedApplicants = formattedApplicants.filter((a) => a.smartMatchScore.isShortlisted);
  }

  if (minScore !== undefined && minScore !== '') {
    const min = Number(minScore);
    formattedApplicants = formattedApplicants.filter((a) => a.smartMatchScore.totalScore >= min);
  }

  if (maxScore !== undefined && maxScore !== '') {
    const max = Number(maxScore);
    formattedApplicants = formattedApplicants.filter((a) => a.smartMatchScore.totalScore <= max);
  }

  if (status && status !== 'ALL') {
    formattedApplicants = formattedApplicants.filter((a) => a.application.status === status);
  }

  if (skills && typeof skills === 'string') {
    const searchSkill = skills.toLowerCase().trim();
    formattedApplicants = formattedApplicants.filter(
      (a) =>
        a.smartMatchScore.matchedSkills.some((s) => s.toLowerCase().includes(searchSkill)) ||
        a.smartMatchScore.partiallyMatchedSkills.some((s) => s.toLowerCase().includes(searchSkill))
    );
  }

  // Apply sorting
  if (sortBy === 'score') {
    formattedApplicants.sort((a, b) => {
      // Eligible applicants always rank ahead of ineligible
      if (a.smartMatchScore.isEligible !== b.smartMatchScore.isEligible) {
        return a.smartMatchScore.isEligible ? -1 : 1;
      }
      return b.smartMatchScore.totalScore - a.smartMatchScore.totalScore;
    });
  } else if (sortBy === 'date') {
    formattedApplicants.sort(
      (a, b) =>
        new Date(b.application.createdAt).getTime() - new Date(a.application.createdAt).getTime()
    );
  } else if (sortBy === 'experience') {
    formattedApplicants.sort((a, b) => {
      if (a.smartMatchScore.isEligible !== b.smartMatchScore.isEligible) {
        return a.smartMatchScore.isEligible ? -1 : 1;
      }
      return b.smartMatchScore.experienceScore - a.smartMatchScore.experienceScore;
    });
  }

  // Update sequential ranks based on final filtered/sorted order
  formattedApplicants.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  // Pagination
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
  const filteredTotal = formattedApplicants.length;
  const pages = Math.ceil(filteredTotal / limitNum) || 1;
  const paginatedApplicants = formattedApplicants.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    stats: {
      total,
      eligible: eligibleCount,
      ineligible: ineligibleCount,
      shortlisted: shortlistedCount,
      highestScore,
      averageScore,
    },
    applicants: paginatedApplicants,
    pagination: {
      page: pageNum,
      pages,
      total: filteredTotal,
    },
  });
};

/**
 * GET /api/smartmatch/gig/:gigId/applicant/:applicationId
 * Returns detailed SmartMatch report for single applicant
 */
export const getApplicantSmartMatchReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { gigId, applicationId } = req.params;

  const gig = await verifyGigOwnership(gigId, req.user!.id, req.user!.role);

  let application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      student: {
        include: {
          studentProfile: true,
        },
      },
      smartMatchScore: true,
    },
  });

  if (!application || application.gigId !== gigId) {
    throw new AppError('Application not found for this gig', 404);
  }

  if (!application.smartMatchScore) {
    await computeAndSaveScoreForApplication(application.id, gig);
    application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          include: {
            studentProfile: true,
          },
        },
        smartMatchScore: true,
      },
    });
  }

  // Calculate rank among all applicants for this gig
  const allApps = await prisma.application.findMany({
    where: { gigId },
    include: { smartMatchScore: true },
  });

  const rankedItems = rankApplicants(
    allApps.map((a) => ({
      id: a.id,
      totalScore: a.smartMatchScore?.totalScore || 0,
      isEligible: a.smartMatchScore?.isEligible ?? true,
      createdAt: a.createdAt,
    }))
  );

  const matchedRank = rankedItems.find((r) => r.data.id === applicationId)?.rank || 1;
  const score = application!.smartMatchScore!;
  const profile = application!.student?.studentProfile;

  res.json({
    report: {
      rank: matchedRank,
      application: {
        ...application,
        createdAt: application!.createdAt.toISOString(),
        updatedAt: application!.updatedAt.toISOString(),
        student: {
          id: application!.student.id,
          email: application!.student.email,
          studentProfile: profile
            ? {
                ...profile,
                skills: safeJsonParse<string[]>(profile.skills, []),
                availability: safeJsonParse(profile.availability, profile.availability),
                createdAt: profile.createdAt.toISOString(),
                updatedAt: profile.updatedAt.toISOString(),
              }
            : null,
        },
      },
      smartMatchScore: {
        id: score.id,
        applicationId: score.applicationId,
        gigId: score.gigId,
        studentId: score.studentId,
        skillScore: score.skillScore,
        experienceScore: score.experienceScore,
        availabilityScore: score.availabilityScore,
        workModeScore: score.workModeScore,
        assessmentScore: score.assessmentScore,
        totalScore: score.totalScore,
        matchedSkills: safeJsonParse<string[]>(score.matchedSkills, []),
        missingSkills: safeJsonParse<string[]>(score.missingSkills, []),
        partiallyMatchedSkills: safeJsonParse<string[]>(score.partiallyMatchedSkills, []),
        explanation: safeJsonParse(score.explanation, {
          summary: '',
          skillAnalysis: '',
          experienceAnalysis: '',
          availabilityAnalysis: '',
          workModeAnalysis: '',
          assessmentAnalysis: '',
        }),
        isEligible: score.isEligible,
        eligibilityReasons: safeJsonParse<string[]>(score.eligibilityReasons, []),
        isShortlisted: score.isShortlisted,
        calculatedAt: score.calculatedAt.toISOString(),
      },
    },
  });
};

/**
 * POST /api/smartmatch/gig/:gigId/recalculate
 * Forces recalculation of all applicant scores for a gig
 */
export const recalculateGigScores = async (req: AuthRequest, res: Response): Promise<void> => {
  const { gigId } = req.params;
  const gig = await verifyGigOwnership(gigId, req.user!.id, req.user!.role);

  const applications = await prisma.application.findMany({
    where: { gigId },
    select: { id: true },
  });

  for (const app of applications) {
    await computeAndSaveScoreForApplication(app.id, gig);
  }

  res.json({
    message: `Recalculated scores for ${applications.length} applicant(s)`,
    count: applications.length,
  });
};

/**
 * PATCH /api/smartmatch/application/:applicationId/shortlist
 * Toggles shortlist status for an applicant
 */
export const toggleApplicantShortlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { applicationId } = req.params;
  const { shortlisted } = req.body;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      gig: {
        include: { business: true },
      },
      smartMatchScore: true,
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (req.user!.role !== 'ADMIN' && application.gig.business.userId !== req.user!.id) {
    throw new AppError('Unauthorized', 403);
  }

  let isShortlisted = typeof shortlisted === 'boolean' ? shortlisted : !application.smartMatchScore?.isShortlisted;

  const updatedScore = await prisma.smartMatchScore.upsert({
    where: { applicationId },
    create: {
      applicationId,
      gigId: application.gigId,
      studentId: application.studentId,
      totalScore: application.matchScore,
      isShortlisted,
    },
    update: {
      isShortlisted,
    },
  });

  res.json({
    message: isShortlisted ? 'Candidate shortlisted' : 'Candidate removed from shortlist',
    isShortlisted: updatedScore.isShortlisted,
  });
};

/**
 * POST /api/smartmatch/gig/:gigId/bulk-shortlist
 * Shortlists top N eligible applicants
 */
export const bulkShortlistTopCandidates = async (req: AuthRequest, res: Response): Promise<void> => {
  const { gigId } = req.params;
  const { count = 3 } = req.body;
  const shortlistCount = Math.max(1, parseInt(count, 10));

  await verifyGigOwnership(gigId, req.user!.id, req.user!.role);

  const applications = await prisma.application.findMany({
    where: { gigId },
    include: { smartMatchScore: true },
  });

  const eligibleItems = applications.map((a) => ({
    id: a.id,
    totalScore: a.smartMatchScore?.totalScore || 0,
    isEligible: a.smartMatchScore?.isEligible ?? true,
  }));

  const topAppIds = getTopNEligible(eligibleItems, shortlistCount);

  if (topAppIds.length > 0) {
    await prisma.smartMatchScore.updateMany({
      where: {
        applicationId: { in: topAppIds },
      },
      data: { isShortlisted: true },
    });
  }

  res.json({
    message: `Successfully shortlisted top ${topAppIds.length} candidate(s)`,
    shortlisted: topAppIds.length,
    applicationIds: topAppIds,
  });
};
