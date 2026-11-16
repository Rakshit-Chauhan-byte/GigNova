import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <span className="text-lg font-bold text-slate-900">GigNova</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              University Project-Based Learning platform connecting university students with verified short-term gigs, internships, and freelance projects.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PBL Implementation — Sharda University</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">For Students</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/gigs" className="hover:text-indigo-600">Browse Available Gigs</Link></li>
              <li><Link to="/student/dashboard" className="hover:text-indigo-600">Student Dashboard</Link></li>
              <li><Link to="/student/applications" className="hover:text-indigo-600">Track Applications</Link></li>
              <li><Link to="/student/profile" className="hover:text-indigo-600">Profile & Skills</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">For Businesses</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/business/gigs/new" className="hover:text-indigo-600">Post a Project</Link></li>
              <li><Link to="/business/dashboard" className="hover:text-indigo-600">Recruiter Dashboard</Link></li>
              <li><Link to="/business/verification" className="hover:text-indigo-600">Get Verified</Link></li>
              <li><Link to="/business/gigs" className="hover:text-indigo-600">Manage Postings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Demo Test Accounts</h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <p><strong>Admin:</strong> admin@gignova.com / Admin@123456</p>
              <p><strong>Student:</strong> student@gignova.com / Student@123</p>
              <p><strong>Business:</strong> business@gignova.com / Business@123</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} GigNova. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Academic Evaluation with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

