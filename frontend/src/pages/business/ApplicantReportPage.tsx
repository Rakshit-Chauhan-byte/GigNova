import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gigApi, smartMatchApi, applicationApi } from '../../api/client';
import {
  Gig,
  SmartMatchApplicant,
  ApplicationStatus,
} from '../../types';
import { SmartMatchScoreBadge, getScoreBand } from '../../components/SmartMatchScoreBadge';
import { ScoreBreakdown } from '../../components/ScoreBreakdown';
import {
  ArrowLeft,
  Sparkles,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  GraduationCap,
  Calendar,
  MapPin,
  FileText,
  User,
  ShieldCheck,
  ShieldAlert,
  Check,
  MessageSquare,
} from 'lucide-react';

export const ApplicantReportPage: React.FC = () => {
  const { id: gigId, applicationId } = useParams<{ id: string; applicationId: string }>();

  const [gig, setGig] = useState<Gig | null>(null);
  const [reportData, setReportData] = useState<SmartMatchApplicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Status update modal / prompt state
  const [activeModal, setActiveModal] = useState<{
    newStatus: ApplicationStatus;
  } | null>(null);
  const [providerNote, setProviderNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (gigId && applicationId) {
      loadReport();
    }
  }, [gigId, applicationId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const [gigRes, reportRes] = await Promise.all([
        gigApi.getGigById(gigId!),
        smartMatchApi.getApplicantReport(gigId!, applicationId!),
      ]);
      setGig(gigRes.data.gig);
      setReportData(reportRes.data.report);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to load candidate SmartMatch report.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShortlist = async () => {
    if (!reportData) return;
    const current = reportData.smartMatchScore.isShortlisted;
    try {
      setShortlisting(true);
      const res = await smartMatchApi.toggleShortlist(applicationId!, !current);
      setReportData({
        ...reportData,
        smartMatchScore: {
          ...reportData.smartMatchScore,
          isShortlisted: res.data.isShortlisted,
        },
      });
      setFeedbackMsg({
        type: 'success',
        text: res.data.isShortlisted
          ? 'Candidate added to shortlist.'
          : 'Candidate removed from shortlist.',
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update shortlist status.',
      });
    } finally {
      setShortlisting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!activeModal || !reportData) return;
    setUpdatingStatus(true);

    try {
      await applicationApi.updateStatus(applicationId!, {
        status: activeModal.newStatus,
        providerNote: providerNote.trim() || undefined,
      });

      setFeedbackMsg({
        type: 'success',
        text: `Application status updated to ${activeModal.newStatus.replace('_', ' ')}.`,
      });
      setActiveModal(null);
      setProviderNote('');
      await loadReport();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update application status.',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-medium">Generating candidate SmartMatch report...</p>
      </div>
    );
  }

  if (!reportData || !gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Report Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested SmartMatch applicant evaluation could not be retrieved.
        </p>
        <Link
          to={`/business/gigs/${gigId}/smartmatch`}
          className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SmartMatch Rankings</span>
        </Link>
      </div>
    );
  }

  const { application, smartMatchScore, rank } = reportData;
  const student = application.student;
  const profile = student?.studentProfile;
  const score = smartMatchScore;
  const { label: bandLabel } = getScoreBand(score.totalScore);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={`/business/gigs/${gigId}/smartmatch`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gig SmartMatch Rankings</span>
        </Link>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Profile & Score Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Student Bio & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-slate-900 text-white tracking-wider uppercase">
                Rank #{rank} Candidate
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  application.status === 'ACCEPTED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : application.status === 'UNDER_REVIEW'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : application.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : application.status === 'COMPLETED'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {application.status.replace('_', ' ')}
              </span>
              {score.isShortlisted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                  <span>Shortlisted</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {profile?.fullName || student?.email}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{student?.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1 font-medium">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>
                  {profile?.college || 'University Student'}
                  {profile?.degree ? ` • ${profile.degree}` : ''}
                  {profile?.yearOfStudy ? ` (${profile.yearOfStudy})` : ''}
                </span>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="capitalize">{profile?.preferredWorkType || 'Remote'} Preference</span>
              </span>
            </div>

            {/* External Links */}
            <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold">
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {profile?.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Large Overall Compatibility Ring / Display */}
          <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 border border-slate-200 text-center min-w-[200px] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Overall Compatibility
              </span>
              <div className="text-4xl font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <span>{score.totalScore}%</span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 mt-2 inline-block">
                {bandLabel}
              </span>
            </div>

            {/* Shortlist Toggle Button */}
            <button
              onClick={handleToggleShortlist}
              disabled={shortlisting}
              className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border shadow-2xs ${
                score.isShortlisted
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {shortlisting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Star className={`w-3.5 h-3.5 ${score.isShortlisted ? 'fill-amber-500 text-amber-600' : ''}`} />
              )}
              <span>{score.isShortlisted ? 'Shortlisted Candidate' : 'Add to Shortlist'}</span>
            </button>
          </div>
        </div>

        {/* Gig Target Context */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Evaluating against gig: <strong>{gig.title}</strong> ({gig.category})
          </span>
          <span className="text-slate-500">
            {gig.workType.toUpperCase()} • ₹{gig.compensation}/{gig.compensationType} • Duration: {gig.duration || 'Flexible'}
          </span>
        </div>
      </div>

      {/* Mandatory Eligibility Card */}
      <div
        className={`p-5 rounded-2xl border text-xs space-y-2 ${
          score.isEligible
            ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
            : 'bg-rose-50/50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {score.isEligible ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <h3 className="font-bold text-sm">
            {score.isEligible
              ? 'Candidate Meets All Mandatory Eligibility Requirements'
              : 'Mandatory Requirement Notice / Potential Mismatch'}
          </h3>
        </div>

        {score.isEligible ? (
          <p className="text-emerald-700 text-xs pl-7">
            The candidate meets active gig requirements, schedule availability, foundation skills, and
            work arrangement terms.
          </p>
        ) : (
          <div className="pl-7 space-y-1">
            <p className="font-semibold text-rose-800">
              The algorithm identified the following non-negotiable considerations:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-rose-700">
              {score.eligibilityReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5-Factor Score Breakdown Visualization */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">5-Factor Scoring Breakdown</h2>
          <p className="text-xs text-slate-500">
            Deterministic weights: Skills (40%), Experience (20%), Availability (20%), Work Mode (10%),
            Assessment (10%)
          </p>
        </div>

        <ScoreBreakdown
          skillScore={score.skillScore}
          experienceScore={score.experienceScore}
          availabilityScore={score.availabilityScore}
          workModeScore={score.workModeScore}
          assessmentScore={score.assessmentScore}
        />
      </div>

      {/* Deep Dive Factor Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Factor 1: Technical Skills Analysis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Technical Skills Compatibility</span>
            </h3>
            <span className="text-xs font-black text-indigo-600">{score.skillScore}/100</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {score.explanation?.skillAnalysis || 'Direct and related skills assessment.'}
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Directly Matched Skills:
              </span>
              <div className="flex flex-wrap gap-1">
                {score.matchedSkills.length > 0 ? (
                  score.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None directly matched</span>
                )}
              </div>
            </div>

            {score.partiallyMatchedSkills.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Transferable / Related Skills:
                </span>
                <div className="flex flex-wrap gap-1">
                  {score.partiallyMatchedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      ~ {s} (Related)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {score.missingSkills.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Missing Skills:
                </span>
                <div className="flex flex-wrap gap-1">
                  {score.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Factor 2: Experience & Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Project & Experience Relevance</h3>
            <span className="text-xs font-black text-indigo-600">{score.experienceScore}/100</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {score.explanation?.experienceAnalysis}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Documented Background:
            </span>
            <p className="text-slate-700 italic">
              {profile?.experience || 'No formal experience paragraph specified.'}
            </p>
          </div>
        </div>

        {/* Factor 3: Availability & Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Availability Compatibility</h3>
            <span className="text-xs font-black text-indigo-600">{score.availabilityScore}/100</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {score.explanation?.availabilityAnalysis}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Required by Gig:
            </span>
            <p className="text-slate-800 font-semibold">
              {gig.requiredAvailability || 'Flexible / As needed'}
            </p>

            <span className="text-[10px] font-bold text-slate-400 uppercase block pt-1">
              Candidate Stated Availability:
            </span>
            <p className="text-slate-800 font-semibold">
              {profile?.availability
                ? typeof profile.availability === 'string'
                  ? profile.availability
                  : `${(profile.availability.days || []).join(', ')} • ${profile.availability.hours || ''}`
                : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Factor 4 & 5: Work Mode & Application Depth */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Work Mode & Application Depth</h3>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-slate-500">
                Mode: {score.workModeScore}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Effort: {score.assessmentScore}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {score.explanation?.workModeAnalysis}
          </p>

          <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
            {score.explanation?.assessmentAnalysis}
          </p>
        </div>
      </div>

      {/* Cover Letter Section */}
      {application.coverLetter && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Applicant Cover Letter</span>
          </h2>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
            {application.coverLetter}
          </div>
        </div>
      )}

      {/* Employer Note Sent (if any) */}
      {application.providerNote && (
        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1">
          <span className="font-bold text-indigo-900">Note previously sent to applicant:</span>
          <p className="text-indigo-800">{application.providerNote}</p>
        </div>
      )}

      {/* Recruiter Decision Actions Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Hiring Decision & Status</h3>
          <p className="text-xs text-slate-500">
            Update candidate status and communicate next steps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {application.status === 'PENDING' && (
            <button
              onClick={() => setActiveModal({ newStatus: 'UNDER_REVIEW' })}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition"
            >
              Move to Under Review
            </button>
          )}

          {['PENDING', 'UNDER_REVIEW'].includes(application.status) && (
            <>
              <button
                onClick={() => setActiveModal({ newStatus: 'ACCEPTED' })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept Candidate</span>
              </button>

              <button
                onClick={() => setActiveModal({ newStatus: 'REJECTED' })}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition"
              >
                Reject Candidate
              </button>
            </>
          )}

          {application.status === 'ACCEPTED' && (
            <button
              onClick={() => setActiveModal({ newStatus: 'COMPLETED' })}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Work Completed</span>
            </button>
          )}
        </div>
      </div>

      {/* Decision Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update Candidate Status to {activeModal.newStatus.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirming this update will inform <strong>{profile?.fullName || student?.email}</strong>.
              You can include instructions, meeting links, or onboarding feedback below.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Message / Instructions for Student (Optional)
              </label>
              <textarea
                value={providerNote}
                onChange={(e) => setProviderNote(e.target.value)}
                rows={3}
                placeholder="e.g. Welcome aboard! Let's connect on Slack or Google Meet next Monday..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setProviderNote('');
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
