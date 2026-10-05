import Link from 'next/link';
import { db } from '@/lib/db';
import { MapPin, CheckCircle2, ShieldAlert, ArrowRight, ThumbsUp, Users, Building2, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  // Fetch live stats from database
  let totalIssues = 0;
  let resolvedCount = 0;
  let inProgressCount = 0;
  let categories: any[] = [];

  try {
    totalIssues = await db.issue.count();
    resolvedCount = await db.issue.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } });
    inProgressCount = await db.issue.count({ where: { status: { in: ['ASSIGNED', 'IN_PROGRESS', 'VERIFIED'] } } });
    categories = await db.category.findMany({ take: 8, orderBy: { name: 'asc' } });
  } catch (err) {
    console.error('Home stats fetch error:', err);
  }

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur text-xs font-semibold text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Crowd-Sourced Civic Action Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            Report. Track. Resolve. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">
              Together.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Spot a pothole, broken streetlight, or garbage issue in your ward? Report it in seconds, track real-time resolution progress on the map, and hold local authorities accountable.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/issues/create"
              className="px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition"
            >
              <MapPin className="w-4 h-4" />
              Report Issue Now
            </Link>
            <Link
              href="/issues"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-xl backdrop-blur flex items-center justify-center gap-2 transition"
            >
              Explore Map & Issues
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative Graphic Background Elements */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Live Database Stats Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalIssues}</div>
            <div className="text-xs text-slate-500 font-medium">Total Issues Reported</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{inProgressCount}</div>
            <div className="text-xs text-slate-500 font-medium">Active & In Progress</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{resolvedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Resolved & Verified</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {totalIssues > 0 ? `${Math.round((resolvedCount / totalIssues) * 100)}%` : '100%'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Resolution Rate</div>
          </div>
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How CivicConnect Works</h2>
          <p className="text-xs text-slate-500">Transparent 3-step lifecycle connecting citizens directly with municipal action.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative group hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Spot & Pin Location</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drop a pin on the interactive OpenStreetMap, select category and severity, add a photo, and submit in seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative group hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Upvote & Authority Action</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Neighbors upvote open issues to boost priority scores. Municipal department officers verify and fix the issue.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative group hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Before/After Citizen Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authority uploads before & after proof photos. The reporting citizen verifies resolution or reopens if unsatisfied.
            </p>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Browse by Category</h2>
            <p className="text-xs text-slate-500">Report civic issues across 10 municipal categories</p>
          </div>
          <Link href="/issues" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/issues?categoryId=${cat.id}`}
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs mb-0.5">{cat.name}</h4>
              <p className="text-[10px] text-slate-500 truncate">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Fix Your Neighborhood?</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Start reporting infrastructure problems in your ward today. It takes less than a minute!
        </p>
        <div className="pt-2">
          <Link
            href="/issues/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
          >
            <MapPin className="w-4 h-4" /> Report Issue Now
          </Link>
        </div>
      </section>
    </div>
  );
}
