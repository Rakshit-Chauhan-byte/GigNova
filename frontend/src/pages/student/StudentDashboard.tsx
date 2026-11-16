import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentApi, matchApi } from '../../api/client';
import { StudentProfile, Application, RecommendedGig } from '../../types';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import { VerificationBadge } from '../../components/VerificationBadge';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
    completed: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, matchRes] = await Promise.all([
          studentApi.getDashboard(),
          matchApi.getRecommendations().catch(() => ({ data: { recommendations: [] } })),
        ]);

        setProfile(dashRes.data.profile);
        setStats(dashRes.data.stats);
        setRecentApplications(dashRes.data.recentApplications || []);
        setRecommendations(matchRes.data.recommendations || []);
      } catch (err: any) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.fullName) score += 15;
    if (profile.college) score += 15;
    if (profile.degree) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 25;
    if (profile.bio) score += 15;
    if (profile.githubUrl || profile.linkedinUrl) score += 10;
    if (profile.availability) score += 10;
    return Math.min(100, score);
  };

  const completion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500 font-medium">Loading your student dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {profile?.fullName || 'Student'}! 👋
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              {profile?.college || 'Sharda University'} • {profile?.degree || 'Undergraduate'}
              {profile?.yearOfStudy ? ` (${profile.yearOfStudy})` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/gigs"
              className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse All Gigs</span>
            </Link>
            <Link
              to="/student/profile"
              className="px-4 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold text-xs rounded-xl border border-white/20 transition"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Card if < 100% */}
      {completion < 100 && (
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-extrabold text-sm border border-amber-200">
              {completion}%
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Complete your profile for better gig matches
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add skills, availability, and portfolio links to increase your matching score.
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition text-center shrink-0"
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Applied</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs bg-amber-50/20">
          <p className="text-xs font-medium text-amber-700">Pending</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs bg-blue-50/20">
          <p className="text-xs font-medium text-blue-700">Under Review</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.underReview}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs bg-emerald-50/20">
          <p className="text-xs font-medium text-emerald-700">Accepted</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs bg-rose-50/20">
          <p className="text-xs font-medium text-rose-700">Rejected</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.rejected}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs bg-purple-50/20">
          <p className="text-xs font-medium text-purple-700">Completed</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Dual Column: Top Recommendations & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI/Deterministic Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Recommended for Your Skills</h2>
            </div>
            <Link to="/gigs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active recommendations right now</p>
              <p className="text-xs text-slate-400 mt-1">
                Update your skills in profile or check back as new gigs are posted.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 4).map(({ gig, score, matchingSkills, explanation }) => (
                <div
                  key={gig.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {gig.category}
                        </span>
                        {gig.business && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <span>{gig.business.businessName}</span>
                            <VerificationBadge status={gig.business.verificationStatus} showLabel={false} />
                          </div>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        <Link to={`/gigs/${gig.id}`}>{gig.title}</Link>
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {gig.description}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <MatchScoreBadge score={score} />
                      <p className="text-sm font-extrabold text-slate-900 mt-2">
                        ₹{gig.compensation}
                        <span className="text-[10px] font-normal text-slate-400 block">
                          /{gig.compensationType}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Matching skills tag row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Matched:</span>
                      {matchingSkills.slice(0, 3).map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100"
                        >
                          {sk}
                        </span>
                      ))}
                      {matchingSkills.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">No exact skill match</span>
                      )}
                    </div>

                    <Link
                      to={`/gigs/${gig.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <span>View & Apply</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Recent Applications List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <Link
              to="/student/applications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all ({stats.total})
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No applications submitted</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                You haven't applied to any gigs yet.
              </p>
              <Link
                to="/gigs"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Browse Gigs
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
              {recentApplications.map((app) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition">
                        <Link to={`/gigs/${app.gigId}`}>{app.gig?.title || 'Gig Opportunity'}</Link>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {app.gig?.business?.businessName || 'Business'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        app.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : app.status === 'UNDER_REVIEW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : app.status === 'COMPLETED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

