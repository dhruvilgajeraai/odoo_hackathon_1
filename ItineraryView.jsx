import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import TopBar from '../components/common/TopBar';
import { 
  Calendar, MapPin, DollarSign, Clock, ArrowDown, Share2, 
  Edit3, AlertTriangle, CheckCircle2, PieChart as PieIcon, 
  BarChart as BarIcon, List, Eye, Copy, ArrowRight 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { formatINR, formatISTDate } from '../utils/formatters';

const CATEGORY_COLORS = {
  sightseeing: '#0284c7',
  activity: '#f59e0b',
  food: '#ef4444',
  stay: '#8b5cf6',
  transport: '#10b981'
};

export default function ItineraryView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // TopBar filters
  const [search, setSearch] = useState('');

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const loadData = async () => {
    try {
      const [fullTripRes, budgetRes] = await Promise.all([
        api.getFullTrip(id),
        api.getTripBudget(id)
      ]);
      setTrip(fullTripRes.trip);
      setBudget(budgetRes);
    } catch (err) {
      setError(err.message || 'Failed to load itinerary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleShare = async () => {
    try {
      const res = await api.shareTrip(trip.id);
      setShareData({
        url: `${window.location.origin}/t/${res.share_slug}`
      });
      setShareOpen(true);
    } catch (err) {
      alert('Failed to share trip.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Trip not found</h2>
        <Link to="/trips" className="text-brand-600 underline mt-2 block">Return to My Trips</Link>
      </div>
    );
  }

  const allActivities = [];
  (trip.stops || []).forEach(stop => {
    (stop.activities || []).forEach(act => {
      allActivities.push({
        ...act,
        cityName: stop.city?.name || 'Stop',
        cityCountry: stop.city?.country || ''
      });
    });
  });

  let displayActivities = allActivities;
  if (search) {
    const s = search.toLowerCase();
    displayActivities = displayActivities.filter(a => 
      a.name.toLowerCase().includes(s) || 
      (a.category && a.category.toLowerCase().includes(s)) ||
      (a.location_notes && a.location_notes.toLowerCase().includes(s))
    );
  }

  const dayGroups = {};
  displayActivities.forEach(act => {
    const day = act.day_number || 1;
    if (!dayGroups[day]) dayGroups[day] = [];
    dayGroups[day].push(act);
  });

  const sortedDays = Object.keys(dayGroups).map(Number).sort((a, b) => a - b);

  const pieData = (budget?.categories || []).filter(c => c.amount > 0).map(c => ({
    name: c.label,
    value: c.amount,
    color: CATEGORY_COLORS[c.category.toLowerCase()] || '#64748b'
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Trip Cover & Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 min-h-[260px] flex items-end p-6 sm:p-8">
        <img
          src={trip.cover_photo_url}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

        <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-brand-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                Itinerary View
              </span>
              <span className="text-slate-300 text-xs flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatISTDate(trip.start_date)} → {formatISTDate(trip.end_date)} ({budget?.day_count || 1} Days)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{trip.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{trip.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/calendar`}
              className="flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar View</span>
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Trip</span>
            </button>
            <Link
              to={`/trips/${trip.id}/build`}
              className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Sections</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overbudget Warning Alert in INR */}
      {budget?.is_overbudget && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm">Overbudget Notice</h4>
              <p className="text-xs text-amber-800">
                Your activities total <strong>{formatINR(budget.total_cost)}</strong>, which exceeds your target budget of <strong>{formatINR(budget.target_budget)}</strong> by <strong>{formatINR(budget.overbudget_amount)}</strong>.
              </p>
            </div>
          </div>
          <Link
            to={`/trips/${trip.id}/build`}
            className="text-xs font-bold bg-amber-600 text-white px-3.5 py-1.5 rounded-xl hover:bg-amber-700"
          >
            Adjust Budget
          </Link>
        </div>
      )}

      {/* TopBar Component */}
      <TopBar
        searchPlaceholder="Filter activities in this itinerary..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Main Grid: Left = Day-Wise Timeline, Right = Dynamic Budget Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Day-Wise Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-xl font-black text-slate-900">
              Itinerary for {trip.name}
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              {sortedDays.length} Days Scheduled
            </span>
          </div>

          {sortedDays.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No activities scheduled yet</h3>
              <p className="text-xs text-slate-500">Go to the Itinerary Builder to add activities to each stop.</p>
              <Link
                to={`/trips/${trip.id}/build`}
                className="inline-block bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                + Add Activities Now
              </Link>
            </div>
          ) : (
            sortedDays.map((dayNum) => {
              const dayActivities = dayGroups[dayNum] || [];
              const dayCost = dayActivities.reduce((s, a) => s + Number(a.cost || 0), 0);

              return (
                <div key={dayNum} className="space-y-4">
                  {/* Day Label Header */}
                  <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center">
                        D{dayNum}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Day {dayNum} Itinerary</h3>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold flex items-center space-x-1">
                      <span>Day Total:</span>
                      <span className="font-black text-white bg-white/20 px-2 py-0.5 rounded-md">
                        {formatINR(dayCost)}
                      </span>
                    </div>
                  </div>

                  {/* Connected Activity Items with downward arrows */}
                  <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-brand-200 ml-4 sm:ml-5">
                    {dayActivities.map((act, idx) => (
                      <div key={act.id} className="space-y-3">
                        {/* Activity Row */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {act.time_slot}
                              </span>
                              <span
                                className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                                style={{ backgroundColor: CATEGORY_COLORS[act.category?.toLowerCase()] || '#0284c7' }}
                              >
                                {act.category}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                • {act.cityName}
                              </span>
                            </div>

                            <h4 className="text-sm font-extrabold text-slate-900">{act.name}</h4>
                            {act.location_notes && (
                              <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{act.location_notes}</span>
                              </p>
                            )}
                          </div>

                          {/* Expense Box in INR */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex-shrink-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Expense</span>
                            <span className="font-black text-base text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                              {formatINR(act.cost)}
                            </span>
                          </div>
                        </div>

                        {/* Downward Connecting Arrow */}
                        {idx < dayActivities.length - 1 && (
                          <div className="flex justify-center -my-1">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                              <ArrowDown className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic Budget Section in INR (Right Column) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="text-emerald-600 font-black text-xl">₹</span>
                <span>Total Budget Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated in real-time in Indian Rupees (INR)</p>
            </div>

            {/* Total spend metrics */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-5 text-white space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Spend</span>
                  <span className="text-3xl font-black tracking-tight text-white">
                    {formatINR(budget?.total_cost)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Target Budget</span>
                  <span className="text-lg font-bold text-slate-200">
                    {formatINR(budget?.target_budget)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-between text-xs text-slate-300">
                <span>Avg Daily Cost:</span>
                <span className="font-bold text-white">{formatINR(budget?.average_cost_per_day)}/day</span>
              </div>
            </div>

            {/* Category Pie Chart */}
            {pieData.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Spend by Category</h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatINR(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="space-y-2 pt-2">
                  {(budget?.categories || []).map(cat => (
                    <div key={cat.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat.category.toLowerCase()] || '#64748b' }}
                        ></span>
                        <span className="font-semibold text-slate-700">{cat.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{formatINR(cat.amount)}</span>
                        <span className="text-slate-400 text-[10px]">({cat.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stop-by-Stop Spend */}
            {(budget?.stops || []).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Stop-by-Stop Breakdown</h4>
                <div className="space-y-2.5">
                  {budget.stops.map((s) => (
                    <div key={s.stop_id} className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{s.city_name}</span>
                        <span className={s.is_overbudget ? 'text-red-600' : 'text-slate-900'}>
                          {formatINR(s.actual_cost)} {s.target_budget > 0 ? `/ ${formatINR(s.target_budget)}` : ''}
                        </span>
                      </div>
                      {s.target_budget > 0 && (
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.is_overbudget ? 'bg-red-500' : 'bg-brand-500'}`}
                            style={{ width: `${Math.min(100, (s.actual_cost / s.target_budget) * 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareOpen && shareData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Share Public Itinerary</h3>
              <button onClick={() => setShareOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Anyone with this link can view this full itinerary in read-only mode and duplicate it to their account.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-mono text-slate-700 truncate mr-2">{shareData.url}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareData.url);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 3000);
                }}
                className="flex items-center space-x-1 bg-brand-600 text-white px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
