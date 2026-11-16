import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GigDiscovery } from './pages/student/GigDiscovery';
import { GigDetails } from './pages/student/GigDetails';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentApplications } from './pages/student/StudentApplications';

// Business pages
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { BusinessProfile } from './pages/business/BusinessProfile';
import { BusinessGigs } from './pages/business/BusinessGigs';
import { CreateGigPage } from './pages/business/CreateGigPage';
import { GigApplicantsPage } from './pages/business/GigApplicantsPage';
import { SmartMatchPage } from './pages/business/SmartMatchPage';
import { ApplicantReportPage } from './pages/business/ApplicantReportPage';
import { BusinessVerification } from './pages/business/BusinessVerification';

// Admin page
import { AdminDashboard } from './pages/admin/AdminDashboard';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/gigs" element={<GigDiscovery />} />
              <Route path="/gigs/:id" element={<GigDetails />} />

              {/* Student Protected Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentApplications />
                  </ProtectedRoute>
                }
              />

              {/* Business Protected Routes */}
              <Route
                path="/business/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <BusinessDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/profile"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <BusinessProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/gigs"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <BusinessGigs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/gigs/new"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <CreateGigPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/gigs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <CreateGigPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/gigs/:id/applicants"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <GigApplicantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/gigs/:id/smartmatch"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <SmartMatchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/gigs/:id/smartmatch/:applicationId"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <ApplicantReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/verification"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <BusinessVerification />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;

