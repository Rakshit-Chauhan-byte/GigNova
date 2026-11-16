import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gigApi, applicationApi } from '../../api/client';
import { Application, Gig, ApplicationStatus } from '../../types';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';

export const GigApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status update modal / inline prompt state
  const [activeModal, setActiveModal] = useState<{
    app: Application;
    newStatus: ApplicationStatus;
  } | null>(null);
  const [providerNote, setProviderNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gigRes, appsRes] = await Promise.all([
        gigApi.getGigById(id!),
        gigApi.getGigApplications(id!),
      ]);
      setGig(gigRes.data.gig);
      setApplications(appsRes.data.applications);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to load gig applications.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!activeModal) return;
    setUpdatingId(activeModal.app.id);

    try {
      await applicationApi.updateStatus(activeModal.app.id, {
        status: activeModal.newStatus,
        providerNote: providerNote.trim() || undefined,
      });

      setFeedbackMsg({
        type: 'success',
        text: `Application status updated to ${activeModal.newStatus.replace('_', ' ')}.`,
      });
      setActiveModal(null);
      setProviderNote('');
      await fetchData();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update application status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/business/gigs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Gigs</span>
        </Link>

        <Link
          to={`/business/gigs/${id}/smartmatch`}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>SmartMatch™ Ranking</span>
        </Link>
      </div>

      {gig && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase">
              {gig.category}
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{gig.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ₹{gig.compensation}/{gig.compensationType} • {gig.openings} opening(s)
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600">{applications.length}</span>
            <span className="text-xs text-slate-500 block">Total Applicants</span>
          </div>
        </div>
      )}

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No student applications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once students discover this gig and apply, their profiles and match scores will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const studentProfile = app.student?.studentProfile;
            return (
              <div
                key={app.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition"
              >
                {/* Header row: student name, match score, status badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">
                        {studentProfile?.fullName || app.student?.email}
                      </h3>
                      <MatchScoreBadge score={app.matchScore} size="sm" />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      <span>
                        {studentProfile?.college || 'University Student'}
                        {studentProfile?.degree ? ` • ${studentProfile.degree}` : ''}
                        {studentProfile?.yearOfStudy ? ` (${studentProfile.yearOfStudy})` : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        app.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : app.status === 'UNDER_REVIEW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : app.status === 'COMPLETED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : app.status === 'WITHDRAWN'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Student Skills */}
                {studentProfile?.skills && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Student Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {studentProfile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External links */}
                <div className="flex flex-wrap gap-4 text-xs">
                  {studentProfile?.githubUrl && (
                    <a
                      href={studentProfile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {studentProfile?.linkedinUrl && (
                    <a
                      href={studentProfile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {studentProfile?.portfolioUrl && (
                    <a
                      href={studentProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <span>Portfolio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Cover letter */}
                {app.coverLetter && (
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                    <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Applicant Cover Note:</span>
                    </p>
                    <p className="whitespace-pre-wrap">{app.coverLetter}</p>
                  </div>
                )}

                {/* Recruiter feedback note display if present */}
                {app.providerNote && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-indigo-900 border border-indigo-100">
                    <p className="font-bold text-indigo-700">Employer Note Sent to Student:</p>
                    <p className="mt-0.5">{app.providerNote}</p>
                  </div>
                )}

                {/* Action Buttons based on status */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  <Link
                    to={`/business/gigs/${id}/smartmatch/${app.id}`}
                    className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1 mr-auto"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>SmartMatch Report</span>
                  </Link>

                  {app.status === 'PENDING' && (
                    <button
                      onClick={() =>
                        setActiveModal({ app, newStatus: 'UNDER_REVIEW' })
                      }
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition"
                    >
                      Mark Under Review
                    </button>
                  )}

                  {['PENDING', 'UNDER_REVIEW'].includes(app.status) && (
                    <>
                      <button
                        onClick={() =>
                          setActiveModal({ app, newStatus: 'ACCEPTED' })
                        }
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Candidate</span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveModal({ app, newStatus: 'REJECTED' })
                        }
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === 'ACCEPTED' && (
                    <button
                      onClick={() =>
                        setActiveModal({ app, newStatus: 'COMPLETED' })
                      }
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Work Completed</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Status Change: {activeModal.newStatus.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-600">
              You are updating the status for{' '}
              <strong>
                {activeModal.app.student?.studentProfile?.fullName || activeModal.app.student?.email}
              </strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Optional Message / Instructions for Student
              </label>
              <textarea
                value={providerNote}
                onChange={(e) => setProviderNote(e.target.value)}
                rows={3}
                placeholder="e.g. Next steps, meeting link, onboarding docs, or constructive feedback..."
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
                disabled={updatingId === activeModal.app.id}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {updatingId === activeModal.app.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

