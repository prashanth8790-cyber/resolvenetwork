'use client';

import Link from 'next/link';
import Image from 'next/image';
import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';
import PriorityBadge from './PriorityBadge';
import { MapPin, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface IssueCardProps {
  issue: any;
  onSupportToggle?: (issueId: string) => void;
}

export default function IssueCard({ issue, onSupportToggle }: IssueCardProps) {
  const { user } = useAuth();
  const [supportCount, setSupportCount] = useState(issue._count?.supports ?? issue.supportCount ?? 0);
  const [hasSupported, setHasSupported] = useState(issue.hasSupported ?? false);
  const [loading, setLoading] = useState(false);

  const mainImage =
    issue.images && issue.images.length > 0
      ? issue.images[0].url
      : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';

  const handleSupport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/support`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSupportCount(json.data.supportCount);
          setHasSupported(json.data.hasSupported);
          if (onSupportToggle) onSupportToggle(issue.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col group">
      {/* Thumbnail Header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Image
          src={mainImage}
          alt={issue.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <StatusBadge status={issue.status} />
          <SeverityBadge severity={issue.severity} />
        </div>

        <div className="absolute bottom-3 right-3 z-10">
          <PriorityBadge
            score={issue.priorityScore}
            severity={issue.severity}
            supportCount={supportCount}
            createdAt={issue.createdAt}
            status={issue.status}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <span>{issue.category?.name}</span>
            <span>•</span>
            <span className="text-slate-500">{issue.ward?.name}</span>
          </div>

          <Link href={`/issues/${issue.id}`} className="block group-hover:text-blue-600 transition">
            <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2 leading-snug">
              {issue.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Location & Meta Footer */}
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-4 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{issue.address}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <button
                onClick={handleSupport}
                disabled={loading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  hasSupported
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={hasSupported ? 'Click to remove upvote' : 'Click to upvote'}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{supportCount}</span>
              </button>

              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                {issue._count?.comments ?? issue.comments?.length ?? 0}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-300" />
              {new Date(issue.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
