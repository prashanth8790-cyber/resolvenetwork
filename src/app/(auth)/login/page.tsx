'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, User, Wrench } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Login failed');
      }

      login(json.data.user);

      // Redirect based on role
      const role = json.data.user.role;
      if (role === 'ADMIN') router.push('/dashboard/admin');
      else if (role === 'AUTHORITY') router.push('/dashboard/authority');
      else router.push('/dashboard/citizen');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your CivicConnect dashboard
          </p>
        </div>

        {/* Quick Credentials Panel for Hackathon Demo */}
        <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
            ⚡ Quick Hackathon Demo Logins (Password: <code className="text-blue-600 font-mono">password123</code>):
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen1@example.com')}
              className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-0.5 transition"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('marcus@civicconnect.gov')}
              className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-0.5 transition"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Authority</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@civicconnect.gov')}
              className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-0.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
