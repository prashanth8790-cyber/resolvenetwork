'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldCheck, Users, Layers, Plus, CheckCircle, Ban, Building2, MapPin } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Ward Form State
  const [newWardName, setNewWardName] = useState('');
  const [newWardCode, setNewWardCode] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, cRes, wRes, aRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/categories'),
        fetch('/api/wards'),
        fetch('/api/analytics'),
      ]);

      if (uRes.ok) {
        const json = await uRes.json();
        if (json.success) setUsers(json.data.users);
      }
      if (cRes.ok) {
        const json = await cRes.json();
        if (json.success) setCategories(json.data.categories);
      }
      if (wRes.ok) {
        const json = await wRes.json();
        if (json.success) setWards(json.data.wards);
      }
      if (aRes.ok) {
        const json = await aRes.json();
        if (json.success) setAnalytics(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, description: newCatDesc }),
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatDesc('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardName || !newWardCode) return;
    try {
      const res = await fetch('/api/wards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWardName, code: newWardCode }),
      });
      if (res.ok) {
        setNewWardName('');
        setNewWardCode('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const overview = analytics?.overview || {};

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center text-xl shadow-md shadow-purple-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Control Panel</h1>
          <p className="text-xs text-slate-500">System user management, wards, categories, and platform oversight</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{overview.totalUsers || users.length}</div>
            <div className="text-xs text-slate-500">Total Registered Users</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{overview.citizens || 0}</div>
            <div className="text-xs text-slate-500">Citizens</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{overview.authorities || 0}</div>
            <div className="text-xs text-slate-500">Authorities</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{overview.totalIssues || 0}</div>
            <div className="text-xs text-slate-500">Total Platform Issues</div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> System Users ({users.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-900">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{u.department || 'N/A'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ml-auto transition ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <Ban className="w-3 h-3" /> Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" /> Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category & Ward Management CRUD Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category CRUD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Categories ({categories.length})
          </h2>

          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category Name"
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{cat.name}</span>
                  <span className="text-[10px] text-slate-500">{cat.description || 'No description'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ward CRUD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" /> Wards ({wards.length})
          </h2>

          <form onSubmit={handleCreateWard} className="flex gap-2">
            <input
              type="text"
              required
              value={newWardName}
              onChange={(e) => setNewWardName(e.target.value)}
              placeholder="Ward Name"
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
            <input
              type="text"
              required
              value={newWardCode}
              onChange={(e) => setNewWardCode(e.target.value)}
              placeholder="Code (e.g. WARD-05)"
              className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {wards.map((w) => (
              <div key={w.id} className="p-3 text-xs flex items-center justify-between">
                <span className="font-bold text-slate-900">{w.name}</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  {w.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
