import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gigApi, applicationApi, matchApi } from '../../api/client';
import { Gig } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationBadge } from '../../components/VerificationBadge';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import { ReportModal } from '../../components/ReportModal';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Users,
  Building2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Loader2,
  ArrowLeft,
  Send,
} from 'lucide-react';

export const GigDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useAuth();

  const [gig, setGig] = useState<Gig | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<{
    score: number;
    matchingSkills: string[];
    missingSkills: string[];
    skillScore: number;
    availabilityScore: number;
    workTypeScore: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGigDetails();
    }
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const res = await gigApi.getGigById(id!);
      setGig(res.data.gig);
      setHasApplied(res.data.hasApplied);
      setApplicationStatus(res.data.applicationStatus);

      // Fetch match breakdown if student
      if (isStudent && id) {
        try {
          const matchRes = await matchApi.getScore(id);
          setMatchData(matchRes.data);
        } catch (e) {
          // ignore if non-student
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to load gig details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await applicationApi.apply({
        gigId: id,
        coverLetter: coverLetter.trim() || undefined,
      });

      setHasApplied(true);
      setApplicationStatus(res.data.application.status);
      setSuccessMsg('Application submitted successfully! Track its progress in your dashboard.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500 font-medium">Loading gig details...</p>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Gig Not Found</h2>
        <p className="text-xs text-slate-500">
          This listing may have been closed, deleted, or suspended.
        </p>
        <Link
          to="/gigs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gigs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/gigs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Gigs</span>
        </Link>

        {/* Report button */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600 transition"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Gig</span>
        </button>
      </div>

      {/* Main Gig Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                {gig.category}
              </span>
              <span className="text-xs font-medium text-slate-500 capitalize bg-slate-100 px-2.5 py-1 rounded-md">
                {gig.workType}
              </span>
              {gig.business && (
                <VerificationBadge status={gig.business.verificationStatus} />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {gig.title}
            </h1>

            {gig.business && (
              <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold pt-1">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>{gig.business.businessName}</span>
                {gig.business.location && (
                  <span className="text-xs text-slate-400 font-normal">
                    • {gig.business.location}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right compensation panel */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left md:text-right shrink-0">
            <p className="text-xs font-medium text-slate-500">Compensation</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">
              ₹{gig.compensation}
            </p>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              per {gig.compensationType}
            </p>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Duration</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{gig.duration || 'Flexible'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Openings</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{gig.openings} position(s)</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Work Arrangement</p>
            <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{gig.workType}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Deadline</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Rolling Admission'}
            </p>
          </div>
        </div>

        {/* Compatibility Match Breakdown (If Student) */}
        {isStudent && matchData && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/50 border border-indigo-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Gig Compatibility Breakdown
                </h3>
              </div>
              <MatchScoreBadge score={matchData.score} size="lg" />
            </div>

            <p className="text-xs text-slate-600">
              GigNova calculates deterministic alignment based on your profile skills (60%), availability (25%), and work arrangement (15%).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-indigo-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Skill Match (60%)</p>
                <p className="text-base font-extrabold text-indigo-600 mt-0.5">
                  {matchData.skillScore}/60 pts
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-indigo-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Availability (25%)</p>
                <p className="text-base font-extrabold text-indigo-600 mt-0.5">
                  {matchData.availabilityScore}/25 pts
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-indigo-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Work Type (15%)</p>
                <p className="text-base font-extrabold text-indigo-600 mt-0.5">
                  {matchData.workTypeScore}/15 pts
                </p>
              </div>
            </div>

            {/* Matched & Missing Skills Lists */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div>
                <span className="font-bold text-slate-600 mr-2">Matching Skills:</span>
                {matchData.matchingSkills.length > 0 ? (
                  matchData.matchingSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-md mr-1 border border-emerald-200"
                    >
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </div>

              {matchData.missingSkills.length > 0 && (
                <div>
                  <span className="font-bold text-slate-600 mr-2">Skills to Learn:</span>
                  {matchData.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-md mr-1"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Job & Project Description
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {gig.description}
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Required Skills & Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            {(gig.requiredSkills || []).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Provider Profile Summary */}
        {gig.business && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">About the Employer</h3>
              {gig.business.website && (
                <a
                  href={gig.business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {gig.business.description || 'Verified organization on GigNova.'}
            </p>
          </div>
        )}

        {/* Application Submission Section */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Apply for this Opportunity</h3>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <span>{successMsg}</span>
              <Link to="/student/applications" className="underline font-bold">
                View My Applications →
              </Link>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {hasApplied ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                You have applied to this gig!
              </h4>
              <p className="text-xs text-slate-500">
                Current Status:{' '}
                <strong className="text-indigo-600 uppercase">
                  {applicationStatus?.replace('_', ' ')}
                </strong>
              </p>
              <Link
                to="/student/applications"
                className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                Track your application in Applications Manager →
              </Link>
            </div>
          ) : !isAuthenticated ? (
            <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                Sign in with a student account to apply to this gig.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register?role=STUDENT"
                  className="px-5 py-2.5 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-300 hover:bg-slate-50 transition"
                >
                  Register as Student
                </Link>
              </div>
            </div>
          ) : !isStudent ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
              You are signed in with a <strong>{user?.role.toLowerCase()}</strong> account. Only student accounts can submit applications.
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cover Letter / Brief Pitch (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Introduce yourself, highlight relevant past coursework or GitHub projects, and explain why you are a great fit..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit Application</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedGigId={gig.id}
        reportedGigTitle={gig.title}
        reportedUserId={gig.business?.userId}
        reportedUserName={gig.business?.businessName}
      />
    </div>
  );
};

