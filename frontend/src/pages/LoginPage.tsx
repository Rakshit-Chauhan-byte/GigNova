import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/client';
import { Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      login(res.data.token, res.data.user);

      if (from) {
        navigate(from, { replace: true });
      } else if (res.data.user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (res.data.user.role === 'BUSINESS') {
        navigate('/business/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to sign in. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-indigo-600 text-white font-extrabold text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          G
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back to GigNova
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 sm:rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign In</span>
            </button>
          </form>

          {/* Quick PBL Demo Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>PBL Evaluation — 1-Click Demo Fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student@gignova.com', 'Student@123')}
                className="px-2 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition text-center"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillDemo('business@gignova.com', 'Business@123')}
                className="px-2 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition text-center"
              >
                Business
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@gignova.com', 'Admin@123456')}
                className="px-2 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition text-center"
              >
                Admin
              </button>
            </div>

            {/* SmartMatch Evaluation Demo accounts */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                SmartMatch™ Evaluation Demos:
              </span>
              <button
                type="button"
                onClick={() => fillDemo('demo-biz-technova@demo.gignova.com', 'Demo@12345')}
                className="w-full mb-2 px-3 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                title="TechNova Solutions (Target Demonstration Gig: 100 Applicants)"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>TechNova Solutions (100 Applicants Demo)</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('demo-biz-cloud@demo.gignova.com', 'Demo@12345')}
                  className="px-2 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition text-center"
                  title="CloudScale Tech (3 Gigs, 16 Applicants)"
                >
                  CloudScale (3 Gigs)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('demo-biz-design@demo.gignova.com', 'Demo@12345')}
                  className="px-2 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 transition text-center"
                  title="PixelCraft Studio (2 Gigs, 11 Applicants)"
                >
                  PixelCraft (2 Gigs)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

