/**
 * Eligibility Service for GigNova SmartMatch
 * Evaluates mandatory eligibility rules and produces explicit reasons if ineligible.
 */

import { SkillMatchResult } from './skillNormalization.service';

export interface EligibilityInput {
  gig: {
    status: string;
    deadline?: Date | string | null;
    workType: string;
    location?: string | null;
    duration?: string | null;
    requiredAvailability?: string | null;
    requiredSkills: string[];
  };
  studentProfile: {
    skills: string[];
    availability?: { days?: string[]; hours?: string } | string | null;
    preferredWorkType?: string | null;
  } | null;
  skillMatch: SkillMatchResult;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export function evaluateEligibility(input: EligibilityInput): EligibilityResult {
  const { gig, studentProfile, skillMatch } = input;
  const reasons: string[] = [];

  // 1. Gig Status Check
  if (gig.status !== 'ACTIVE') {
    reasons.push(`Gig is currently marked as ${gig.status} and not accepting active applications`);
  }

  // 2. Application Deadline Check
  if (gig.deadline) {
    const deadlineDate = new Date(gig.deadline);
    if (!isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < Date.now()) {
      reasons.push('Application deadline has already passed');
    }
  }

  // 3. Essential Skills Check
  // If gig requires skills, student must have at least 1 direct matched skill or at least 1 partial match
  if (gig.requiredSkills.length > 0) {
    const totalMatched = skillMatch.matchedSkills.length + skillMatch.partiallyMatchedSkills.length;
    if (totalMatched === 0) {
      reasons.push(
        `Missing essential mandatory skills: lacks matching foundation in required skills (${gig.requiredSkills.slice(0, 3).join(', ')})`
      );
    }
  }

  // 4. Availability Check
  if (gig.requiredAvailability) {
    if (!studentProfile?.availability) {
      // Missing required availability
      reasons.push(`Applicant has not specified working availability required for this gig (${gig.requiredAvailability})`);
    } else {
      const availStr =
        typeof studentProfile.availability === 'string'
          ? studentProfile.availability
          : JSON.stringify(studentProfile.availability);
      const lowerAvail = availStr.toLowerCase();
      const lowerReq = gig.requiredAvailability.toLowerCase();
      if (
        (lowerReq.includes('15') || lowerReq.includes('20')) &&
        (lowerAvail.includes('5 hrs') || lowerAvail.includes('5 hours') || lowerAvail.includes('8 hrs') || lowerAvail.includes('8 hours'))
      ) {
        reasons.push(
          `Availability conflict: Gig requires ${gig.requiredAvailability}, but applicant availability is insufficient (${availStr})`
        );
      }
    }
  }

  // 5. Work Mode & Location Compatibility Check
  if (gig.workType === 'onsite') {
    if (studentProfile?.preferredWorkType === 'remote') {
      reasons.push(
        `Work mode conflict: This gig requires on-site presence${
          gig.location ? ` in ${gig.location}` : ''
        }, but applicant prefers remote work only`
      );
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
}
