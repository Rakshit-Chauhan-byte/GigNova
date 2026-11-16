import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/client';
import { Application, ApplicationStatus } from '../../types';
import { VerificationBadge } from '../../components/VerificationBadge';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  ExternalLink,
  MessageSquare,
  Building2,
} from 'lucide-react';

export const StudentApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [withdrawModalApp, setWithdrawModalApp] = useState<Application | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getMyApplications();
      setApplications(res.data.applications);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to load applications.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawModalApp) return;
    setActionLoading(withdrawModalApp.id);

    try {
      await applicationApi.withdraw(withdrawModalApp.id);
      setFeedbackMsg({ type: 'success', text: 'Application withdrawn successfully.' });
      setWithdrawModalApp(null);
      await fetchApplications();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to withdraw application.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <RotateCcw className="w-3.5 h-3.5" />
            Withdrawn
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Work Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and manage your applications to student gigs and internships.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {['ALL', 'PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'WITHDRAWN'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

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

      {filteredApplications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications in this category</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Explore active openings and apply with your customized cover letter.
          </p>
          <Link
            to="/gigs"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Explore Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {app.gig?.category || 'Gig'}
                    </span>
                    {app.gig?.business && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.gig.business.businessName}</span>
                        <VerificationBadge
                          status={app.gig.business.verificationStatus}
                          showLabel={false}
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition">
                    <Link to={`/gigs/${app.gigId}`}>{app.gig?.title || 'Gig Opportunity'}</Link>
                  </h3>

                  <p className="text-xs text-slate-500">
                    Applied on {new Date(app.createdAt).toLocaleDateString()} at{' '}
                    {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <MatchScoreBadge score={app.matchScore} size="sm" />
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    ₹{app.gig?.compensation}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      /{app.gig?.compensationType}
                    </span>
                  </p>
                </div>
              </div>

              {/* Cover Letter excerpt */}
              {app.coverLetter && (
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-indigo-600" />
                    <span>Your Application Note:</span>
                  </p>
                  <p className="whitespace-pre-wrap">{app.coverLetter}</p>
                </div>
              )}

              {/* Recruiter feedback note if accepted/rejected */}
              {app.providerNote && (
                <div className="p-3.5 bg-indigo-50/50 rounded-xl text-xs text-indigo-900 border border-indigo-100">
                  <p className="font-bold text-indigo-700 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-indigo-600" />
                    <span>Message from Employer:</span>
                  </p>
                  <p className="whitespace-pre-wrap">{app.providerNote}</p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <Link
                  to={`/gigs/${app.gigId}`}
                  className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>View Original Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {/* Withdraw application button if eligible */}
                {['PENDING', 'UNDER_REVIEW'].includes(app.status) && (
                  <button
                    onClick={() => setWithdrawModalApp(app)}
                    className="font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdraw confirmation modal */}
      {withdrawModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Withdraw Application?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to withdraw your application for{' '}
              <strong>{withdrawModalApp.gig?.title}</strong>? You will need to contact the recruiter if you change your mind.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawModalApp(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={actionLoading === withdrawModalApp.id}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {actionLoading === withdrawModalApp.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

