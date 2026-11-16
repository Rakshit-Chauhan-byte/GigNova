import React from 'react';
import { Code, Briefcase, Calendar, MapPin, FileCheck } from 'lucide-react';
import { getScoreBand } from './SmartMatchScoreBadge';

interface Props {
  skillScore: number;
  experienceScore: number;
  availabilityScore: number;
  workModeScore: number;
  assessmentScore: number;
  compact?: boolean;
}

export const ScoreBreakdown: React.FC<Props> = ({
  skillScore,
  experienceScore,
  availabilityScore,
  workModeScore,
  assessmentScore,
  compact = false,
}) => {
  const factors = [
    {
      label: 'Skill Compatibility',
      weight: '40%',
      score: skillScore,
      icon: Code,
      description: 'Matches against required skills, aliases & related technologies',
    },
    {
      label: 'Project & Experience',
      weight: '20%',
      score: experienceScore,
      icon: Briefcase,
      description: 'Relevance of student projects, GitHub repo & portfolio work',
    },
    {
      label: 'Availability & Schedule',
      weight: '20%',
      score: availabilityScore,
      icon: Calendar,
      description: 'Weekly commitment & working hours alignment',
    },
    {
      label: 'Work Mode & Location',
      weight: '10%',
      score: workModeScore,
      icon: MapPin,
      description: 'Remote, hybrid, or on-site location compatibility',
    },
    {
      label: 'Application & Effort',
      weight: '10%',
      score: assessmentScore,
      icon: FileCheck,
      description: 'Cover note quality, profile completeness & enthusiasm',
    },
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        {factors.map((f) => {
          const { progressClass } = getScoreBand(f.score);
          const Icon = f.icon;
          return (
            <div key={f.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <Icon className="w-3 h-3 text-slate-400" />
                  {f.label} ({f.weight})
                </span>
                <span className="font-bold text-slate-900">{f.score}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressClass}`}
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {factors.map((f) => {
        const { progressClass } = getScoreBand(f.score);
        const Icon = f.icon;
        return (
          <div
            key={f.label}
            className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-white border border-slate-200 text-indigo-600">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{f.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {f.weight}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                {f.description}
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-500">Score</span>
                <span className="font-black text-slate-900">{f.score}/100</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressClass}`}
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
