'use client';

import { calculateIssuePriority } from '@/lib/services/priority';

export default function PriorityBadge({
  score,
  severity,
  supportCount,
  createdAt,
  status,
}: {
  score?: number;
  severity?: string;
  supportCount?: number;
  createdAt?: string | Date;
  status?: string;
}) {
  let finalScore = score ?? 0;
  let band: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  if (severity && createdAt && status) {
    const calc = calculateIssuePriority({
      severity,
      supportCount: supportCount || 0,
      createdAt,
      status,
    });
    finalScore = calc.score;
    band = calc.band;
  } else {
    if (finalScore >= 76) band = 'CRITICAL';
    else if (finalScore >= 51) band = 'HIGH';
    else if (finalScore >= 26) band = 'MEDIUM';
    else band = 'LOW';
  }

  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
  if (band === 'CRITICAL') badgeColor = 'bg-red-500 text-white border-red-600';
  else if (band === 'HIGH') badgeColor = 'bg-orange-500 text-white border-orange-600';
  else if (band === 'MEDIUM') badgeColor = 'bg-amber-500 text-white border-amber-600';
  else if (band === 'LOW') badgeColor = 'bg-emerald-600 text-white border-emerald-700';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border ${badgeColor}`}
      title={`Priority Score: ${finalScore}/100`}
    >
      <span>🎯 Priority {finalScore}</span>
      <span className="opacity-90 font-normal">({band})</span>
    </span>
  );
}
