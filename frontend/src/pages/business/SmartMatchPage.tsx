import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gigApi, smartMatchApi } from '../../api/client';
import {
  Gig,
  SmartMatchApplicant,
  SmartMatchStats,
} from '../../types';
import { SmartMatchScoreBadge } from '../../components/SmartMatchScoreBadge';
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const SmartMatchPage: React.FC = () => {
  const { id: gigId } = useParams<{ id: string }>();

  const [gig, setGig] = useState<Gig | null>(null);
  const [stats, setStats] = useState<SmartMatchStats | null>(null);
  const [applicants, setApplicants] = useState<SmartMatchApplicant[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [shortlistingId, setShortlistingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Filters & sorting state
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'ineligible' | 'shortlisted'>('all');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Bulk Shortlist Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (gigId) {
      loadInitialData();
    }
  }, [gigId]);

  useEffect(() => {
    if (gigId) {
      fetchSmartMatchData();
    }
  }, [gigId, filterType, statusFilter, minScoreFilter, skillSearch, sortBy, currentPage, pageSize]);

  const loadInitialData = async () => {
    try {
      const gigRes = await gigApi.getGigById(gigId!);
      setGig(gigRes.data.gig);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to load gig details.' });
    }
  };

  const fetchSmartMatchData = async () => {
    try {
      setLoading(true);
      const res = await smartMatchApi.getGigResults(gigId!, {
        page: currentPage,
        limit: pageSize,
        filter: filterType,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        minScore: minScoreFilter ? Number(minScoreFilter) : undefined,
        skills: skillSearch.trim() || undefined,
        sortBy,
      });

      setStats(res.data.stats);
      setApplicants(res.data.applicants);
      setPagination(res.data.pagination);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to load SmartMatch ranking results.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await smartMatchApi.recalculate(gigId!);
      setFeedbackMsg({
        type: 'success',
        text: res.data.message || 'SmartMatch scores recalculated successfully.',
      });
      await fetchSmartMatchData();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to recalculate scores.',
      });
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggleShortlist = async (applicationId: string, currentStatus: boolean) => {
    try {
      setShortlistingId(applicationId);
      const res = await smartMatchApi.toggleShortlist(applicationId, !currentStatus);

      // Optimistic update in-memory
      setApplicants((prev) =>
        prev.map((a) =>
          a.application.id === applicationId
            ? {
                ...a,
                smartMatchScore: {
                  ...a.smartMatchScore,
                  isShortlisted: res.data.isShortlisted,
                },
              }
            : a
        )
      );

      // Update stats count
      if (stats) {
        setStats({
          ...stats,
          shortlisted: res.data.isShortlisted
            ? stats.shortlisted + 1
            : Math.max(0, stats.shortlisted - 1),
        });
      }

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
      setShortlistingId(null);
    }
  };

  const handleBulkShortlist = async () => {
    try {
      setBulkLoading(true);
      const res = await smartMatchApi.bulkShortlist(gigId!, bulkCount);
      setFeedbackMsg({
        type: 'success',
        text: res.data.message || `Successfully shortlisted top ${res.data.shortlisted} candidates.`,
      });
      setBulkModalOpen(false);
      await fetchSmartMatchData();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.error || 'Bulk shortlist operation failed.',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const resetFilters = () => {
    setFilterType('all');
    setStatusFilter('ALL');
    setMinScoreFilter('');
    setSkillSearch('');
    setSortBy('score');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/business/gigs/${gigId}/applicants`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Standard Applicant View</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition disabled:opacity-50"
            title="Re-run scoring algorithm across all candidates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Scores'}</span>
          </button>

          <button
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Shortlist Top Candidates</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      {gig && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span>GigNova SmartMatch™ Engine</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-0.5 rounded-md uppercase">
                  {gig.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{gig.title}</h1>
              <p className="text-xs text-slate-300 max-w-2xl">
                Deterministic 5-factor applicant ranking engine. Matches candidates by technical skills,
                experience relevance, availability, work mode, and application depth.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-6 shrink-0">
              <div>
                <span className="text-[10px] font-semibold text-slate-300 block uppercase">
                  Top Score
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {stats ? `${stats.highestScore}%` : '--'}
                </span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <span className="text-[10px] font-semibold text-slate-300 block uppercase">
                  Avg Compatibility
                </span>
                <span className="text-2xl font-black text-indigo-300">
                  {stats ? `${stats.averageScore}%` : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
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
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Applicants</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-700 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Eligible Candidates</span>
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.eligible}</span>
          </div>

          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-700 block flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Ineligible</span>
            </span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{stats.ineligible}</span>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-700 block flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Shortlisted</span>
            </span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
              {stats.shortlisted}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Highest Match</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {stats.highestScore}%
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Mean Score</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              {stats.averageScore}%
            </span>
          </div>
        </div>
      )}

      {/* Filter and Sorting Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Eligibility Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Applicants ({stats?.total || 0})
            </button>
            <button
              onClick={() => {
                setFilterType('eligible');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                filterType === 'eligible'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Eligible ({stats?.eligible || 0})</span>
            </button>
            <button
              onClick={() => {
                setFilterType('ineligible');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                filterType === 'ineligible'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Ineligible ({stats?.ineligible || 0})</span>
            </button>
            <button
              onClick={() => {
                setFilterType('shortlisted');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                filterType === 'shortlisted'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Shortlisted ({stats?.shortlisted || 0})</span>
            </button>
          </div>

          {/* Quick Skill Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => {
                setSkillSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by skill (e.g. React, Python, Docker)..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Second Row: Detailed Filters & Sort */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Application Status"
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={minScoreFilter}
            onChange={(e) => {
              setMinScoreFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Minimum Compatibility Score"
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Any Score</option>
            <option value="90">90%+ (Excellent)</option>
            <option value="80">80%+ (Strong)</option>
            <option value="65">65%+ (Moderate)</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Sort applicants by"
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="score">Highest Compatibility Score</option>
              <option value="experience">Experience Relevance</option>
              <option value="date">Newest Application</option>
            </select>

            {(filterType !== 'all' ||
              statusFilter !== 'ALL' ||
              minScoreFilter ||
              skillSearch ||
              sortBy !== 'score') && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Ranking Table / List */}
      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-2xs space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Computing deterministic compatibility scores and ranking candidates...
          </p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-2xs space-y-4">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching applicants found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your score thresholds, skill query, or eligibility filters to view candidate
            evaluations.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map((item) => {
            const student = item.application.student;
            const profile = student?.studentProfile;
            const score = item.smartMatchScore;
            const isEligible = score.isEligible;
            const isShortlisted = score.isShortlisted;

            return (
              <div
                key={item.application.id}
                className={`bg-white rounded-2xl border transition shadow-2xs hover:shadow-xs p-5 space-y-4 ${
                  !isEligible
                    ? 'border-rose-200/80 bg-rose-50/10'
                    : isShortlisted
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Header row: Rank, Student Info, Score Badge, Shortlist toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Rank Medal / Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                        item.rank === 1 && isEligible
                          ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                          : item.rank === 2 && isEligible
                          ? 'bg-slate-200 text-slate-800'
                          : item.rank === 3 && isEligible
                          ? 'bg-amber-700/20 text-amber-900 border border-amber-700/30'
                          : isEligible
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                      title={`Rank #${item.rank}`}
                    >
                      #{item.rank}
                    </div>

                    {/* Student Identity */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {profile?.fullName || student?.email}
                        </h3>

                        <SmartMatchScoreBadge score={score.totalScore} size="sm" />

                        {isShortlisted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                            <span>Shortlisted</span>
                          </span>
                        )}

                        {!isEligible && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Ineligible</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                          {profile?.college || 'University Student'}
                          {profile?.degree ? ` • ${profile.degree}` : ''}
                          {profile?.yearOfStudy ? ` (${profile.yearOfStudy})` : ''}
                        </span>
                        <span>•</span>
                        <span>Applied on {new Date(item.application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Status badge */}
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        item.application.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.application.status === 'UNDER_REVIEW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.application.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.application.status === 'COMPLETED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.application.status.replace('_', ' ')}
                    </span>

                    {/* Shortlist star toggle button */}
                    <button
                      onClick={() => handleToggleShortlist(item.application.id, isShortlisted)}
                      disabled={shortlistingId === item.application.id}
                      className={`p-2 rounded-xl border transition ${
                        isShortlisted
                          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
                      }`}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to candidate shortlist'}
                    >
                      {shortlistingId === item.application.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      ) : (
                        <Star className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
                      )}
                    </button>

                    {/* View Full Report button */}
                    <Link
                      to={`/business/gigs/${gigId}/smartmatch/${item.application.id}`}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
                    >
                      <span>SmartMatch Report</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Skills (40%)
                    </span>
                    <span className="font-bold text-slate-800">{score.skillScore}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Experience (20%)
                    </span>
                    <span className="font-bold text-slate-800">{score.experienceScore}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Availability (20%)
                    </span>
                    <span className="font-bold text-slate-800">{score.availabilityScore}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Work Mode (10%)
                    </span>
                    <span className="font-bold text-slate-800">{score.workModeScore}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Assessment (10%)
                    </span>
                    <span className="font-bold text-slate-800">{score.assessmentScore}/100</span>
                  </div>
                </div>

                {/* Matched vs Missing Skills chips */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Skills:</span>

                    {/* Matched skills */}
                    {score.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{s}</span>
                      </span>
                    ))}

                    {/* Partially matched skills */}
                    {score.partiallyMatchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                        title="Transferable / related skill partial credit"
                      >
                        ~ {s} (Related)
                      </span>
                    ))}

                    {/* Missing skills */}
                    {score.missingSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 line-through"
                        title="Skill missing from applicant profile"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ineligibility Reason Callout if applicable */}
                {!isEligible && score.eligibilityReasons.length > 0 && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Ineligibility Notice:</span>
                    </p>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-700">
                      {score.eligibilityReasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Explanation Summary */}
                {score.explanation?.summary && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{score.explanation.summary}"
                  </p>
                )}
              </div>
            );
          })}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-500">
                  Showing <strong>{(pagination.page - 1) * pageSize + 1}</strong> to{' '}
                  <strong>{Math.min(pagination.page * pageSize, pagination.total)}</strong> of{' '}
                  <strong>{pagination.total}</strong> candidates
                </span>

                <div className="flex items-center gap-1.5 text-slate-500 border-l border-slate-200 pl-3">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold disabled:opacity-40 flex items-center gap-1 mr-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      pagination.page === pg
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold disabled:opacity-40 flex items-center gap-1 ml-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Shortlist Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>Bulk Shortlist Top Candidates</span>
              </h3>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically identify and shortlist the highest-scoring eligible applicants for this gig.
              Candidates can later be reviewed and scheduled for interviews.
            </p>

            {/* Quick preset buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Preset Selection:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkCount(5)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    bulkCount === 5
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Top 5 Candidates</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkCount(10)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    bulkCount === 10
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Top 10 Candidates</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Custom Candidate Count
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={bulkCount}
                onChange={(e) => setBulkCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkShortlist}
                disabled={bulkLoading}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                {bulkLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Shortlist Top {bulkCount} Candidates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
