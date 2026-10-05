'use client';

import dynamic from 'next/dynamic';

const IssueMapInternal = dynamic(() => import('./IssueMapInternal'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
      Loading interactive map...
    </div>
  ),
});

export default function IssueMap(props: any) {
  return <IssueMapInternal {...props} />;
}
