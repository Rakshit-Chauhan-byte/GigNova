import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gigApi } from '../../api/client';
import { Gig } from '../../types';
import {
  Briefcase,
  Users,
  PlusCircle,
  Trash2,
  Edit,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const BusinessGigs: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalGig, setDeleteModalGig] = useState<Gig | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMyGigs();
  }, []);

  const fetchMyGigs = async () => {
    try {
      setLoading(true);
      const res = await gigApi.getBusinessGigs();
      setGigs(res.data.gigs);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to load your gigs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGig = async () => {
    if (!deleteModalGig) return;
    setDeleting(true);

    try {
      await gigApi.deleteGig(deleteModalGig.id);
      setFeedbackMsg({ type: 'success', text: 'Gig deleted successfully.' });
      setDeleteModalGig(null);
      await fetchMyGigs();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to delete gig.',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Loading your gigs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Posted Gigs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review active postings, edit details, and process received student applications.
          </p>
        </div>

        <Link
          to="/business/gigs/new"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a New Gig</span>
        </Link>
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

      {gigs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No gigs posted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first short-term gig or internship to start receiving student applications.
          </p>
          <Link
            to="/business/gigs/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Gig</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="p-6 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    {gig.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      gig.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {gig.status}
                  </span>
                  {gig.isSuspended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Suspended by Moderation
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition">
                  <Link to={`/business/gigs/${gig.id}/applicants`}>{gig.title}</Link>
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {gig.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="font-bold text-slate-900">
                    ₹{gig.compensation}/{gig.compensationType}
                  </span>
                  <span>• {gig.workType}</span>
                  <span>• {gig.openings} opening(s)</span>
                  <span>• Posted {new Date(gig.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-start md:self-center flex-wrap">
                <Link
                  to={`/business/gigs/${gig.id}/smartmatch`}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  title="Intelligent Candidate Ranking"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>SmartMatch</span>
                </Link>

                <Link
                  to={`/business/gigs/${gig.id}/applicants`}
                  className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Applicants ({(gig as any)._count?.applications || 0})</span>
                </Link>

                <Link
                  to={`/business/gigs/${gig.id}/edit`}
                  title="Edit Gig"
                  className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <Edit className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setDeleteModalGig(gig)}
                  title="Delete Gig"
                  className="p-2.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModalGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Gig Listing?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{deleteModalGig.title}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalGig(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGig}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

