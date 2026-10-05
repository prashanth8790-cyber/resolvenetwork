'use client';

import StatusBadge from './StatusBadge';
import { Clock, User } from 'lucide-react';

interface TimelineProps {
  history: any[];
}

export default function StatusTimeline({ history }: TimelineProps) {
  if (!history || history.length === 0) {
    return <p className="text-xs text-slate-500 italic">No status history recorded yet.</p>;
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 py-1">
      {history.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Dot */}
          <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.toStatus} />
                {item.fromStatus && item.fromStatus !== item.toStatus && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    (from {item.fromStatus.replace('_', ' ')})
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>

            {item.note && (
              <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100 mt-2 leading-relaxed">
                "{item.note}"
              </p>
            )}

            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>
                Updated by <strong className="text-slate-700 font-medium">{item.actor?.name || 'System'}</strong>{' '}
                {item.actor?.role && (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-semibold uppercase">
                    {item.actor.role}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
