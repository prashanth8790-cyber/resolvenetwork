'use client';

import {
  Search,
  AlertTriangle,
  FileText,
  Brain,
  Shield,
  TreePine,
  HeartPulse,
  TrendingUp,
} from 'lucide-react';

interface PipelineStep {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
}

interface LifecyclePipelineProps {
  steps?: PipelineStep[];
}

const DEFAULT_STEPS: PipelineStep[] = [
  { icon: <Search className="w-5 h-5" />, label: 'Detect', count: 42, active: true },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Report', count: 38, active: true },
  { icon: <Brain className="w-5 h-5" />, label: 'AI Analysis', count: 38, active: true },
  { icon: <Shield className="w-5 h-5" />, label: 'Authority Action', count: 29, active: true },
  { icon: <TreePine className="w-5 h-5" />, label: 'Plantation', count: 156, active: true },
  { icon: <HeartPulse className="w-5 h-5" />, label: 'Survival', count: 134, active: true },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Green Impact', count: 12, active: true },
];

export default function LifecyclePipeline({ steps = DEFAULT_STEPS }: LifecyclePipelineProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span className="text-xl">♻️</span> Complete Green Lifecycle
      </h3>

      {/* Desktop horizontal layout */}
      <div className="hidden md:flex items-center justify-between gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1">
            {/* Step node */}
            <div className="flex flex-col items-center gap-2 flex-1 group">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step.active
                    ? 'bg-forest-500 text-white shadow-lg shadow-forest-500/30 animate-green-pulse'
                    : 'bg-slate-100 text-slate-400'
                } group-hover:scale-110`}
              >
                {step.icon}
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">
                {step.label}
              </span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  step.active
                    ? 'bg-forest-50 text-forest-700'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                {step.count}
              </span>
            </div>

            {/* Connector arrow */}
            {i < steps.length - 1 && (
              <div className="flex-shrink-0 w-8 flex items-center justify-center -mt-8">
                <div className="w-full h-0.5 bg-gradient-to-r from-forest-400 to-forest-300 relative">
                  <div className="absolute -right-1 -top-1 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-forest-400" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile vertical layout */}
      <div className="md:hidden space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-4">
            {/* Vertical line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  step.active
                    ? 'bg-forest-500 text-white shadow-md shadow-forest-500/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.icon}
              </div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-4 bg-gradient-to-b from-forest-400 to-forest-200 mt-1" />
              )}
            </div>

            {/* Label and count */}
            <div className="flex items-center justify-between flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-bold text-slate-800">{step.label}</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                  step.active
                    ? 'bg-forest-50 text-forest-700'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                {step.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
