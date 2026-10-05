'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import StatusBadge from '@/components/issues/StatusBadge';
import SeverityBadge from '@/components/issues/SeverityBadge';
import PriorityBadge from '@/components/issues/PriorityBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Wrench, ShieldAlert, CheckCircle2, Clock, Search, ExternalLink, AlertTriangle } from 'lucide-react';

const COLORS = ['#2563eb', '#9333ea', '#6366f1', '#f59e0b', '#06b6d4', '#10b981', '#14b8a6', '#f43f5e', '#f97316'];

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anRes, isRes] = await Promise.all([fetch('/api/analytics'), fetch('/api/issues?sortBy=priority')]);

      if (anRes.ok) {
        const json = await anRes.json();
        if (json.success) setAnalytics(json.data);
      }

      if (isRes.ok) {
        const json = await isRes.json();
        if (json.success) setIssues(json.data.issues);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.address.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overview = analytics?.overview || {};

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center text-xl shadow-md shadow-purple-500/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Authority Operational Dashboard</h1>
            <p className="text-xs text-slate-500">
              Department Officer Operations ({user?.department || 'General Public Works'})
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition self-start sm:self-auto"
        >
          Refresh Live Data
        </button>
      </div>

      {/* Counts Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Submitted</span>
          <span className="text-xl font-extrabold text-blue-600">{overview.submitted || 0}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Under Review</span>
          <span className="text-xl font-extrabold text-purple-600">{overview.underReview || 0}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Verified</span>
          <span className="text-xl font-extrabold text-indigo-600">{overview.verified || 0}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned</span>
          <span className="text-xl font-extrabold text-amber-600">{overview.assigned || 0}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">In Progress</span>
          <span className="text-xl font-extrabold text-sky-600">{overview.inProgress || 0}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Resolved</span>
          <span className="text-xl font-extrabold text-emerald-600">{overview.resolved || 0}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm bg-rose-50/50 border-rose-200">
          <span className="text-[10px] font-bold text-rose-500 uppercase block">Critical</span>
          <span className="text-xl font-extrabold text-rose-600">{overview.criticalCount || 0}</span>
        </div>
      </div>

      {/* 2 Recharts Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Issues by Category */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Issues Breakdown by Category</h3>
          <div className="h-64 w-full">
            {analytics?.categoryChart && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Issues by Status */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Issues Lifecycle Status Distribution</h3>
          <div className="h-64 w-full">
            {analytics?.statusChart && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusChart}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {analytics.statusChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Operational Issue Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 text-base">Issue Worklist Management</h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter worklist..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3">Issue Title & Ward</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Supports</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No issues found in worklist.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 max-w-xs">
                      <Link href={`/issues/${issue.id}`} className="font-bold text-slate-900 hover:text-blue-600 block truncate">
                        {issue.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 truncate block">{issue.address}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{issue.category?.name}</td>
                    <td className="p-3">
                      <SeverityBadge severity={issue.severity} />
                    </td>
                    <td className="p-3">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="p-3">
                      <PriorityBadge
                        score={issue.priorityScore}
                        severity={issue.severity}
                        supportCount={issue._count?.supports || 0}
                        createdAt={issue.createdAt}
                        status={issue.status}
                      />
                    </td>
                    <td className="p-3 font-semibold text-slate-700">👍 {issue._count?.supports || 0}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold transition"
                      >
                        Manage <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
