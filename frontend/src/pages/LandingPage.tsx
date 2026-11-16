import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Search,
  Code2,
  Palette,
  FileSpreadsheet,
  Megaphone,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Project-Based Learning Marketplace • Sharda University</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Empowering Students with <span className="text-indigo-600">Real-World</span> Short-Term Gigs
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              GigNova bridges ambitious university students with vetted startups and businesses.
              Find internships, freelance assignments, and part-time projects with transparent matching.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/register?role=STUDENT"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition flex items-center justify-center gap-2 group"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Join as a Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/register?role=BUSINESS"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Hire Student Talent</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Verified Business Profiles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Deterministic Skill Match Algorithm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Zero Hidden Fees for Students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Explore Popular Categories
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Opportunities tailored to student schedules and skill levels
              </p>
            </div>
            <Link
              to="/gigs"
              className="mt-4 md:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/gigs?category=Internship"
              className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group bg-slate-50/50 hover:bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Software & Tech
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Web development, Python scripts, APIs, mobile apps & QA testing.
              </p>
            </Link>

            <Link
              to="/gigs?category=Freelance"
              className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group bg-slate-50/50 hover:bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                Design & Creative
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                UI/UX wireframes, Figma prototypes, branding & social graphics.
              </p>
            </Link>

            <Link
              to="/gigs?category=Part-time"
              className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group bg-slate-50/50 hover:bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Writing & Marketing
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Technical writing, SEO blog content, social media campaigns.
              </p>
            </Link>

            <Link
              to="/gigs?category=Freelance"
              className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group bg-slate-50/50 hover:bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Data & Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Spreadsheet automation, data cleanup, visualization dashboards.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works / Feature Highlights */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed Specifically for Students
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Unlike generic freelance platforms, GigNova focuses on verified safety, realistic student workloads, and academic growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Deterministic Match Score</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our algorithm scores gig compatibility based on 60% skills, 25% schedule availability, and 15% work-type preference. Transparent and unbiased.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admin-Vetted Employers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every business passes through administrative verification with tax ID and business registration checks, shielding students from scams.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Synchronized Lifecycle</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From application submission to review, acceptance, and completion tracking, both student and recruiter dashboards remain 100% in sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to jumpstart your career portfolio?
          </h2>
          <p className="text-indigo-100 text-sm mt-3 max-w-xl mx-auto">
            Create your student profile today, showcase your university projects, and apply to vetted opportunities in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition shadow-md"
            >
              Sign Up for Free
            </Link>
            <Link
              to="/gigs"
              className="px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm transition border border-indigo-500"
            >
              Browse Open Gigs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

