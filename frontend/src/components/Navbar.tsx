import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Briefcase,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Compass,
  FileText,
  ShieldCheck,
  PlusCircle,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isStudent, isBusiness, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                GigNova
              </span>
              <span className="text-[10px] -mt-1 font-medium text-slate-400 uppercase tracking-wider">
                Student Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/gigs"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/gigs')
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Gigs</span>
            </Link>

            {isAuthenticated && isStudent && (
              <>
                <Link
                  to="/student/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/student/dashboard')
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/student/applications"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/student/applications')
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Applications</span>
                </Link>
              </>
            )}

            {isAuthenticated && isBusiness && (
              <>
                <Link
                  to="/business/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/business/dashboard')
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/business/gigs"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/business/gigs')
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Manage Gigs</span>
                </Link>
                <Link
                  to="/business/gigs/new"
                  className="px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 font-semibold text-xs border border-indigo-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Gig</span>
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* User Section / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                    {user.studentProfile?.fullName?.[0]?.toUpperCase() ||
                      user.businessProfile?.businessName?.[0]?.toUpperCase() ||
                      user.email[0]?.toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {user.studentProfile?.fullName ||
                        user.businessProfile?.businessName ||
                        user.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1">
                        {isBusiness && user.businessProfile && (
                          <VerificationBadge
                            status={user.businessProfile.verificationStatus}
                          />
                        )}
                        {isStudent && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">
                            Student Account
                          </span>
                        )}
                        {isAdmin && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                            Administrator
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      {isStudent && (
                        <Link
                          to="/student/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Student Profile</span>
                        </Link>
                      )}
                      {isBusiness && (
                        <>
                          <Link
                            to="/business/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span>Business Profile</span>
                          </Link>
                          <Link
                            to="/business/verification"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            <span>Get Verified</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile burger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/gigs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore Gigs
          </Link>

          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/student/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Profile Settings
                  </Link>
                </>
              )}

              {isBusiness && (
                <>
                  <Link
                    to="/business/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/business/gigs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Gigs
                  </Link>
                  <Link
                    to="/business/gigs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 font-semibold"
                  >
                    + Post a New Gig
                  </Link>
                  <Link
                    to="/business/verification"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Business Verification
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-amber-700 bg-amber-50"
                >
                  Admin Console
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 space-y-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

