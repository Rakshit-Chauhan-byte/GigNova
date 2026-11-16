import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react';

interface Props {
  status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  showLabel?: boolean;
}

export const VerificationBadge: React.FC<Props> = ({ status, showLabel = true }) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <span
          title="Verified Business"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {showLabel && <span>Verified Business</span>}
        </span>
      );
    case 'PENDING':
      return (
        <span
          title="Verification Pending Review"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          {showLabel && <span>Pending Verification</span>}
        </span>
      );
    case 'REJECTED':
      return (
        <span
          title="Verification Rejected"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          {showLabel && <span>Rejected</span>}
        </span>
      );
    default:
      return (
        <span
          title="Unverified Provider"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          {showLabel && <span>Unverified</span>}
        </span>
      );
  }
};

