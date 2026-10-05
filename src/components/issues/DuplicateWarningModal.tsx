'use client';

import { AlertTriangle, ThumbsUp, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';

interface DuplicateModalProps {
  isOpen: boolean;
  duplicates: any[];
  onClose: () => void;
  onProceedAnyway: () => void;
  onUpvoteExisting: (issueId: string) => void;
}

export default function DuplicateWarningModal({
  isOpen,
  duplicates,
  onClose,
  onProceedAnyway,
  onUpvoteExisting,
}: DuplicateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Similar Issue Reported Nearby</h3>
              <p className="text-xs text-slate-500">
                We found existing open issues within ~200 meters in the same category. Upvoting helps prioritize action!
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 my-4 max-h-60 overflow-y-auto pr-1">
          {duplicates.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={item.status} />
                  <span className="text-xs font-semibold text-slate-500">{item.ward?.name}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-600 truncate">{item.address}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onUpvoteExisting(item.id)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Upvote ({item._count?.supports || 0})
                </button>
                <Link
                  href={`/issues/${item.id}`}
                  target="_blank"
                  className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-medium flex items-center gap-1 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onProceedAnyway}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Report New Issue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
