'use client';

import dynamic from 'next/dynamic';

const LocationPickerInternal = dynamic(() => import('./LocationPickerInternal'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
      Loading location picker map...
    </div>
  ),
});

export default function LocationPickerMap(props: any) {
  return <LocationPickerInternal {...props} />;
}
