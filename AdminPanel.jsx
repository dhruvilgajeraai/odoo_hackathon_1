import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import TopBar from '../components/common/TopBar';
import { 
  Users, MapPin, Activity, TrendingUp, Shield, Trash2, 
  Sparkles, CheckCircle2, DollarSign, Compass, Layers 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { formatINR } from '../utils/formatters';

const PIE_COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#f59e0b', '#ef4444'];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers()
      ]);
      setStats(statsRes);
      setUsersList(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their associated data?')) return;
    try {
      await api.deleteAdminUser(userId);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  let filteredUsers = [...usersList];
  if (search) {
    const s = search.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.first_name.toLowerCase().includes(s) ||
      u.last_name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.city && u.city.toLowerCase().includes(s))
    );
  }

  const tabs = [
    { id: 'users', label: 'Manage Users', icon: Users, count: stats?.summary?.total_users },
    { id: 'cities', label: 'Popular Cities', icon: MapPin, count: stats?.popular_cities?.length },
    { id: 'activities', label: 'Popular Activities', icon: Activity, count: stats?.popular_activities?.length },
    { id: 'trends', label: 'User Trends & Analytics', icon: TrendingUp }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Analytics & Management</h1>
          <p className="text-sm text-slate-500">
            Monitor Indian travel platform metrics, curate catalog popularity, and manage user accounts.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Users</span>
          <p className="text-2xl font-black text-slate-900">{stats?.summary?.total_users || 0}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Trips Created</span>
          <p className="text-2xl font-black text-brand-600">{stats?.summary?.total_trips || 0}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Stops Visited</span>
          <p className="text-2xl font-black text-emerald-600">{stats?.summary?.total_stops || 0}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Active Activities</span>
          <p className="text-2xl font-black text-amber-600">{stats?.summary?.total_activities || 0}</p>
        </div>
      </div>

      {/* Reusable TopBar */}
      <TopBar
        searchPlaceholder="Search in admin records..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* 4 Tabs Selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: Manage Users */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900">Registered Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-xl">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Trips Created</th>
                      <th className="p-3 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 flex items-center space-x-2.5">
                          <img
                            src={u.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.first_name}`}
                            alt={u.first_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{u.first_name} {u.last_name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          {u.city || u.country ? `${u.city || ''}, ${u.country || ''}` : 'Not set'}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{u.trip_count || 0}</td>
                        <td className="p-3 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Popular Cities */}
          {activeTab === 'cities' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900">Most Visited Indian Destinations (Stop Counts)</h3>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.popular_cities || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="visits" name="Total Visits in Itineraries" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(stats?.popular_cities || []).map((c, idx) => (
                  <div key={c.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.country}</p>
                      </div>
                    </div>
                    <span className="font-black text-brand-700 bg-white px-2 py-1 rounded-lg shadow-xs">
                      {c.visits} visits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Popular Activities */}
          {activeTab === 'activities' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900">Activity Distribution by Category</h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.category_distribution || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="category"
                      label
                    >
                      {(stats?.category_distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Featured Indian Activities</h4>
                <div className="divide-y divide-slate-100">
                  {(stats?.popular_activities || []).map((act) => (
                    <div key={act.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{act.name}</span>
                        <span className="text-slate-400 text-[10px] ml-2 capitalize">({act.category})</span>
                      </div>
                      <span className="font-bold text-emerald-600">{formatINR(act.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: User Trends & Analytics */}
          {activeTab === 'trends' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900">Platform Growth & Trip Creation Trends</h3>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" name="New User Signups" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="trips" name="Trips Planned" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Admin Module Guides
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-brand-50/60 rounded-2xl border border-brand-100 space-y-1">
                <h4 className="font-black text-brand-900">Manage User Section</h4>
                <p className="text-brand-800 leading-relaxed font-medium">
                  Responsible for managing Indian traveler profiles and their itineraries.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-black text-slate-900">Popular Indian Cities</h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Lists popular destinations like Goa, Jaipur, Manali, Kerala, and Ladakh based on user itineraries.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-black text-slate-900">Popular Activities</h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Tracks popular outdoor, cultural, and food activities with INR pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
