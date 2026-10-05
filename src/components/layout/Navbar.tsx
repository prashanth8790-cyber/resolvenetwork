'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import NotificationsMenu from './NotificationsMenu';
import { Building2, PlusCircle, MapPin, LayoutDashboard, LogOut, User, Leaf } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'AUTHORITY':
        return '/dashboard/authority';
      case 'CITIZEN':
      default:
        return '/dashboard/citizen';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
              Civic<span className="text-blue-600">Connect</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block leading-none">
              Civic Issue Platform
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/issues" className="flex items-center gap-1 hover:text-blue-600 transition">
            <MapPin className="w-4 h-4 text-blue-500" />
            Explore Issues & Map
          </Link>
          <Link href="/green-society" className="flex items-center gap-1 hover:text-emerald-600 transition">
            <Leaf className="w-4 h-4 text-emerald-500" />
            Green Society
          </Link>
          <Link
            href="/issues/create"
            className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </Link>
        </nav>

        {/* Right Action Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationsMenu />

              <Link
                href={getDashboardLink()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                Dashboard
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 hover:bg-blue-100 transition focus:outline-none"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                    {user.role}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 text-xs truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {user.department && (
                          <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                            Dept: {user.department}
                          </p>
                        )}
                      </div>

                      <Link
                        href={getDashboardLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        My Dashboard
                      </Link>

                      <Link
                        href="/issues/create"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <PlusCircle className="w-4 h-4 text-slate-500" />
                        Report New Issue
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
