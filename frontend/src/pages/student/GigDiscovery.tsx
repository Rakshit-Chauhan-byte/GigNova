import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gigApi, matchApi } from '../../api/client';
import { Gig } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationBadge } from '../../components/VerificationBadge';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Loader2,
  Building2,
  ChevronRight,
} from 'lucide-react';

export const GigDiscovery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isStudent } = useAuth();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Search & filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedWorkType, setSelectedWorkType] = useState(searchParams.get('workType') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [skillFilter, setSkillFilter] = useState(searchParams.get('skills') || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGigs();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await gigApi.getCategories();
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('workType')) params.workType = searchParams.get('workType');
      if (searchParams.get('skills')) params.skills = searchParams.get('skills');
      if (searchParams.get('sort')) params.sort = searchParams.get('sort');

      const res = await gigApi.getGigs(params);
      setGigs(res.data.gigs);

      // If student is logged in, optionally fetch match recommendations to badge them
      if (isStudent) {
        try {
          const recRes = await matchApi.getRecommendations();
          const scoreMap: Record<string, number> = {};
          recRes.data.recommendations.forEach((r) => {
            scoreMap[r.gig.id] = r.score;
          });
          setMatchScores(scoreMap);
        } catch (e) {
          // ignore if non-critical
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedWorkType) params.set('workType', selectedWorkType);
    if (skillFilter.trim()) params.set('skills', skillFilter.trim());
    if (selectedSort !== 'newest') params.set('sort', selectedSort);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedWorkType('');
    setSelectedSort('newest');
    setSkillFilter('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore Student Gigs & Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified short-term internships, freelance tasks, and university student roles.
          </p>
        </div>

        {/* Search bar & filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              placeholder="Search by role title, keywords, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
              <option value="Part-time">Part-time</option>
              {categories
                .filter((c) => !['Internship', 'Freelance', 'Part-time'].includes(c))
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Work Types</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Gigs</span>
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Skill filter input */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="font-bold text-slate-500">Filter by Skill:</span>
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="e.g. React, Python, UI Design..."
            className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {skillFilter && (
            <button
              onClick={() => {
                setSkillFilter('');
                const params = new URLSearchParams(searchParams);
                params.delete('skills');
                setSearchParams(params);
              }}
              className="text-[11px] text-rose-600 font-bold hover:underline"
            >
              Clear skill
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <p>
          Showing <strong className="text-slate-800">{gigs.length}</strong> available gigs
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              const p = new URLSearchParams(searchParams);
              p.set('sort', e.target.value);
              setSearchParams(p);
            }}
            className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="newest">Recently Posted</option>
            <option value="compensation">Highest Compensation</option>
          </select>
        </div>
      </div>

      {/* Gigs List */}
      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-sm text-slate-500">Loading opportunities...</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No gigs matched your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
            Try loosening your filters, searching for a different skill, or clearing the search query.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => {
            const matchScore = matchScores[gig.id];
            return (
              <div
                key={gig.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {gig.category}
                    </span>
                    {matchScore !== undefined && <MatchScoreBadge score={matchScore} size="sm" />}
                  </div>

                  {/* Title & Employer */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                      <Link to={`/gigs/${gig.id}`}>{gig.title}</Link>
                    </h3>

                    {gig.business && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{gig.business.businessName}</span>
                        <VerificationBadge
                          status={gig.business.verificationStatus}
                          showLabel={false}
                        />
                      </div>
                    )}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {gig.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(gig.requiredSkills || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {(gig.requiredSkills || []).length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{(gig.requiredSkills || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-base font-black text-slate-900">
                      ₹{gig.compensation}
                      <span className="text-[11px] font-normal text-slate-500">
                        /{gig.compensationType}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {gig.workType} • {gig.duration || 'Flexible'}
                    </p>
                  </div>

                  <Link
                    to={`/gigs/${gig.id}`}
                    className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white transition"
                    title="View Gig Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

