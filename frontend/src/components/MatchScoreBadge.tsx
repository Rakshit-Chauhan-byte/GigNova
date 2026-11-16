import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchScoreBadge: React.FC<Props> = ({ score, size = 'md' }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  if (score >= 80) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  } else if (score >= 60) {
    colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-300';
  } else if (score >= 40) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-300';
  } else {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-300';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${colorClass} ${sizeClasses[size]}`}
      title={`Calculated compatibility: ${score}%`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>{score}% Match</span>
    </div>
  );
};

