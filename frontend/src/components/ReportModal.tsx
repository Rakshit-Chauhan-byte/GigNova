import React, { useState } from 'react';
import { Flag, X, AlertTriangle, Loader2 } from 'lucide-react';
import { reportApi } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportedGigId?: string;
  reportedGigTitle?: string;
  reportedUserId?: string;
  reportedUserName?: string;
}

const REPORT_REASONS = [
  'Fraudulent or misleading listing',
  'Unpaid work or wage dispute',
  'Suspicious / Scam behavior',
  'Inappropriate content or harassment',
  'Identity misrepresentation',
  'Other policy violation',
];

export const ReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  reportedGigId,
  reportedGigTitle,
  reportedUserId,
  reportedUserName,
}) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await reportApi.submit({
        reportedGigId,
        reportedUserId,
        reason,
        description: description.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-semibold">
            <Flag className="w-5 h-5" />
            <span>Report Content or User</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <h4 className="text-lg font-bold text-slate-800">Report Received</h4>
            <p className="text-sm text-slate-600 mt-1">
              Thank you for keeping GigNova safe. Our moderation team will investigate promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {reportedGigTitle && (
                <p>
                  Reporting Gig: <strong className="text-slate-800">{reportedGigTitle}</strong>
                </p>
              )}
              {reportedUserName && (
                <p>
                  Reporting User: <strong className="text-slate-800">{reportedUserName}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Please describe what violates GigNova guidelines..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

