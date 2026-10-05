'use client';

import { useEffect, useRef } from 'react';
import { Award } from 'lucide-react';

interface GreenScoreRingProps {
  score: number; // 0–1000
  size?: number;
}

const LEVELS = [
  { min: 0, label: 'Seedling', emoji: '🌱', color: '#ef4444' },
  { min: 200, label: 'Sapling', emoji: '🌿', color: '#f59e0b' },
  { min: 400, label: 'Tree', emoji: '🌳', color: '#22c55e' },
  { min: 700, label: 'Forest', emoji: '🌲', color: '#16a34a' },
  { min: 900, label: 'Ecosystem', emoji: '🏔️', color: '#15803d' },
];

function getLevel(score: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (score >= l.min) level = l;
  }
  return level;
}

export default function GreenScoreRing({ score, size = 200 }: GreenScoreRingProps) {
  const ringRef = useRef<SVGCircleElement>(null);
  const level = getLevel(score);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 1000, 1);
  const offset = circumference - progress * circumference;

  useEffect(() => {
    if (ringRef.current) {
      // Trigger animation by setting offset after mount
      ringRef.current.style.strokeDashoffset = String(offset);
    }
  }, [offset]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="green-score-ring-track"
          />
          {/* Fill */}
          <circle
            ref={ringRef}
            cx="80"
            cy="80"
            r={radius}
            stroke={level.color}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease',
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-slate-900">{score}</span>
          <span className="text-xs text-slate-500 font-medium">/ 1000</span>
        </div>
      </div>

      {/* Level badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-sm"
        style={{
          borderColor: level.color,
          color: level.color,
          backgroundColor: `${level.color}10`,
        }}
      >
        <span className="text-lg">{level.emoji}</span>
        <Award className="w-4 h-4" />
        {level.label}
      </div>
    </div>
  );
}
