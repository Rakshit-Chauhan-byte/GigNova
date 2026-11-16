import React from 'react';
import { Sparkles } from 'lucide-react';
import { SmartMatchScoreBand } from '../types';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export function getScoreBand(score: number): {
  band: SmartMatchScoreBand;
  label: string;
  badgeClass: string;
  progressClass: string;
} {
  if (score >= 90) {
    return {
      band: 'excellent',
      label: 'Excellent Match',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progressClass: 'bg-emerald-500',
    };
  }
  if (score >= 80) {
    return {
      band: 'strong',
      label: 'Strong Match',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      progressClass: 'bg-indigo-600',
    };
  }
  if (score >= 65) {
    return {
      band: 'moderate',
      label: 'Moderate Match',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      progressClass: 'bg-amber-500',
    };
  }
  return {
    band: 'low',
    label: 'Low Match',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    progressClass: 'bg-slate-400',
  };
}

export const SmartMatchScoreBadge: React.FC<Props> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const { label, badgeClass } = getScoreBand(score);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
    xl: 'text-base font-black px-4 py-2 gap-2.5',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border shadow-2xs font-sans ${badgeClass} ${sizeClasses[size]}`}
      title={`GigNova SmartMatch Score: ${score}/100 (${label})`}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : size === 'xl' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
      <span className="font-bold">{score}%</span>
      {showLabel && <span className="opacity-80 font-normal">({label})</span>}
    </div>
  );
};
