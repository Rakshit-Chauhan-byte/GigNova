export type UserRole = 'STUDENT' | 'BUSINESS' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  studentProfile?: StudentProfile | null;
  businessProfile?: BusinessProfile | null;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  profilePicture?: string | null;
  phone?: string | null;
  college?: string | null;
  degree?: string | null;
  yearOfStudy?: string | null;
  skills: string[];
  experience?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  availability?: {
    days?: string[];
    hours?: string;
  } | null;
  preferredWorkType?: 'remote' | 'onsite' | 'hybrid' | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    createdAt: string;
  };
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  description?: string | null;
  industry?: string | null;
  businessEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationDocs?: string | null;
  verificationNote?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    createdAt: string;
  };
}

export interface Gig {
  id: string;
  businessId: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  compensation: string;
  compensationType: 'fixed' | 'hourly' | 'monthly';
  workType: 'remote' | 'onsite' | 'hybrid';
  location?: string | null;
  duration?: string | null;
  openings: number;
  deadline?: string | null;
  requiredAvailability?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'DELETED';
  isReported: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  business?: {
    businessName: string;
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    logoUrl?: string | null;
    location?: string | null;
    userId: string;
    description?: string | null;
    industry?: string | null;
    website?: string | null;
  };
  _count?: {
    applications: number;
  };
}

export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'COMPLETED';

export interface Application {
  id: string;
  gigId: string;
  studentId: string;
  coverLetter?: string | null;
  status: ApplicationStatus;
  matchScore: number;
  providerNote?: string | null;
  createdAt: string;
  updatedAt: string;
  gig?: Gig;
  student?: {
    id: string;
    email: string;
    studentProfile?: StudentProfile;
  };
}

export interface VerificationRequest {
  id: string;
  businessId: string;
  business: BusinessProfile & { user?: { email: string } };
  documents?: string | null;
  taxId?: string | null;
  registrationNo?: string | null;
  additionalInfo?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter?: { email: string };
  reportedUserId?: string | null;
  reportedUser?: { email: string } | null;
  reportedGigId?: string | null;
  reportedGig?: { title: string } | null;
  reason: string;
  description?: string | null;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedGig {
  gig: Gig;
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  availabilityMatch: boolean;
  workTypeMatch: boolean;
  explanation: string;
}

// --- SmartMatch Types ---
export interface SmartMatchExplanation {
  summary: string;
  skillAnalysis: string;
  experienceAnalysis: string;
  availabilityAnalysis: string;
  workModeAnalysis: string;
  assessmentAnalysis: string;
}

export interface SmartMatchScore {
  id: string;
  applicationId: string;
  gigId: string;
  studentId: string;
  skillScore: number;
  experienceScore: number;
  availabilityScore: number;
  workModeScore: number;
  assessmentScore: number;
  totalScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  partiallyMatchedSkills: string[];
  explanation: SmartMatchExplanation;
  isEligible: boolean;
  eligibilityReasons: string[];
  isShortlisted: boolean;
  calculatedAt: string;
}

export interface SmartMatchStats {
  total: number;
  eligible: number;
  ineligible: number;
  shortlisted: number;
  highestScore: number;
  averageScore: number;
}

export interface SmartMatchApplicant {
  rank: number;
  application: Application;
  smartMatchScore: SmartMatchScore;
}

export type SmartMatchScoreBand = 'excellent' | 'strong' | 'moderate' | 'low';

