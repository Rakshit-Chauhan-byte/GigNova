/**
 * Match Explanation Service for GigNova SmartMatch
 * Produces transparent, human-readable explanations of each applicant's score components.
 */

export interface ExplanationInput {
  totalScore: number;
  skillScore: number;
  experienceScore: number;
  availabilityScore: number;
  workModeScore: number;
  assessmentScore: number;
  matchedSkills: string[];
  partiallyMatchedSkills: string[];
  missingSkills: string[];
  isEligible: boolean;
  eligibilityReasons: string[];
  workType: string;
  studentPreferredWorkType?: string | null;
  hasCoverLetter: boolean;
}

export interface MatchExplanation {
  summary: string;
  skillAnalysis: string;
  experienceAnalysis: string;
  availabilityAnalysis: string;
  workModeAnalysis: string;
  assessmentAnalysis: string;
}

export function generateExplanation(input: ExplanationInput): MatchExplanation {
  const {
    totalScore,
    skillScore,
    experienceScore,
    availabilityScore,
    workModeScore,
    assessmentScore,
    matchedSkills,
    partiallyMatchedSkills,
    missingSkills,
    isEligible,
    eligibilityReasons,
    workType,
    studentPreferredWorkType,
    hasCoverLetter,
  } = input;

  // Summary
  let tier = 'Moderate';
  if (totalScore >= 90) tier = 'Excellent';
  else if (totalScore >= 80) tier = 'Strong';
  else if (totalScore < 65) tier = 'Low';

  let summary = `Candidate demonstrates a ${tier.toLowerCase()} overall compatibility (${totalScore}/100).`;
  if (!isEligible) {
    summary += ` Note: Candidate is flagged as ineligible due to: ${eligibilityReasons[0] || 'mandatory requirement mismatch'}.`;
  } else if (totalScore >= 85) {
    summary += ` High alignment across technical skills, relevant background, and working expectations.`;
  } else {
    summary += ` Solid potential with select areas for consideration or skill development.`;
  }

  // Skill analysis
  let skillAnalysis = '';
  if (matchedSkills.length > 0) {
    skillAnalysis += `Directly possesses key required skills: ${matchedSkills.join(', ')}. `;
  }
  if (partiallyMatchedSkills.length > 0) {
    skillAnalysis += `Holds transferable related skills for: ${partiallyMatchedSkills.join(', ')}. `;
  }
  if (missingSkills.length > 0) {
    skillAnalysis += `Missing target competencies: ${missingSkills.join(', ')}.`;
  }
  if (!skillAnalysis) {
    skillAnalysis = 'General skill expectations satisfied without specific blockers.';
  }

  // Experience analysis
  let experienceAnalysis = '';
  if (experienceScore >= 80) {
    experienceAnalysis =
      'Extensive project portfolio, relevant coursework, and demonstrated background directly aligned with gig requirements.';
  } else if (experienceScore >= 60) {
    experienceAnalysis =
      'Demonstrated academic and hands-on project exposure touching upon related domain technologies.';
  } else {
    experienceAnalysis =
      'Introductory experience level; applicant exhibits foundational readiness but limited direct project history.';
  }

  // Availability analysis
  let availabilityAnalysis = '';
  if (availabilityScore >= 85) {
    availabilityAnalysis =
      'Applicant schedule fully accommodates required weekly hours and target project timeframe.';
  } else if (availabilityScore >= 65) {
    availabilityAnalysis =
      'Schedule largely aligns with required commitment, suitable for flexible or part-time arrangements.';
  } else {
    availabilityAnalysis =
      'Availability hours may require adjustment or clarification to meet gig duration milestones.';
  }

  // Work mode analysis
  let workModeAnalysis = '';
  if (workModeScore >= 90) {
    workModeAnalysis = `Perfect work mode alignment (${workType} arrangement matching candidate preference).`;
  } else if (workModeScore >= 65) {
    workModeAnalysis = `Compatible work arrangement (${workType} mode acceptable with minor location considerations).`;
  } else {
    workModeAnalysis = `Work mode discrepancy: Candidate preference (${studentPreferredWorkType || 'unspecified'}) differs from gig arrangement (${workType}).`;
  }

  // Assessment analysis
  let assessmentAnalysis = '';
  if (hasCoverLetter && assessmentScore >= 80) {
    assessmentAnalysis =
      'Comprehensive, customized cover letter provided alongside a thoroughly documented professional profile.';
  } else if (hasCoverLetter) {
    assessmentAnalysis =
      'Applicant submitted an introductory cover letter outlining interest and motivation for the gig.';
  } else {
    assessmentAnalysis =
      'Application submitted without supplementary cover letter; evaluation based on profile records.';
  }

  return {
    summary,
    skillAnalysis: skillAnalysis.trim(),
    experienceAnalysis,
    availabilityAnalysis,
    workModeAnalysis,
    assessmentAnalysis,
  };
}
