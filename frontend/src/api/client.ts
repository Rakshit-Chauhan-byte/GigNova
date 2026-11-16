import axios from 'axios';
import {
  User,
  StudentProfile,
  BusinessProfile,
  Gig,
  Application,
  VerificationRequest,
  Report,
  RecommendedGig,
  SmartMatchApplicant,
  SmartMatchStats,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gignova_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('gignova_token');
      localStorage.removeItem('gignova_user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const authApi = {
  register: (data: { email: string; password: string; role: 'STUDENT' | 'BUSINESS'; fullName?: string; businessName?: string }) =>
    api.post<{ message: string; token: string; user: User }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ message: string; token: string; user: User & { profile?: any } }>('/auth/login', data),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/auth/change-password', data),
};

// --- Student APIs ---
export const studentApi = {
  getProfile: () => api.get<{ profile: StudentProfile }>('/student/profile'),
  updateProfile: (data: Partial<StudentProfile>) =>
    api.put<{ message: string; profile: StudentProfile }>('/student/profile', data),
  uploadProfilePicture: (formData: FormData) =>
    api.post<{ message: string; url: string }>('/student/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDashboard: () =>
    api.get<{
      profile: StudentProfile;
      stats: {
        total: number;
        pending: number;
        underReview: number;
        accepted: number;
        rejected: number;
        withdrawn: number;
        completed: number;
      };
      recentApplications: Application[];
    }>('/student/dashboard'),
  getPublicProfile: (id: string) =>
    api.get<{ profile: Partial<StudentProfile> }>(`/student/profile/${id}/public`),
};

// --- Business APIs ---
export const businessApi = {
  getProfile: () => api.get<{ profile: BusinessProfile }>('/business/profile'),
  updateProfile: (data: Partial<BusinessProfile>) =>
    api.put<{ message: string; profile: BusinessProfile }>('/business/profile', data),
  uploadLogo: (formData: FormData) =>
    api.post<{ message: string; url: string }>('/business/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submitVerification: (data: { taxId?: string; registrationNo?: string; additionalInfo?: string }) =>
    api.post<{ message: string }>('/business/verification', data),
  getDashboard: () =>
    api.get<{
      business: BusinessProfile;
      stats: {
        totalGigs: number;
        activeGigs: number;
        totalApplications: number;
        pendingApplications: number;
        acceptedApplications: number;
      };
      recentGigs: Gig[];
    }>('/business/dashboard'),
  getPublicProfile: (id: string) =>
    api.get<{ profile: Partial<BusinessProfile> }>(`/business/profile/${id}/public`),
};

// --- Gig APIs ---
export const gigApi = {
  getGigs: (params?: {
    search?: string;
    category?: string;
    workType?: string;
    minComp?: string;
    skills?: string;
    sort?: string;
  }) => api.get<{ gigs: Gig[]; total: number }>('/gigs', { params }),
  getCategories: () => api.get<{ categories: string[] }>('/gigs/categories'),
  getBusinessGigs: () => api.get<{ gigs: Gig[] }>('/gigs/business/mine'),
  getGigById: (id: string) =>
    api.get<{ gig: Gig; hasApplied: boolean; applicationStatus: string | null }>(`/gigs/${id}`),
  createGig: (data: Partial<Gig>) => api.post<{ message: string; gig: Gig }>('/gigs', data),
  updateGig: (id: string, data: Partial<Gig>) =>
    api.put<{ message: string; gig: Gig }>(`/gigs/${id}`, data),
  deleteGig: (id: string) => api.delete<{ message: string }>(`/gigs/${id}`),
  getGigApplications: (id: string) =>
    api.get<{ applications: Application[] }>(`/gigs/${id}/applications`),
};

// --- Application APIs ---
export const applicationApi = {
  apply: (data: { gigId: string; coverLetter?: string }) =>
    api.post<{ message: string; application: Application }>('/applications', data),
  getMyApplications: () => api.get<{ applications: Application[] }>('/applications/mine'),
  withdraw: (id: string) => api.patch<{ message: string; application: Application }>(`/applications/${id}/withdraw`),
  updateStatus: (id: string, data: { status: string; providerNote?: string }) =>
    api.patch<{ message: string; application: Application }>(`/applications/${id}/status`, data),
  getById: (id: string) => api.get<{ application: Application }>(`/applications/${id}`),
};

// --- Match APIs ---
export const matchApi = {
  getRecommendations: () =>
    api.get<{ recommendations: RecommendedGig[] }>('/match/recommendations'),
  getScore: (gigId: string) =>
    api.get<{
      score: number;
      matchingSkills: string[];
      missingSkills: string[];
      skillScore: number;
      availabilityScore: number;
      workTypeScore: number;
    }>(`/match/score/${gigId}`),
};

// --- SmartMatch APIs ---
export const smartMatchApi = {
  getGigResults: (
    gigId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      filter?: string;
      minScore?: number;
      maxScore?: number;
      status?: string;
      skills?: string;
      recalculate?: boolean;
    }
  ) =>
    api.get<{
      stats: SmartMatchStats;
      applicants: SmartMatchApplicant[];
      pagination: { page: number; pages: number; total: number };
    }>(`/smartmatch/gig/${gigId}`, { params }),

  getApplicantReport: (gigId: string, applicationId: string) =>
    api.get<{ report: SmartMatchApplicant }>(
      `/smartmatch/gig/${gigId}/applicant/${applicationId}`
    ),

  recalculate: (gigId: string) =>
    api.post<{ message: string; count: number }>(`/smartmatch/gig/${gigId}/recalculate`),

  toggleShortlist: (applicationId: string, shortlisted?: boolean) =>
    api.patch<{ message: string; isShortlisted: boolean }>(
      `/smartmatch/application/${applicationId}/shortlist`,
      { shortlisted }
    ),

  bulkShortlist: (gigId: string, count: number) =>
    api.post<{ message: string; shortlisted: number; applicationIds: string[] }>(
      `/smartmatch/gig/${gigId}/bulk-shortlist`,
      { count }
    ),
};

// --- Report APIs ---
export const reportApi = {
  submit: (data: { reportedUserId?: string; reportedGigId?: string; reason: string; description?: string }) =>
    api.post<{ message: string; report: Report }>('/reports', data),
  getMyReports: () => api.get<{ reports: Report[] }>('/reports/mine'),
};

// --- Admin APIs ---
export const adminApi = {
  getOverview: () =>
    api.get<{
      totalStudents: number;
      totalBusinesses: number;
      totalGigs: number;
      totalApplications: number;
      pendingVerifications: number;
      pendingReports: number;
    }>('/admin/overview'),
  getUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    api.get<{ users: User[]; total: number; page: number; pages: number }>('/admin/users', { params }),
  suspendUser: (id: string, suspend: boolean) =>
    api.patch<{ message: string }>(`/admin/users/${id}/suspend`, { suspend }),
  getVerifications: () =>
    api.get<{ requests: VerificationRequest[] }>('/admin/verifications'),
  reviewVerification: (id: string, data: { action: 'APPROVED' | 'REJECTED'; adminNote?: string }) =>
    api.patch<{ message: string }>(`/admin/verifications/${id}`, data),
  getAllGigs: () => api.get<{ gigs: Gig[] }>('/admin/gigs'),
  moderateGig: (id: string, action: 'suspend' | 'restore' | 'delete') =>
    api.patch<{ message: string }>(`/admin/gigs/${id}/moderate`, { action }),
  getReports: () => api.get<{ reports: Report[] }>('/admin/reports'),
  reviewReport: (id: string, data: { action: 'REVIEWED' | 'RESOLVED' | 'DISMISSED'; adminNote?: string }) =>
    api.patch<{ message: string }>(`/admin/reports/${id}`, data),
  createAdmin: (data: { email: string; password: string }) =>
    api.post<{ message: string; userId: string }>('/admin/create-admin', data),
};

