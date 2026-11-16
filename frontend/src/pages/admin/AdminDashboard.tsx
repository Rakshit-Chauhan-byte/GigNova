import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import { User, VerificationRequest, Gig, Report } from '../../types';
import { VerificationBadge } from '../../components/VerificationBadge';
import {
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Trash2,
  Search,
  Flag,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'gigs' | 'reports'>('overview');

  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalBusinesses: 0,
    totalGigs: 0,
    totalApplications: 0,
    pendingVerifications: 0,
    pendingReports: 0,
  });

  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Review modal state
  const [reviewModal, setReviewModal] = useState<{
    id: string;
    type: 'verification' | 'report';
    action: string;
    targetTitle: string;
  } | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Search & filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [overRes, verRes, usersRes, gigsRes, reportsRes] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getVerifications(),
        adminApi.getUsers(),
        adminApi.getAllGigs(),
        adminApi.getReports(),
      ]);

      setOverview(overRes.data);
      setVerifications(verRes.data.requests);
      setUsers(usersRes.data.users);
      setGigs(gigsRes.data.gigs);
      setReports(reportsRes.data.reports);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to load administrative data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewVerification = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(requestId);
    try {
      await adminApi.reviewVerification(requestId, { action, adminNote: adminNote.trim() || undefined });
      setFeedbackMsg({ type: 'success', text: `Business verification ${action.toLowerCase()}.` });
      setReviewModal(null);
      setAdminNote('');
      await fetchInitialData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.error || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleSuspendUser = async (userId: string, currentSuspended: boolean) => {
    setActionLoading(userId);
    try {
      await adminApi.suspendUser(userId, !currentSuspended);
      setFeedbackMsg({
        type: 'success',
        text: currentSuspended ? 'User reactivated successfully.' : 'User suspended.',
      });
      await fetchInitialData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.error || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateGig = async (gigId: string, action: 'suspend' | 'restore' | 'delete') => {
    setActionLoading(gigId);
    try {
      await adminApi.moderateGig(gigId, action);
      setFeedbackMsg({ type: 'success', text: `Gig ${action}ed.` });
      await fetchInitialData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.error || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewReport = async (reportId: string, action: 'REVIEWED' | 'RESOLVED' | 'DISMISSED') => {
    setActionLoading(reportId);
    try {
      await adminApi.reviewReport(reportId, { action, adminNote: adminNote.trim() || undefined });
      setFeedbackMsg({ type: 'success', text: `Report marked as ${action.toLowerCase()}.` });
      setReviewModal(null);
      setAdminNote('');
      await fetchInitialData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.error || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500 font-medium">Loading administrative console...</p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const name = u.studentProfile?.fullName?.toLowerCase() || u.businessProfile?.businessName?.toLowerCase() || '';
      return u.email.toLowerCase().includes(q) || name.includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Administration Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            GigNova Platform Governance
          </h1>
        </div>

        <button
          onClick={fetchInitialData}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 self-start sm:self-center shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'overview', label: 'Platform Overview', count: null },
          { key: 'verifications', label: 'Business Verifications', count: overview.pendingVerifications },
          { key: 'users', label: 'User Directory', count: users.length },
          { key: 'gigs', label: 'Gig Moderation', count: gigs.length },
          { key: 'reports', label: 'Safety Reports', count: overview.pendingReports },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.key ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Students</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{overview.totalStudents}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Businesses</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{overview.totalBusinesses}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Total Gigs</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{overview.totalGigs}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Applications</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{overview.totalApplications}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
              <p className="text-xs font-medium text-amber-700">Pending Verification</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{overview.pendingVerifications}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs">
              <p className="text-xs font-medium text-rose-700">Active Reports</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{overview.pendingReports}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Pending Verifications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Verification Requests Awaiting Decision ({overview.pendingVerifications})
                </h3>
                <button
                  onClick={() => setActiveTab('verifications')}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              {verifications.filter((v) => v.status === 'PENDING').length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  All business verification requests have been processed.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {verifications
                    .filter((v) => v.status === 'PENDING')
                    .slice(0, 3)
                    .map((v) => (
                      <div key={v.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {v.business?.businessName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Tax ID: {v.taxId || 'N/A'} • {v.business?.location || 'Remote'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReviewVerification(v.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setReviewModal({
                                id: v.id,
                                type: 'verification',
                                action: 'REJECTED',
                                targetTitle: v.business?.businessName,
                              })
                            }
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold rounded-lg border border-rose-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Active Reports */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Safety Reports ({overview.pendingReports})
                </h3>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              {reports.filter((r) => r.status === 'PENDING').length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No pending user or gig safety reports.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {reports
                    .filter((r) => r.status === 'PENDING')
                    .slice(0, 3)
                    .map((r) => (
                      <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-rose-700">{r.reason}</p>
                          <p className="text-[11px] text-slate-500">
                            Target: {r.reportedGig?.title || r.reportedUser?.email || 'User/Gig'}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('reports')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Verifications */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Business Verification Requests ({verifications.length})
          </div>

          {verifications.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No verification requests found.</p>
          ) : (
            verifications.map((v) => (
              <div key={v.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{v.business?.businessName}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        v.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : v.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Email:</strong> {v.business?.user?.email} • <strong>Location:</strong>{' '}
                    {v.business?.location || 'Not provided'}
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>Tax ID:</strong> {v.taxId || 'N/A'} • <strong>Reg No:</strong>{' '}
                    {v.registrationNo || 'N/A'}
                  </p>
                  {v.additionalInfo && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Notes:</strong> {v.additionalInfo}
                    </p>
                  )}
                  {v.adminNote && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg">
                      <strong>Admin Note:</strong> {v.adminNote}
                    </p>
                  )}
                </div>

                {v.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReviewVerification(v.id, 'APPROVED')}
                      disabled={actionLoading === v.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Approve Verification
                    </button>
                    <button
                      onClick={() =>
                        setReviewModal({
                          id: v.id,
                          type: 'verification',
                          action: 'REJECTED',
                          targetTitle: v.business?.businessName,
                        })
                      }
                      disabled={actionLoading === v.id}
                      className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition"
                    >
                      Reject with Reason
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="BUSINESS">Businesses</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {u.studentProfile?.fullName || u.businessProfile?.businessName || u.email}
                      </p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.isSuspended ? (
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] border border-rose-200">
                          Suspended
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleSuspendUser(u.id, u.isSuspended)}
                          disabled={actionLoading === u.id}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Gigs */}
      {activeTab === 'gigs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Platform Gigs ({gigs.length})
          </div>

          {gigs.map((g) => (
            <div key={g.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {g.category}
                  </span>
                  <span className="text-xs text-slate-500">• {g.business?.businessName}</span>
                  {g.isSuspended && (
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                      Suspended
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{g.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{g.description}</p>
                <p className="text-[11px] text-slate-400">
                  ₹{g.compensation}/{g.compensationType} • {(g as any)._count?.applications || 0} applicants
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {g.isSuspended ? (
                  <button
                    onClick={() => handleModerateGig(g.id, 'restore')}
                    disabled={actionLoading === g.id}
                    className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl border border-emerald-200"
                  >
                    Restore Listing
                  </button>
                ) : (
                  <button
                    onClick={() => handleModerateGig(g.id, 'suspend')}
                    disabled={actionLoading === g.id}
                    className="px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200"
                  >
                    Suspend Listing
                  </button>
                )}

                <button
                  onClick={() => handleModerateGig(g.id, 'delete')}
                  disabled={actionLoading === g.id}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                  title="Permanently remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Safety & Moderation Reports ({reports.length})
          </div>

          {reports.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No safety reports submitted.</p>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" />
                      {r.reason}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.status === 'DISMISSED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    <strong>Reported Subject:</strong>{' '}
                    {r.reportedGig?.title
                      ? `Gig: "${r.reportedGig.title}"`
                      : r.reportedUser?.email
                      ? `User: ${r.reportedUser.email}`
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Reporter:</strong> {r.reporter?.email} •{' '}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  {r.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Details:</strong> {r.description}
                    </p>
                  )}
                  {r.adminNote && (
                    <p className="text-xs text-indigo-900 bg-indigo-50 p-2 rounded-lg">
                      <strong>Moderation Decision Note:</strong> {r.adminNote}
                    </p>
                  )}
                </div>

                {r.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReviewReport(r.id, 'RESOLVED')}
                      disabled={actionLoading === r.id}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Resolve & Action
                    </button>
                    <button
                      onClick={() => handleReviewReport(r.id, 'DISMISSED')}
                      disabled={actionLoading === r.id}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Modal with Note */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Provide Rejection Reason for {reviewModal.targetTitle}
            </h3>
            <p className="text-xs text-slate-600">
              This feedback will be presented to the business so they can rectify their submission.
            </p>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="e.g. Tax ID number does not match MCA database records. Please re-upload valid document."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewVerification(reviewModal.id, 'REJECTED')}
                disabled={actionLoading === reviewModal.id}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

