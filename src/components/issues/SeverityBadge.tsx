'use client';

export default function SeverityBadge({ severity }: { severity: string }) {
  let color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  const s = severity?.toUpperCase();

  switch (s) {
    case 'CRITICAL':
      color = 'bg-rose-100 text-rose-800 border-rose-300';
      break;
    case 'HIGH':
      color = 'bg-orange-100 text-orange-800 border-orange-300';
      break;
    case 'MEDIUM':
      color = 'bg-amber-100 text-amber-800 border-amber-300';
      break;
    case 'LOW':
      color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
      ⚡ {severity}
    </span>
  );
}
