import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { businessApi } from '../../api/client';
import { BusinessProfile } from '../../types';
import { VerificationBadge } from '../../components/VerificationBadge';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Save,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const BusinessVerification: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form
  const [taxId, setTaxId] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await businessApi.getProfile();
      setProfile(res.data.profile);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile verification state.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await businessApi.submitVerification({
        taxId: taxId.trim() || undefined,
        registrationNo: registrationNo.trim() || undefined,
        additionalInfo: additionalInfo.trim() || undefined,
      });

      setSuccessMsg('Verification request submitted successfully! An administrator will review it shortly.');
      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit verification request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Checking verification status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/business/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Business Verification Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit regulatory documentation to gain the official GigNova Verified Provider badge.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Current status display card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Current Verification Status
          </span>
          {profile && <VerificationBadge status={profile.verificationStatus} />}
        </div>

        {profile?.verificationStatus === 'VERIFIED' && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-1">
            <p className="font-bold">🎉 Your business is officially verified!</p>
            <p>
              Your listings feature the verified shield badge, boosting student trust and application volume.
            </p>
          </div>
        )}

        {profile?.verificationStatus === 'PENDING' && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold">⏳ Verification Request Pending Review</p>
            <p>
              Our administration team is reviewing the documents you provided. You will receive an update once reviewed.
            </p>
          </div>
        )}

        {profile?.verificationStatus === 'REJECTED' && (
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs space-y-1">
            <p className="font-bold">✕ Verification Request Was Rejected</p>
            {profile.verificationNote && (
              <p>
                <strong>Admin Feedback:</strong> {profile.verificationNote}
              </p>
            )}
            <p className="pt-1 text-[11px] text-rose-700">
              You can address the comments above and resubmit your documents below.
            </p>
          </div>
        )}

        {profile?.verificationStatus === 'UNVERIFIED' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs space-y-1">
            <p className="font-bold">Unverified Employer</p>
            <p>
              Submit your GSTIN/PAN or business registration number below to request verified badge status from administrators.
            </p>
          </div>
        )}
      </div>

      {/* Verification submission form if not currently verified */}
      {profile?.verificationStatus !== 'VERIFIED' && profile?.verificationStatus !== 'PENDING' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Submit Verification Credentials</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tax ID / GSTIN / PAN Number *
            </label>
            <input
              type="text"
              required
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. 07AAAAA0000A1Z5"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company Registration / CIN Number (Optional)
            </label>
            <input
              type="text"
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              placeholder="e.g. U72900UP2020PTC123456"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Additional Information / Official Document Links
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
              placeholder="Provide official registration links, MCA portal reference, or verification notes for the admin team..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Submit for Verification</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

