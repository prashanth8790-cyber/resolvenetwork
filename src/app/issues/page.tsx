'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import IssueMap from '@/components/maps/IssueMap';
import IssueCard from '@/components/issues/IssueCard';
import { Search, Filter, SlidersHorizontal, Map, Grid, RefreshCw } from 'lucide-react';

function ExploreIssuesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [issues, setIssues] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedSeverity, setSelectedSeverity] = useState(searchParams.get('severity') || '');
  const [selectedWard, setSelectedWard] = useState(searchParams.get('wardId') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'grid'>('both');

  // Fetch categories & wards options
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => json.success && setCategories(json.data.categories));
    fetch('/api/wards')
      .then((res) => res.json())
      .then((json) => json.success && setWards(json.data.wards));
  }, []);

  // Fetch issues
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedSeverity) params.append('severity', selectedSeverity);
      if (selectedWard) params.append('wardId', selectedWard);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/issues?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIssues(json.data.issues);
        }
      }
    } catch (err) {
      console.error('Fetch issues error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedCategory, selectedStatus, selectedSeverity, selectedWard, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedSeverity('');
    setSelectedWard('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Explore Civic Issues</h1>
          <p className="text-xs text-slate-500">
            Real-time interactive map and crowd-sourced directory of reported issues
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'both' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Both
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Map Only
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Grid Only
          </button>
        </div>
      </div>

      {/* Global Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, keyword, address, or issue ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="support">Most Supported (Upvotes)</option>
              <option value="priority">Highest Priority Score</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      {viewMode === 'map' && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500">Showing {issues.length} markers on map</div>
          <IssueMap issues={issues} height="650px" />
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500">Showing {issues.length} reported issues</div>
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading issues...</div>
          ) : issues.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              No issues match your current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} onSupportToggle={fetchIssues} />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'both' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column */}
          <div className="lg:col-span-6 sticky top-20">
            <div className="text-xs font-semibold text-slate-500 mb-2">Interactive Marker Map ({issues.length})</div>
            <IssueMap issues={issues} height="600px" />
          </div>

          {/* Cards List Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-semibold text-slate-500">Issue List</div>
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading issues...</div>
            ) : issues.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                No issues match your current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onSupportToggle={fetchIssues} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExploreIssuesPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading issues directory...</div>}>
      <ExploreIssuesContent />
    </Suspense>
  );
}
