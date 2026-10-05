'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TreePine,
  Heart,
  Map,
  Zap,
  Clock,
  TrendingUp,
  Award,
  FileText,
  CheckCircle2,
  Leaf,
} from 'lucide-react';
import GreenScoreRing from './GreenScoreRing';
import LifecyclePipeline from './LifecyclePipeline';

interface DashboardStats {
  deforestationReports: number;
  treesPlanted: number;
  treesSurviving: number;
  greenZones: number;
  citizenActions: number;
  survivalRate: number;
}

interface ActivityItem {
  icon: React.ReactNode;
  text: string;
  time: string;
  type: 'report' | 'plant' | 'survive' | 'zone' | 'action';
}

function computeStats(): DashboardStats {
  const reports = JSON.parse(localStorage.getItem('greenReports') || '[]');
  const plantations = JSON.parse(localStorage.getItem('greenPlantations') || '[]');

  const treesPlanted = plantations.reduce((sum: number, p: any) => sum + (p.treesPlanted || 0), 0);
  const totalSurvivalRate =
    plantations.length > 0
      ? Math.round(
          plantations.reduce((sum: number, p: any) => sum + (p.survivalRate || 0), 0) /
            plantations.length
        )
      : 0;
  const treesSurviving = Math.round((totalSurvivalRate / 100) * treesPlanted);

  return {
    deforestationReports: reports.length || 5,
    treesPlanted: treesPlanted || 195,
    treesSurviving: treesSurviving || 168,
    greenZones: plantations.length || 3,
    citizenActions: (reports.length || 5) + (plantations.length || 3) + 14,
    survivalRate: totalSurvivalRate || 86,
  };
}

function computeGreenScore(stats: DashboardStats): number {
  // Weighted scoring: reports(100), trees planted(400), survival(300), zones(100), actions(100)
  const reportScore = Math.min(stats.deforestationReports * 20, 100);
  const plantScore = Math.min(stats.treesPlanted * 2, 400);
  const survivalScore = Math.round((stats.survivalRate / 100) * 300);
  const zoneScore = Math.min(stats.greenZones * 25, 100);
  const actionScore = Math.min(stats.citizenActions * 5, 100);
  return Math.min(reportScore + plantScore + survivalScore + zoneScore + actionScore, 1000);
}

function getRecentActivity(): ActivityItem[] {
  return [
    {
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      text: 'Deforestation reported at Highway NH-48 corridor',
      time: '2 hours ago',
      type: 'report',
    },
    {
      icon: <TreePine className="w-4 h-4 text-forest-600" />,
      text: '45 trees planted at Riverside Park Zone B',
      time: '1 day ago',
      type: 'plant',
    },
    {
      icon: <Heart className="w-4 h-4 text-pink-500" />,
      text: 'Survival check: 89% survival at Park Zone B',
      time: '3 days ago',
      type: 'survive',
    },
    {
      icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
      text: 'Authority confirmed reforestation at Sector 12',
      time: '5 days ago',
      type: 'action',
    },
    {
      icon: <Map className="w-4 h-4 text-teal-500" />,
      text: 'New green zone created: School Campus Belt',
      time: '1 week ago',
      type: 'zone',
    },
    {
      icon: <TreePine className="w-4 h-4 text-forest-600" />,
      text: '120 trees planted at Highway Divider Strip',
      time: '2 weeks ago',
      type: 'plant',
    },
    {
      icon: <Award className="w-4 h-4 text-amber-500" />,
      text: 'Green Score milestone: reached Sapling level!',
      time: '2 weeks ago',
      type: 'action',
    },
  ];
}

export default function GreenDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    deforestationReports: 0,
    treesPlanted: 0,
    treesSurviving: 0,
    greenZones: 0,
    citizenActions: 0,
    survivalRate: 0,
  });
  const [greenScore, setGreenScore] = useState(0);
  const [activity] = useState<ActivityItem[]>(getRecentActivity());

  useEffect(() => {
    const computed = computeStats();
    setStats(computed);
    setGreenScore(computeGreenScore(computed));
  }, []);

  const statCards = [
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Deforestation Reports',
      value: stats.deforestationReports,
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-700',
    },
    {
      icon: <TreePine className="w-5 h-5" />,
      label: 'Trees Planted',
      value: stats.treesPlanted,
      bg: 'bg-forest-50',
      iconBg: 'bg-forest-100',
      iconColor: 'text-forest-600',
      valueColor: 'text-forest-700',
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: 'Trees Surviving',
      value: `${stats.treesSurviving} (${stats.survivalRate}%)`,
      bg: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      valueColor: 'text-pink-700',
    },
    {
      icon: <Map className="w-5 h-5" />,
      label: 'Green Zones Created',
      value: stats.greenZones,
      bg: 'bg-teal-50',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      valueColor: 'text-teal-700',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Green Citizen Actions',
      value: stats.citizenActions,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
  ];

  const scoreBreakdown = [
    { label: 'Reports Filed', value: Math.min(stats.deforestationReports * 20, 100), max: 100, color: 'bg-red-400' },
    { label: 'Trees Planted', value: Math.min(stats.treesPlanted * 2, 400), max: 400, color: 'bg-forest-500' },
    { label: 'Survival Rate', value: Math.round((stats.survivalRate / 100) * 300), max: 300, color: 'bg-pink-400' },
    { label: 'Green Zones', value: Math.min(stats.greenZones * 25, 100), max: 100, color: 'bg-teal-400' },
    { label: 'Community', value: Math.min(stats.citizenActions * 5, 100), max: 100, color: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Impact Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`${card.bg} p-4 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all animate-fade-up group`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
            >
              {card.icon}
            </div>
            <div className={`text-xl font-black ${card.valueColor}`}>{card.value}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Green Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score ring */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🏆</span> Your Green Score
          </h3>
          <GreenScoreRing score={greenScore} size={180} />
        </div>

        {/* Score breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest-600" />
            Score Breakdown
          </h3>
          <div className="space-y-4">
            {scoreBreakdown.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-extrabold text-slate-900">
                    {item.value}/{item.max}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Total Score</span>
            <span className="text-lg font-black text-forest-700">{greenScore} / 1000</span>
          </div>
        </div>
      </div>

      {/* Lifecycle Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <LifecyclePipeline />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Clock className="w-5 h-5 text-forest-600" />
          Recent Green Activity
        </h3>
        <div className="space-y-1">
          {activity.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 font-medium">{item.text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
