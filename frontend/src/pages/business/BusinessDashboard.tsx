import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { businessApi } from '../../api/client';
import { BusinessProfile, Gig } from '../../types';
import { VerificationBadge } from '../../components/VerificationBadge';
import {
  Building2,
  Briefcase,
  Users,
  PlusCircle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const BusinessDashboard: React.FC = () => {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [stats, setStats] = useState({
    totalGigs: 0,
    activeGigs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
  });
  const [recentGigs, setRecentGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await businessApi.getDashboard();
      setBusiness(res.data.business);
      setStats(res.data.stats);
      setRecentGigs(res.data.recentGigs || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load business dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Recruiter Portal
              </span>
              {business && <VerificationBadge status={business.verificationStatus} />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {business?.businessName || 'Business Organization'}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              {business?.industry || 'Technology'} • {business?.location || 'Remote'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/business/gigs/new"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Gig</span>
            </Link>
            <Link
              to="/business/profile"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Verification prompt banner if not verified */}
      {business && business.verificationStatus !== 'VERIFIED' && (
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                {business.verificationStatus === 'PENDING'
                  ? 'Verification Request Under Review'
                  : 'Get Verified for Greater Student Trust'}
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                {business.verificationStatus === 'PENDING'
                  ? 'Our moderation team is reviewing your tax and registration documents.'
                  : 'Verified businesses receive 3x more high-quality student applicants.'}
              </p>
            </div>
          </div>
          <Link
            to="/business/verification"
            className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl transition shrink-0"
          >
            {business.verificationStatus === 'PENDING' ? 'View Status' : 'Submit Verification →'}
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Gigs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalGigs}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs bg-emerald-50/20">
          <p className="text-xs font-medium text-emerald-700">Active Listings</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.activeGigs}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs bg-indigo-50/20">
          <p className="text-xs font-medium text-indigo-700">Total Applicants</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs bg-amber-50/20">
          <p className="text-xs font-medium text-amber-700">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingApplications}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs bg-purple-50/20">
          <p className="text-xs font-medium text-purple-700">Accepted Candidates</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.acceptedApplications}</p>
        </div>
      </div>

      {/* Recent Gigs Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Posted Gigs</h2>
            <p className="text-xs text-slate-500">
              Manage your published listings and review applicants
            </p>
          </div>
          <Link
            to="/business/gigs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View all gigs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentGigs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs space-y-4">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No gigs posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post an internship, freelance task, or short-term project to connect with students.
            </p>
            <Link
              to="/business/gigs/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Gig</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {recentGigs.map((gig) => (
              <div key={gig.id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {gig.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        gig.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {gig.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition">
                    <Link to={`/business/gigs/${gig.id}/applicants`}>{gig.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ₹{gig.compensation}/{gig.compensationType} • {gig.workType} • Created{' '}
                    {new Date(gig.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Link
                    to={`/business/gigs/${gig.id}/smartmatch`}
                    className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                    title="SmartMatch AI Ranking"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    <span>SmartMatch</span>
                  </Link>

                  <Link
                    to={`/business/gigs/${gig.id}/applicants`}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Applicants ({(gig as any)._count?.applications || 0})</span>
                  </Link>
                  <Link
                    to={`/business/gigs/${gig.id}/edit`}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

