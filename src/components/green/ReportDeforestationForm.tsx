'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Loader2,
  X,
  Crosshair,
  FileText,
  Send,
} from 'lucide-react';

interface AIAnalysisResult {
  treeCuttingProbability: number;
  vegetationLossArea: string;
  damageSeverity: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  findings: string[];
}

const DAMAGE_TYPES = [
  { value: 'illegal_logging', label: '🪓 Illegal Logging', desc: 'Unauthorized tree cutting or felling' },
  { value: 'forest_fire', label: '🔥 Forest Fire Damage', desc: 'Fire-related vegetation destruction' },
  { value: 'land_clearing', label: '🏗️ Land Clearing', desc: 'Clearing forests for development' },
  { value: 'encroachment', label: '🚧 Encroachment', desc: 'Illegal occupation of forest land' },
  { value: 'storm_damage', label: '🌪️ Storm Damage', desc: 'Natural disaster damage to trees' },
  { value: 'other', label: '📋 Other', desc: 'Other forms of environmental damage' },
];

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

export default function ReportDeforestationForm() {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [damageType, setDamageType] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate AI analysis
  const runAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate processing time
    await new Promise((r) => setTimeout(r, 2500));

    const probability = Math.floor(Math.random() * 40) + 60; // 60-99%
    const areas = ['0.5 hectares', '1.2 hectares', '2.8 hectares', '0.3 hectares', '4.1 hectares'];
    const severities = ['Severe', 'Moderate', 'High', 'Critical'];
    const allFindings = [
      'Bare soil patches detected in canopy gaps',
      'Recent tree stumps identified in satellite overlay',
      'Vegetation density reduced by estimated 40-60%',
      'Tire tracks and machinery paths visible',
      'Burn marks consistent with slash-and-burn clearing',
      'Edge effects suggest recent boundary clearing',
      'Soil erosion patterns indicate vegetation removal',
    ];

    const shuffled = allFindings.sort(() => Math.random() - 0.5);
    const selectedFindings = shuffled.slice(0, 3 + Math.floor(Math.random() * 2));

    let priority: AIAnalysisResult['priority'] = 'MEDIUM';
    if (probability >= 90) priority = 'CRITICAL';
    else if (probability >= 75) priority = 'HIGH';
    else if (probability >= 60) priority = 'MEDIUM';
    else priority = 'LOW';

    setAnalysisResult({
      treeCuttingProbability: probability,
      vegetationLossArea: areas[Math.floor(Math.random() * areas.length)],
      damageSeverity: severities[Math.floor(Math.random() * severities.length)],
      priority,
      findings: selectedFindings,
    });
    setIsAnalyzing(false);
  }, []);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      // Auto-trigger AI analysis
      setTimeout(() => runAIAnalysis(), 500);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError('Unable to capture location. Please allow location access.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    if (!image || !damageType || !description) return;
    // Store in localStorage for demo
    const report = {
      id: `DR-${Date.now().toString(36).toUpperCase()}`,
      image,
      imageName,
      location,
      damageType,
      description,
      analysis: analysisResult,
      timestamp: new Date().toISOString(),
      status: 'submitted',
    };
    const existing = JSON.parse(localStorage.getItem('greenReports') || '[]');
    existing.push(report);
    localStorage.setItem('greenReports', JSON.stringify(existing));
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      resetForm();
    }, 4000);
  };

  const resetForm = () => {
    setImage(null);
    setImageName('');
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setLocation(null);
    setDamageType('');
    setDescription('');
  };

  const isValid = image && damageType && description.trim().length > 10;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Report Submitted!</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          Your deforestation report has been filed successfully. Authorities will be notified and
          AI-based priority has been assigned.
        </p>
        <div className="px-4 py-2 rounded-xl bg-forest-50 border border-forest-200 text-forest-700 text-sm font-bold">
          Report ID: {JSON.parse(localStorage.getItem('greenReports') || '[]').slice(-1)[0]?.id || 'DR-XXX'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Camera className="w-4 h-4 text-forest-600" />
          Upload Evidence Image
        </label>

        {!image ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-forest-500 bg-forest-50 scale-[1.01]'
                : 'border-slate-300 hover:border-forest-400 hover:bg-forest-50/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              Drag & drop an image or <span className="text-forest-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PNG, JPG, WEBP up to 10MB — capture evidence of deforestation
            </p>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={image}
              alt="Uploaded evidence"
              className="w-full h-56 object-cover"
            />
            {isAnalyzing && <div className="green-scan-overlay" />}
            <button
              onClick={() => {
                setImage(null);
                setImageName('');
                setAnalysisResult(null);
                setIsAnalyzing(false);
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur">
              📷 {imageName}
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis Result */}
      {(isAnalyzing || analysisResult) && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="px-5 py-3 bg-gradient-to-r from-forest-600 to-teal-600 text-white flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-bold">AI Image Analysis</span>
            {isAnalyzing && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-forest-100">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Scanning...
              </span>
            )}
          </div>

          {isAnalyzing ? (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Analyzing vegetation patterns...</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-forest-400 to-teal-500 rounded-full animate-pulse w-2/3" />
                </div>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 h-16 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : analysisResult ? (
            <div className="p-5 space-y-4">
              {/* Priority badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Assigned Priority</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    PRIORITY_STYLES[analysisResult.priority].bg
                  } ${PRIORITY_STYLES[analysisResult.priority].text} ${
                    PRIORITY_STYLES[analysisResult.priority].border
                  }`}
                >
                  {analysisResult.priority}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-forest-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-forest-700">
                    {analysisResult.treeCuttingProbability}%
                  </div>
                  <div className="text-[10px] text-forest-600 font-medium mt-0.5">
                    Tree Cutting Probability
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-amber-700">
                    {analysisResult.vegetationLossArea}
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                    Vegetation Loss
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-red-700">
                    {analysisResult.damageSeverity}
                  </div>
                  <div className="text-[10px] text-red-600 font-medium mt-0.5">
                    Damage Severity
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600">Detected Findings:</span>
                <ul className="space-y-1.5">
                  {analysisResult.findings.map((f, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-600 flex items-start gap-2 animate-fade-up"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* GPS Location */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-forest-600" />
          GPS Location
        </label>

        {location ? (
          <div className="flex items-center gap-3 p-4 bg-forest-50 rounded-xl border border-forest-200">
            <Crosshair className="w-5 h-5 text-forest-600" />
            <div className="flex-1">
              <p className="text-sm font-bold text-forest-800">Location Captured</p>
              <p className="text-xs text-forest-600 font-mono">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
            <button
              onClick={() => setLocation(null)}
              className="text-xs text-forest-600 underline hover:text-forest-800"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={captureLocation}
              disabled={locationLoading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-dashed border-forest-300 text-forest-700 rounded-xl hover:bg-forest-50 hover:border-forest-500 transition font-bold text-sm disabled:opacity-50"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Crosshair className="w-4 h-4" />
              )}
              {locationLoading ? 'Capturing...' : 'Capture My Location'}
            </button>
          </div>
        )}
        {locationError && (
          <p className="text-xs text-red-500 font-medium">{locationError}</p>
        )}
      </div>

      {/* Damage Type */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-forest-600" />
          Type of Environmental Damage
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DAMAGE_TYPES.map((dt) => (
            <button
              key={dt.value}
              onClick={() => setDamageType(dt.value)}
              className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                damageType === dt.value
                  ? 'border-forest-500 bg-forest-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-forest-300 hover:bg-forest-50/30'
              }`}
            >
              <span className="text-sm font-bold text-slate-800">{dt.label}</span>
              <span className="block text-xs text-slate-500 mt-0.5">{dt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-forest-600" />
          Incident Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe what you observed... Include details like approximate number of trees affected, presence of machinery, time of incident, etc."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 resize-none transition"
        />
        <p className="text-xs text-slate-400">
          Minimum 10 characters. {description.length > 0 && `(${description.length} characters)`}
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-forest-600 to-teal-600 hover:from-forest-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-forest-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Send className="w-4 h-4" />
        Submit Deforestation Report
      </button>
    </div>
  );
}
