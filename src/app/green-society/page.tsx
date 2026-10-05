'use client';

import { useState } from 'react';
import { AlertTriangle, TreePine, BarChart3, Leaf, ArrowRight, Shield } from 'lucide-react';
import ReportDeforestationForm from '@/components/green/ReportDeforestationForm';
import PlantTreesForm from '@/components/green/PlantTreesForm';
import GreenDashboard from '@/components/green/GreenDashboard';

type Tab = 'report' | 'plant' | 'dashboard';

const TABS: { id: Tab; label: string; icon: React.ReactNode; emoji: string }[] = [
  { id: 'report', label: 'Report Deforestation', icon: <AlertTriangle className="w-4 h-4" />, emoji: '🚨' },
  { id: 'plant', label: 'Plant Trees', icon: <TreePine className="w-4 h-4" />, emoji: '🌱' },
  { id: 'dashboard', label: 'Green Dashboard', icon: <BarChart3 className="w-4 h-4" />, emoji: '📊' },
];

export default function GreenSocietyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('report');

  return (
    <div className="space-y-8 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur text-xs font-semibold text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Clean & Green Technology — CivicAI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            Green Society{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-lime-300">
              Module
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            The complete green lifecycle: Detect deforestation, report with AI-powered analysis,
            enable authority action, organize tree plantations, track survival, and measure your
            green impact — all in one platform.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[
              'Detect',
              'Report',
              'AI Analysis',
              'Authority Action',
              'Plantation',
              'Survival',
              'Green Impact',
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold text-emerald-200 border border-white/10 backdrop-blur">
                  {step}
                </span>
                {i < 6 && <ArrowRight className="w-3 h-3 text-emerald-400/60" />}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('report')}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Deforestation
            </button>
            <button
              onClick={() => setActiveTab('plant')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-xl backdrop-blur flex items-center justify-center gap-2 transition"
            >
              <TreePine className="w-4 h-4" />
              Plant Trees
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-10 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Floating leaf decorations */}
        <div className="absolute right-8 top-8 sm:right-16 sm:top-12 opacity-20 pointer-events-none">
          <Leaf className="w-24 h-24 sm:w-32 sm:h-32 text-emerald-300 rotate-12" />
        </div>
        <div className="absolute right-32 bottom-12 opacity-10 pointer-events-none hidden sm:block">
          <Shield className="w-20 h-20 text-teal-300 -rotate-12" />
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-forest-600 to-teal-600 text-white shadow-md shadow-forest-500/20'
                : 'text-slate-600 hover:bg-forest-50 hover:text-forest-700'
            }`}
          >
            <span className="hidden sm:inline text-base">{tab.emoji}</span>
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
        {/* Tab Header */}
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            {TABS.find((t) => t.id === activeTab)?.emoji}{' '}
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'report' &&
              'Upload evidence, capture location, and let AI analyze deforestation activity.'}
            {activeTab === 'plant' &&
              'Suggest plantation locations, register tree planting drives, and track survival rates.'}
            {activeTab === 'dashboard' &&
              'View your green impact, track your Green Score, and monitor the complete lifecycle.'}
          </p>
        </div>

        {activeTab === 'report' && <ReportDeforestationForm />}
        {activeTab === 'plant' && <PlantTreesForm />}
        {activeTab === 'dashboard' && <GreenDashboard />}
      </div>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Every Tree Counts. Every Report Matters.
        </h2>
        <p className="text-xs sm:text-sm text-emerald-300 max-w-md mx-auto">
          Join the Green Society movement — protect existing forests and grow new ones. Your actions
          today shape a greener tomorrow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setActiveTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg transition"
          >
            🚨 Report Deforestation
          </button>
          <button
            onClick={() => {
              setActiveTab('plant');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-xl transition"
          >
            🌱 Start Planting
          </button>
        </div>
      </section>
    </div>
  );
}
