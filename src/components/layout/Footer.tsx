import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">CivicConnect</span>
          <span>&copy; {new Date().getFullYear()} — Crowd-Sourced Civic Action</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/issues" className="hover:text-blue-600 transition">
            All Issues
          </Link>
          <Link href="/issues/create" className="hover:text-blue-600 transition">
            Report Issue
          </Link>
          <Link href="/login" className="hover:text-blue-600 transition">
            Role Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
