'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import IssueCard from '@/components/issues/IssueCard';
import Link from 'next/link';
import { Layers, Clock, ShieldAlert, CheckCircle2, PlusCircle, User } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyIssues = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/issues?reporterId=${user.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIssues(json.data.issues);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, [user]);

  const total = issues.length;
  const pending = issues.filter((i) => ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED'].includes(i.status)).length;
  const inProgress = issues.filter((i) => ['ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(i.status)).length;
  const resolved = issues.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length;

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-md shadow-blue-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Citizen Dashboard</h1>
            <p className="text-xs text-slate-500">Welcome back, {user?.name || 'Citizen'}! Track your reported issues.</p>
          </div>
        </div>

        <Link
          href="/issues/create"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Report New Issue
        </Link>
      </div>

      {/* Summary Counts Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{total}</div>
            <div className="text-xs text-slate-500">Total Reported</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{pending}</div>
            <div className="text-xs text-slate-500">Pending Review</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{inProgress}</div>
            <div className="text-xs text-slate-500">In Progress</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{resolved}</div>
            <div className="text-xs text-slate-500">Resolved</div>
          </div>
        </div>
      </div>

      {/* Reported Issues Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Your Reported Issues ({total})</h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading your issues...</div>
        ) : issues.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-xs text-slate-500">You haven't reported any civic issues yet.</p>
            <Link
              href="/issues/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" /> Submit Your First Issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onSupportToggle={fetchMyIssues} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
