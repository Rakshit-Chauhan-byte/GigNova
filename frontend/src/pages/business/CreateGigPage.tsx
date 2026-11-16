import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { gigApi } from '../../api/client';
import {
  Briefcase,
  Plus,
  X,
  Save,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Calendar,
  IndianRupee,
  Sparkles,
} from 'lucide-react';

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'Figma',
  'UI/UX Design',
  'SQL',
  'Tailwind CSS',
  'Data Analysis',
  'Machine Learning',
  'Content Writing',
  'SEO',
  'Digital Marketing',
];

const CATEGORIES = [
  'Internship',
  'Freelance',
  'Part-time',
  'Short-term Assignment',
  'Skill-based Task',
];

export const CreateGigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [compensation, setCompensation] = useState('');
  const [compensationType, setCompensationType] = useState<'fixed' | 'hourly' | 'monthly'>('fixed');
  const [workType, setWorkType] = useState<'remote' | 'onsite' | 'hybrid'>('remote');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('1 month');
  const [openings, setOpenings] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [requiredAvailability, setRequiredAvailability] = useState('Flexible');

  useEffect(() => {
    if (isEditing && id) {
      fetchGigForEdit();
    }
  }, [id, isEditing]);

  const fetchGigForEdit = async () => {
    try {
      setLoading(true);
      const res = await gigApi.getGigById(id!);
      const g = res.data.gig;
      setTitle(g.title);
      setCategory(g.category);
      setDescription(g.description);
      setRequiredSkills(g.requiredSkills || []);
      setCompensation(g.compensation);
      setCompensationType(g.compensationType);
      setWorkType(g.workType);
      setLocation(g.location || '');
      setDuration(g.duration || '');
      setOpenings(g.openings || 1);
      if (g.deadline) {
        setDeadline(new Date(g.deadline).toISOString().split('T')[0]);
      }
      setRequiredAvailability(g.requiredAvailability || '');
    } catch (err: any) {
      setErrorMsg('Failed to load gig data for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || requiredSkills.includes(trimmed)) return;
    setRequiredSkills([...requiredSkills, trimmed]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (title.length < 3) {
      setErrorMsg('Gig title must be at least 3 characters.');
      return;
    }
    if (description.length < 20) {
      setErrorMsg('Please write a detailed description of at least 20 characters.');
      return;
    }
    if (requiredSkills.length === 0) {
      setErrorMsg('Please specify at least one required skill for matching.');
      return;
    }
    if (!compensation.trim()) {
      setErrorMsg('Please specify the compensation amount.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        category,
        description,
        requiredSkills,
        compensation,
        compensationType,
        workType,
        location: workType === 'remote' ? undefined : location,
        duration,
        openings: Number(openings),
        deadline: deadline || undefined,
        requiredAvailability,
      };

      if (isEditing && id) {
        await gigApi.updateGig(id, payload);
      } else {
        await gigApi.createGig(payload);
      }

      navigate('/business/gigs');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to save gig. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Loading gig information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/business/gigs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gigs</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isEditing ? 'Edit Gig Listing' : 'Publish a New Student Gig'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Specify role requirements, compensation, and schedule to match with suitable university students.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
            1. Role Title & Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gig Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend React Developer Intern"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Opportunity Type *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Role & Deliverables Description *
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Outline the responsibilities, expected project scope, weekly expectations, and what students will learn..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Required Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>2. Required Skills (Powering Match Engine) *</span>
          </div>

          {/* Current Skills Chips */}
          <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-xs"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-200 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {requiredSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic self-center">
                Add at least one required skill tag below.
              </span>
            )}
          </div>

          {/* Add custom skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkill);
                }
              }}
              placeholder="Add skill tag (press Enter)..."
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkill)}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl border border-indigo-200"
            >
              Add Skill
            </button>
          </div>

          {/* Suggested skills pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_SKILLS.filter((s) => !requiredSkills.includes(s)).slice(0, 10).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleAddSkill(skill)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Compensation & Work Logistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
            3. Compensation & Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Compensation Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="text"
                  required
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Basis *
              </label>
              <select
                value={compensationType}
                onChange={(e) => setCompensationType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="fixed">Fixed Price Project</option>
                <option value="monthly">Monthly Stipend</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Arrangement *
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="remote">Remote (Work from Anywhere)</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {workType !== 'remote' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Onsite Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Noida Sector 62"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Expected Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2 months"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Number of Openings
              </label>
              <input
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Schedule Availability
              </label>
              <input
                type="text"
                value={requiredAvailability}
                onChange={(e) => setRequiredAvailability(e.target.value)}
                placeholder="e.g. 10 hrs/week, flexible"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/business/gigs"
            className="px-5 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEditing ? 'Save Changes' : 'Publish Gig Now'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

