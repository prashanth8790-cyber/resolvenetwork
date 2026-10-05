'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import DuplicateWarningModal from '@/components/issues/DuplicateWarningModal';
import { uploadImageToCloudinary } from '@/lib/services/storage';
import { reverseGeocode } from '@/lib/services/geocoding';
import { useAuth } from '@/components/providers/AuthProvider';
import { MapPin, Upload, Image as ImageIcon, Trash2, AlertCircle, ArrowRight, LocateFixed, Loader2, CheckCircle2, Map } from 'lucide-react';

export default function CreateIssuePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [wardId, setWardId] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [address, setAddress] = useState('500 Market St, San Francisco, CA');

  // Location Detection State
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  // Image Upload State (up to 3)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Duplicate Check Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateIssues, setDuplicateIssues] = useState<any[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCategories(json.data.categories);
          if (json.data.categories.length > 0) setCategoryId(json.data.categories[0].id);
        }
      });

    fetch('/api/wards')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setWards(json.data.wards);
          if (json.data.wards.length > 0) setWardId(json.data.wards[0].id);
        }
      });
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser.',
        details: 'Please choose your location manually on the map.',
      });
      return;
    }

    setLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setCoords({ lat, lng });
        setLocating(false);
        setLocationStatus({
          type: 'success',
          message: 'Location auto-detected successfully!',
          details: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)} (~${Math.round(accuracy)}m accuracy)`,
        });

        // Reverse geocode to get street address
        setGeocoding(true);
        try {
          const revAddr = await reverseGeocode(lat, lng);
          setAddress(revAddr);
        } catch (err) {
          console.warn('Geocoding error:', err);
        } finally {
          setGeocoding(false);
        }
      },
      (geoError) => {
        setLocating(false);
        let msg = 'Unable to detect location.';
        let details = 'Please choose your location manually using the interactive map.';

        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Location permission was denied.';
          details = 'Please grant permission in your browser or select your location on the map.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Location detection request timed out.';
        }

        setLocationStatus({
          type: 'error',
          message: msg,
          details,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleMapChange = async (newCoords: { lat: number; lng: number }) => {
    setCoords(newCoords);
    setLocationStatus({
      type: 'success',
      message: 'Location pin set on map.',
      details: `Coordinates: ${newCoords.lat.toFixed(5)}, ${newCoords.lng.toFixed(5)}`,
    });

    // Auto-update address when marker is dragged or clicked
    setGeocoding(true);
    try {
      const revAddr = await reverseGeocode(newCoords.lat, newCoords.lng);
      setAddress(revAddr);
    } catch (err) {
      console.warn('Map drag geocoding error:', err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleChooseOnMap = () => {
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 5MB max limit`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not a supported image`);
        return;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    const combinedFiles = [...selectedFiles, ...validFiles].slice(0, 3);
    const combinedPreviews = [...imagePreviews, ...previews].slice(0, 3);

    setSelectedFiles(combinedFiles);
    setImagePreviews(combinedPreviews);
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const executeSubmission = async () => {
    setSubmitting(true);
    setError('');

    try {
      // 1. Upload images to Cloudinary (or base64 fallback)
      setUploadingImages(true);
      const imageUrls: string[] = [];

      for (const file of selectedFiles) {
        const url = await uploadImageToCloudinary(file);
        imageUrls.push(url);
      }
      setUploadingImages(false);

      // 2. Submit issue to API
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          wardId,
          severity,
          lat: coords.lat,
          lng: coords.lng,
          address,
          images: imageUrls,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to submit issue');
      }

      router.push(`/issues/${json.data.issue.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission');
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!title || !description || !categoryId || !wardId || !address) {
      setError('Please fill in all required form fields');
      return;
    }

    // 1. Check duplicate issues nearby (~200m)
    try {
      const checkRes = await fetch(
        `/api/issues/duplicate-check?lat=${coords.lat}&lng=${coords.lng}&categoryId=${categoryId}`
      );
      if (checkRes.ok) {
        const json = await checkRes.json();
        if (json.success && json.data.hasDuplicates) {
          setDuplicateIssues(json.data.duplicates);
          setShowDuplicateModal(true);
          return;
        }
      }
    } catch (err) {
      console.warn('Duplicate check error:', err);
    }

    // If no duplicates, proceed with submit
    executeSubmission();
  };

  const handleUpvoteExisting = async (issueId: string) => {
    try {
      await fetch(`/api/issues/${issueId}/support`, { method: 'POST' });
      router.push(`/issues/${issueId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) return <div className="py-12 text-center text-slate-500">Checking auth session...</div>;

  return (
    <div className="max-w-3xl mx-auto my-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" /> Report a Civic Issue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide details, pick location on the map, and attach up to 3 photos to alert authorities.
          </p>
        </div>

        {!user && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <span>You need to be logged in to submit an official issue report.</span>
            <button
              onClick={() => router.push('/login')}
              className="px-3 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition"
            >
              Log In
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole on main avenue"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Severity & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Severity Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="LOW">Low (Minor inconvenience)</option>
                <option value="MEDIUM">Medium (Requires attention)</option>
                <option value="HIGH">High (Urgent safety hazard)</option>
                <option value="CRITICAL">Critical (Immediate danger/emergency)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ward / District <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, specific landmarks, potential hazards..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Location Detection & Picker Map */}
          <div className="space-y-3 pt-2 border-t border-slate-100" ref={mapSectionRef}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="block text-xs font-bold text-slate-700">
                Location Details <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {locating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Detecting Location...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-4 h-4 text-white" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleChooseOnMap}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Map className="w-4 h-4 text-slate-600" />
                  <span>Choose Location on Map</span>
                </button>
              </div>
            </div>

            {/* Location Status Alert (Success / Error) */}
            {locationStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start justify-between gap-3 border transition shadow-sm ${
                  locationStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {locationStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{locationStatus.message}</p>
                    {locationStatus.details && <p className="text-[11px] opacity-90 mt-0.5">{locationStatus.details}</p>}
                  </div>
                </div>

                {locationStatus.type === 'error' && (
                  <button
                    type="button"
                    onClick={handleChooseOnMap}
                    className="shrink-0 px-2.5 py-1 bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 rounded-lg text-[11px] font-bold transition shadow-xs"
                  >
                    Select on Map
                  </button>
                )}
              </div>
            )}

            {/* Location Picker Map */}
            <LocationPickerMap lat={coords.lat} lng={coords.lng} onChange={handleMapChange} />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600">Street Address / Landmark</label>
                {geocoding && (
                  <span className="text-[10px] text-blue-600 flex items-center gap-1 font-medium animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Auto-detecting address...
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or physical landmark..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Image Upload (Max 3) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Attach Photos (Up to 3 images)
            </label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300 group">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 3 && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer transition text-slate-500 hover:text-blue-600">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting || uploadingImages || locating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? uploadingImages
                  ? 'Uploading Images...'
                  : 'Checking & Submitting Issue...'
                : 'Submit Issue Report'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        duplicates={duplicateIssues}
        onClose={() => setShowDuplicateModal(false)}
        onProceedAnyway={() => {
          setShowDuplicateModal(false);
          executeSubmission();
        }}
        onUpvoteExisting={handleUpvoteExisting}
      />
    </div>
  );
}
