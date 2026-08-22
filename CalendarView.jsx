import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import TopBar from '../components/common/TopBar';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, Eye, Plus, Compass, DollarSign, X 
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Default Sep 2026
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Day popover details
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await api.getTrips({ user: 'me' });
        setTrips(res.trips || []);
      } catch (err) {
        console.error('Failed to load trips for calendar:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      month: month,
      year,
      isCurrentMonth: true
    });
  }

  // Next month leading days to complete grid (42 cells = 6 weeks)
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    });
  }

  // Find trips active on a given date string YYYY-MM-DD
  const getTripsForDate = (dateStr) => {
    return trips.filter(t => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return t.start_date <= dateStr && t.end_date >= dateStr;
    });
  };

  const handleCellClick = (cellDateStr, dayTrips, dayNum) => {
    if (dayTrips.length === 0) return;
    setSelectedDayInfo({
      dateStr: cellDateStr,
      dayNum,
      trips: dayTrips
    });
  };

  const TRIP_COLORS = [
    'bg-brand-600 text-white',
    'bg-amber-600 text-white',
    'bg-emerald-600 text-white',
    'bg-purple-600 text-white',
    'bg-rose-600 text-white'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendar Itinerary View</h1>
          <p className="text-sm text-slate-500">
            Visualize your multi-day expeditions and activities across a monthly planner grid.
          </p>
        </div>

        <Link
          to="/trips/new"
          className="flex items-center space-x-2 bg-brand-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md hover:bg-brand-700 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Plan Trip</span>
        </Link>
      </div>

      {/* Cross-Screen TopBar */}
      <TopBar
        searchPlaceholder="Filter trips on calendar..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Month Navigation & Grid Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Month Selector Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-brand-600" />
            <h2 className="text-xl font-black text-slate-900">
              {MONTH_NAMES[month]} {year}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden text-center text-xs font-extrabold uppercase tracking-wider text-slate-600">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
            <div key={d} className="bg-slate-50 py-3">
              {d}
            </div>
          ))}
        </div>

        {/* 42-cell Month Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden shadow-inner">
          {calendarCells.map((cell, idx) => {
            const formattedMonth = String(cell.month + 1).padStart(2, '0');
            const formattedDay = String(cell.day).padStart(2, '0');
            const dateStr = `${cell.year}-${formattedMonth}-${formattedDay}`;

            const activeTrips = getTripsForDate(dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(dateStr, activeTrips, cell.day)}
                className={`min-h-[100px] sm:min-h-[115px] p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/80 cursor-pointer' : 'bg-slate-50/50 text-slate-400'
                } ${isToday ? 'ring-2 ring-inset ring-brand-500' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'} ${isToday ? 'w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center' : ''}`}>
                    {cell.day}
                  </span>
                  {activeTrips.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  )}
                </div>

                {/* Spanned Trip Pills */}
                <div className="space-y-1 my-1">
                  {activeTrips.slice(0, 2).map((trip, tIdx) => (
                    <div
                      key={trip.id}
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md truncate shadow-sm ${TRIP_COLORS[tIdx % TRIP_COLORS.length]}`}
                    >
                      {trip.name}
                    </div>
                  ))}
                  {activeTrips.length > 2 && (
                    <span className="text-[9px] font-bold text-slate-500 pl-1">
                      +{activeTrips.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Popover Modal */}
      {selectedDayInfo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedDayInfo.dateStr}
                </h3>
                <p className="text-xs text-slate-500">{selectedDayInfo.trips.length} active journey(s)</p>
              </div>
              <button onClick={() => setSelectedDayInfo(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedDayInfo.trips.map(trip => (
                <div key={trip.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900">{trip.name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-brand-100 text-brand-800 px-2 py-0.5 rounded-md">
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{trip.description}</p>
                  
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="font-bold text-brand-700">${Number(trip.total_cost || 0).toLocaleString()}</span>
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="flex items-center space-x-1 text-brand-600 hover:underline font-bold"
                    >
                      <span>Open Itinerary</span>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
