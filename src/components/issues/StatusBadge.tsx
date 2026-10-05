'use client';

export default function StatusBadge({ status }: { status: string }) {
  let color = 'bg-slate-100 text-slate-800 border-slate-200';
  const s = status?.toUpperCase();

  switch (s) {
    case 'SUBMITTED':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'UNDER_REVIEW':
      color = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'VERIFIED':
      color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'ASSIGNED':
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'IN_PROGRESS':
      color = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'RESOLVED':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'CLOSED':
      color = 'bg-teal-50 text-teal-800 border-teal-200';
      break;
    case 'REJECTED':
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'REOPENED':
      color = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}
