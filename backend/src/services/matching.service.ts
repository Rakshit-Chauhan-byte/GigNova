/**
 * Matching Service for GigNova SmartMatch
 * Computes deterministic 5-factor scoring engine:
 * 1. Skill compatibility (40%)
 * 2. Project and experience relevance (20%)
 * 3. Availability compatibility (20%)
 * 4. Work mode and location compatibility (10%)
 * 5. Application-specific assessment (10%)
 */

import { matchSkills, SkillMatchResult } from './skillNormalization.service';
import { evaluateEligibility, EligibilityResult } from './eligibility.service';
import { generateExplanation, MatchExplanation } from './matchExplanation.service';

export interface MatchingInput {
  gig: {
    id: string;
    title: string;
    description: string;
    category: string;
    requiredSkills: string[];
    workType: string;
    location?: string | null;
    duration?: string | null;
    requiredAvailability?: string | null;
    deadline?: Date | string | null;
    status: string;
  };
  studentProfile: {
    fullName: string;
    skills: string[];
    experience?: string | null;
    portfolioUrl?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    availability?: { days?: string[]; hours?: string } | string | null;
    preferredWorkType?: string | null;
    bio?: string | null;
    college?: string | null;
    degree?: string | null;
    yearOfStudy?: string | null;
  } | null;
  application: {
    id: string;
    coverLetter?: string | null;
    createdAt: Date | string;
  };
}

export interface CalculatedMatchResult {
  skillScore: number;
  experienceScore: number;
  availabilityScore: number;
  workModeScore: number;
  assessmentScore: number;
  totalScore: number;
  matchedSkills: string[];
  partiallyMatchedSkills: string[];
  missingSkills: string[];
  isEligible: boolean;
  eligibilityReasons: string[];
  explanation: MatchExplanation;
}

/**
 * Calculates experience score (0-100) based on project portfolio, background text, and keyword relevance
 */
function calculateExperienceScore(
  studentProfile: MatchingInput['studentProfile'],
  gig: MatchingInput['gig']
): number {
  if (!studentProfile) return 30;

  let score = 40; // Base baseline for student status

  const expText = [
    studentProfile.experience || '',
    studentProfile.bio || '',
    studentProfile.degree || '',
  ]
    .join(' ')
    .toLowerCase();

  // 1. Keyword relevance check from gig title and category
  const targetKeywords = [
    ...gig.title.toLowerCase().split(/\s+/),
    ...gig.category.toLowerCase().split(/\s+/),
    ...gig.requiredSkills.map((s) => s.toLowerCase()),
  ].filter((w) => w.length > 2);

  let keywordHits = 0;
  for (const kw of targetKeywords) {
    if (expText.includes(kw)) {
      keywordHits++;
    }
  }

  // Add points for keyword hits (up to 30 points)
  if (targetKeywords.length > 0) {
    const hitRatio = Math.min(1.0, keywordHits / Math.min(5, targetKeywords.length));
    score += Math.round(hitRatio * 30);
  }

  // 2. Experience length & depth bonus (up to 15 points)
  const experienceLength = (studentProfile.experience || '').trim().length;
  if (experienceLength > 200) {
    score += 15;
  } else if (experienceLength > 60) {
    score += 10;
  } else if (experienceLength > 0) {
    score += 5;
  }

  // 3. Portfolio & Code Repository proof points (up to 15 points)
  if (studentProfile.githubUrl) score += 5;
  if (studentProfile.portfolioUrl) score += 6;
  if (studentProfile.linkedinUrl) score += 4;

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates availability score (0-100)
 */
function calculateAvailabilityScore(
  studentProfile: MatchingInput['studentProfile'],
  gig: MatchingInput['gig']
): number {
  if (!gig.requiredAvailability) {
    // If gig doesn't mandate specific hours, standard student availability is high
    return studentProfile?.availability ? 95 : 85;
  }

  if (!studentProfile?.availability) {
    return 35; // Required availability missing
  }

  // Student has availability specified
  let score = 85;

  const availStr =
    typeof studentProfile.availability === 'string'
      ? studentProfile.availability
      : JSON.stringify(studentProfile.availability);

  const lowerAvail = availStr.toLowerCase();
  const lowerReq = gig.requiredAvailability.toLowerCase();

  // Check matching terms (hours, days, part-time, full-time, weekends)
  if (
    lowerAvail.includes('5 hrs') ||
    lowerAvail.includes('5 hours') ||
    lowerAvail.includes('8 hrs') ||
    lowerAvail.includes('8 hours')
  ) {
    score = 45; // Insufficient hours for standard gig
  } else if (
    (lowerReq.includes('part-time') && lowerAvail.includes('part-time')) ||
    (lowerReq.includes('full-time') && lowerAvail.includes('full-time')) ||
    (lowerReq.includes('weekdays') && (lowerAvail.includes('weekday') || lowerAvail.includes('mon'))) ||
    (lowerReq.includes('flexible') && lowerAvail.includes('flexible')) ||
    lowerAvail.includes('20 hrs') ||
    lowerAvail.includes('25 hrs') ||
    lowerAvail.includes('30 hrs')
  ) {
    score = 95;
  } else {
    score = 90;
  }

  return Math.min(100, score);
}

/**
 * Calculates work mode and location score (0-100)
 */
function calculateWorkModeScore(
  studentProfile: MatchingInput['studentProfile'],
  gig: MatchingInput['gig']
): number {
  const gigMode = (gig.workType || 'remote').toLowerCase();
  const studentPref = (studentProfile?.preferredWorkType || '').toLowerCase();

  // Remote gig is accessible to everyone
  if (gigMode === 'remote') {
    return 100;
  }

  // Direct match
  if (studentPref === gigMode) {
    return 100;
  }

  // No specific student preference
  if (!studentPref) {
    return 80;
  }

  // Hybrid variations
  if (gigMode === 'hybrid') {
    if (studentPref === 'remote') return 70;
    if (studentPref === 'onsite') return 85;
  }

  // Onsite gig with differing preference
  if (gigMode === 'onsite') {
    if (studentPref === 'hybrid') return 75;
    if (studentPref === 'remote') return 25; // Incompatible
  }

  return 60;
}

/**
 * Calculates application-specific assessment score (0-100)
 */
function calculateAssessmentScore(
  application: MatchingInput['application'],
  studentProfile: MatchingInput['studentProfile']
): number {
  let score = 50;

  // Cover letter evaluation
  const coverLetter = (application.coverLetter || '').trim();
  if (coverLetter.length > 250) {
    score += 35; // High effort, customized note
  } else if (coverLetter.length > 100) {
    score += 25;
  } else if (coverLetter.length > 20) {
    score += 15;
  } else {
    score += 0; // Blank cover letter
  }

  // Profile completeness check
  if (studentProfile) {
    if (studentProfile.college) score += 5;
    if (studentProfile.bio && studentProfile.bio.length > 30) score += 5;
    if (studentProfile.githubUrl || studentProfile.portfolioUrl) score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Main scoring engine function
 */
export function calculateSmartMatchScore(input: MatchingInput): CalculatedMatchResult {
  const { gig, studentProfile, application } = input;

  const studentSkills = studentProfile?.skills || [];
  const gigSkills = gig.requiredSkills || [];

  // 1. Skill Match
  const skillResult: SkillMatchResult = matchSkills(studentSkills, gigSkills);

  // 2. Factor Scores (0-100)
  const skillScore = skillResult.skillScore;
  const experienceScore = calculateExperienceScore(studentProfile, gig);
  const availabilityScore = calculateAvailabilityScore(studentProfile, gig);
  const workModeScore = calculateWorkModeScore(studentProfile, gig);
  const assessmentScore = calculateAssessmentScore(application, studentProfile);

  // 3. Formula:
  // Final Score = (Skill * 0.40) + (Experience * 0.20) + (Availability * 0.20) + (Work Mode * 0.10) + (Assessment * 0.10)
  const rawTotal =
    skillScore * 0.4 +
    experienceScore * 0.2 +
    availabilityScore * 0.2 +
    workModeScore * 0.1 +
    assessmentScore * 0.1;

  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  // 4. Eligibility Evaluation
  const eligibilityResult: EligibilityResult = evaluateEligibility({
    gig,
    studentProfile,
    skillMatch: skillResult,
  });

  // 5. Natural Language Explanation
  const explanation: MatchExplanation = generateExplanation({
    totalScore,
    skillScore,
    experienceScore,
    availabilityScore,
    workModeScore,
    assessmentScore,
    matchedSkills: skillResult.matchedSkills,
    partiallyMatchedSkills: skillResult.partiallyMatchedSkills,
    missingSkills: skillResult.missingSkills,
    isEligible: eligibilityResult.isEligible,
    eligibilityReasons: eligibilityResult.reasons,
    workType: gig.workType,
    studentPreferredWorkType: studentProfile?.preferredWorkType,
    hasCoverLetter: Boolean(application.coverLetter && application.coverLetter.trim().length > 0),
  });

  return {
    skillScore,
    experienceScore,
    availabilityScore,
    workModeScore,
    assessmentScore,
    totalScore,
    matchedSkills: skillResult.matchedSkills,
    partiallyMatchedSkills: skillResult.partiallyMatchedSkills,
    missingSkills: skillResult.missingSkills,
    isEligible: eligibilityResult.isEligible,
    eligibilityReasons: eligibilityResult.reasons,
    explanation,
  };
}
