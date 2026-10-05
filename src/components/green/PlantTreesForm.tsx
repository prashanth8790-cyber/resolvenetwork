'use client';

import { useState, useRef, useEffect } from 'react';
import {
  TreePine,
  MapPin,
  Plus,
  Minus,
  Upload,
  Calendar,
  CheckCircle2,
  X,
  Leaf,
  HeartPulse,
  TrendingUp,
  Send,
  RefreshCw,
} from 'lucide-react';

const TREE_SPECIES = [
  { id: 'neem', name: 'Neem', emoji: '🌿' },
  { id: 'banyan', name: 'Banyan', emoji: '🌳' },
  { id: 'peepal', name: 'Peepal', emoji: '🍃' },
  { id: 'mango', name: 'Mango', emoji: '🥭' },
  { id: 'teak', name: 'Teak', emoji: '🪵' },
  { id: 'bamboo', name: 'Bamboo', emoji: '🎋' },
  { id: 'oak', name: 'Oak', emoji: '🌲' },
  { id: 'pine', name: 'Pine', emoji: '🏔️' },
];

interface PlantationRecord {
  id: string;
  location: string;
  treesPlanted: number;
  species: string[];
  date: string;
  proof: string | null;
  survivalRate: number;
  status: 'active' | 'monitoring' | 'verified';
  lastChecked: string;
}

// Demo seed data
const SEED_RECORDS: PlantationRecord[] = [
  {
    id: 'PT-001',
    location: 'Riverside Park Zone B',
    treesPlanted: 45,
    species: ['neem', 'banyan', 'peepal'],
    date: '2026-06-15',
    proof: null,
    survivalRate: 89,
    status: 'active',
    lastChecked: '2026-08-10',
  },
  {
    id: 'PT-002',
    location: 'City Highway Divider Strip',
    treesPlanted: 120,
    species: ['neem', 'teak'],
    date: '2026-05-20',
    proof: null,
    survivalRate: 76,
    status: 'monitoring',
    lastChecked: '2026-08-01',
  },
  {
    id: 'PT-003',
    location: 'School Campus Green Belt',
    treesPlanted: 30,
    species: ['mango', 'peepal', 'bamboo'],
    date: '2026-04-01',
    proof: null,
    survivalRate: 93,
    status: 'verified',
    lastChecked: '2026-07-28',
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  monitoring: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  verified: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

export default function PlantTreesForm() {
  const [activeSection, setActiveSection] = useState<'suggest' | 'tracker'>('suggest');

  // Form state
  const [locationName, setLocationName] = useState('');
  const [treeCount, setTreeCount] = useState(10);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [plantDate, setPlantDate] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracker state
  const [records, setRecords] = useState<PlantationRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('greenPlantations');
    if (stored) {
      setRecords(JSON.parse(stored));
    } else {
      setRecords(SEED_RECORDS);
      localStorage.setItem('greenPlantations', JSON.stringify(SEED_RECORDS));
    }
  }, []);

  const toggleSpecies = (id: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleProofUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setProofImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!locationName || treeCount < 1 || selectedSpecies.length === 0 || !plantDate) return;

    const newRecord: PlantationRecord = {
      id: `PT-${Date.now().toString(36).toUpperCase()}`,
      location: locationName,
      treesPlanted: treeCount,
      species: selectedSpecies,
      date: plantDate,
      proof: proofImage,
      survivalRate: 100,
      status: 'active',
      lastChecked: new Date().toISOString().split('T')[0],
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    localStorage.setItem('greenPlantations', JSON.stringify(updated));
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setLocationName('');
      setTreeCount(10);
      setSelectedSpecies([]);
      setPlantDate('');
      setProofImage(null);
    }, 3000);
  };

  const updateSurvival = (id: string) => {
    const updated = records.map((r) => {
      if (r.id === id) {
        // Simulate a small survival rate adjustment
        const delta = Math.floor(Math.random() * 6) - 2; // -2 to +3
        const newRate = Math.max(0, Math.min(100, r.survivalRate + delta));
        return {
          ...r,
          survivalRate: newRate,
          lastChecked: new Date().toISOString().split('T')[0],
          status: (newRate >= 85 ? 'verified' : newRate >= 60 ? 'monitoring' : 'active') as PlantationRecord['status'],
        };
      }
      return r;
    });
    setRecords(updated);
    localStorage.setItem('greenPlantations', JSON.stringify(updated));
  };

  const isValid = locationName.trim() && treeCount >= 1 && selectedSpecies.length > 0 && plantDate;

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex bg-forest-50 rounded-xl p-1 border border-forest-200">
        <button
          onClick={() => setActiveSection('suggest')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSection === 'suggest'
              ? 'bg-white text-forest-700 shadow-sm'
              : 'text-forest-600 hover:text-forest-800'
          }`}
        >
          <TreePine className="w-4 h-4" />
          Suggest Plantation
        </button>
        <button
          onClick={() => setActiveSection('tracker')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSection === 'tracker'
              ? 'bg-white text-forest-700 shadow-sm'
              : 'text-forest-600 hover:text-forest-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Survival Tracker
        </button>
      </div>

      {/* ── Suggest Plantation Section ── */}
      {activeSection === 'suggest' && (
        <>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Plantation Recorded!</h3>
              <p className="text-sm text-slate-500 text-center max-w-md">
                {treeCount} trees registered at {locationName}. Track their survival in the Tracker tab.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest-600" />
                  Plantation Location
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Riverside Park Zone B, Highway NH-48 Stretch..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition"
                />
              </div>

              {/* Tree Count */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-forest-600" />
                  Number of Trees
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTreeCount(Math.max(1, treeCount - 5))}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={treeCount}
                    onChange={(e) => setTreeCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center px-3 py-2.5 rounded-xl border border-slate-300 text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                  />
                  <button
                    onClick={() => setTreeCount(treeCount + 5)}
                    className="w-11 h-11 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-700 flex items-center justify-center transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="flex gap-2 ml-2">
                    {[10, 25, 50, 100].map((n) => (
                      <button
                        key={n}
                        onClick={() => setTreeCount(n)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          treeCount === n
                            ? 'bg-forest-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-forest-100 hover:text-forest-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tree Species */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-forest-600" />
                  Tree Species
                </label>
                <div className="flex flex-wrap gap-2">
                  {TREE_SPECIES.map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => toggleSpecies(sp.id)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        selectedSpecies.includes(sp.id)
                          ? 'border-forest-500 bg-forest-50 text-forest-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-forest-300'
                      }`}
                    >
                      <span className="mr-1.5">{sp.emoji}</span>
                      {sp.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-forest-600" />
                  Plantation Date
                </label>
                <input
                  type="date"
                  value={plantDate}
                  onChange={(e) => setPlantDate(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition"
                />
              </div>

              {/* Proof Upload */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-forest-600" />
                  Upload Plantation Proof
                  <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>

                {proofImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 w-fit">
                    <img
                      src={proofImage}
                      alt="Plantation proof"
                      className="h-40 object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => setProofImage(null)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 font-medium hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50/30 transition"
                  >
                    <Upload className="w-4 h-4" />
                    Click to upload a photo
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProofUpload(file);
                  }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-forest-600 to-teal-600 hover:from-forest-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-forest-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
                Register Plantation
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Survival Tracker Section ── */}
      {activeSection === 'tracker' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Tracking <span className="font-bold text-slate-800">{records.length}</span> plantation records
            </p>
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <TreePine className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No plantation records yet. Start by suggesting a plantation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((rec, i) => {
                const style = STATUS_STYLES[rec.status];
                const survivingTrees = Math.round((rec.survivalRate / 100) * rec.treesPlanted);
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 hover:shadow-md transition animate-fade-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-400">{rec.id}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{rec.location}</h4>
                      </div>
                      <button
                        onClick={() => updateSurvival(rec.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-50 text-forest-700 text-xs font-bold hover:bg-forest-100 transition flex-shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Update
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <div className="text-lg font-black text-slate-900">{rec.treesPlanted}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Planted</div>
                      </div>
                      <div className="bg-forest-50 rounded-xl p-2.5">
                        <div className="text-lg font-black text-forest-700">{survivingTrees}</div>
                        <div className="text-[10px] text-forest-600 font-medium">Surviving</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <div className="text-lg font-black text-slate-900">{rec.date}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Planted On</div>
                      </div>
                    </div>

                    {/* Survival bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Survival Rate</span>
                        <span
                          className={`font-extrabold ${
                            rec.survivalRate >= 80
                              ? 'text-forest-600'
                              : rec.survivalRate >= 50
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {rec.survivalRate}%
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            rec.survivalRate >= 80
                              ? 'bg-gradient-to-r from-forest-400 to-forest-500'
                              : rec.survivalRate >= 50
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${rec.survivalRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Species + last checked */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex gap-1.5">
                        {rec.species.map((sp) => {
                          const speciesData = TREE_SPECIES.find((s) => s.id === sp);
                          return speciesData ? (
                            <span
                              key={sp}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                              title={speciesData.name}
                            >
                              {speciesData.emoji} {speciesData.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                      <span className="flex-shrink-0">Last checked: {rec.lastChecked}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
