import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import TopBar from '../components/common/TopBar';
import { 
  MapPin, Calendar, Plus, Eye, Edit3, Trash2, Share2, 
  CheckCircle2, Clock, Compass, DollarSign, Copy 
} from 'lucide-react';
import { formatINR, formatISTDate } from '../utils/formatters';

export default function MyTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedSort, setSelectedSort] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [shareModalData, setShareModalData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const loadTrips = async () => {
    try {
      const res = await api.getTrips({ user: 'me' });
      setTrips(res.trips || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async (e, tripId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this trip and its itinerary?')) return;
    try {
      await api.deleteTrip(tripId);
      loadTrips();
    } catch (err) {
      alert(err.message || 'Failed to delete trip.');
    }
  };

  const handleShare = async (e, trip) => {
    e.stopPropagation();
    try {
      const res = await api.shareTrip(trip.id);
      setShareModalData({
        name: trip.name,
        slug: res.share_slug,
        url: `${window.location.origin}/t/${res.share_slug}`
      });
    } catch (err) {
      alert('Failed to generate share link.');
    }
  };

  let filtered = [...trips];
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(s) || 
      (t.description && t.description.toLowerCase().includes(s)) ||
      (t.cities && t.cities.some(c => c.toLowerCase().includes(s)))
    );
  }

  if (selectedFilters.status) {
    filtered = filtered.filter(t => t.status === selectedFilters.status);
  }

  if (selectedSort === 'cost_desc') {
    filtered.sort((a, b) => (b.total_cost || 0) - (a.total_cost || 0));
  } else if (selectedSort === 'cost_asc') {
    filtered.sort((a, b) => (a.total_cost || 0) - (b.total_cost || 0));
  } else if (selectedSort === 'date_desc') {
    filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }

  const ongoingTrips = filtered.filter(t => t.status === 'ongoing');
  const upcomingTrips = filtered.filter(t => t.status === 'upcoming');
  const completedTrips = filtered.filter(t => t.status === 'completed');

  const groupByOptions = [
    { value: 'status', label: 'Trip Status' }
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'completed', label: 'Completed' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Date (Newest First)' },
    { value: 'cost_desc', label: 'Budget (High to Low)' },
    { value: 'cost_asc', label: 'Budget (Low to High)' }
  ];

  const renderTripCard = (trip) => (
    <div
      key={trip.id}
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="relative h-48 overflow-hidden">
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md text-white ${
              trip.status === 'ongoing' ? 'bg-emerald-500/90' :
              trip.status === 'upcoming' ? 'bg-sky-500/90' : 'bg-slate-600/90'
            }`}>
              {trip.status}
            </span>
          </div>

          {/* Quick Actions overlay */}
          <div className="absolute top-3 right-3 flex items-center space-x-1">
            <button
              onClick={(e) => handleShare(e, trip)}
              className="p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all"
              title="Share public link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleDelete(e, trip.id)}
              className="p-2 bg-black/50 hover:bg-red-600/90 backdrop-blur-md text-white rounded-full transition-all"
              title="Delete trip"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="font-black text-lg tracking-tight truncate group-hover:text-sky-300 transition-colors">
              {trip.name}
            </h3>
            <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatISTDate(trip.start_date)} → {formatISTDate(trip.end_date)}</span>
            </p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 line-clamp-2">
            {trip.description || 'Explore curated Indian stops, historical landmarks, and daily activities.'}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(trip.cities || []).slice(0, 3).map((city, i) => (
              <span key={i} className="inline-flex items-center text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                <MapPin className="w-2.5 h-2.5 mr-1 text-slate-400" />
                {city}
              </span>
            ))}
            {(trip.cities || []).length > 3 && (
              <span className="text-[10px] font-bold text-slate-400">+{trip.cities.length - 3} more</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Spend</span>
            <span className="font-black text-brand-700 text-sm">
              {formatINR(trip.total_cost || trip.target_budget)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/trips/${trip.id}/build`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
              title="Edit Itinerary"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <Link
              to={`/trips/${trip.id}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center space-x-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Trips</h1>
          <p className="text-sm text-slate-500">Track and organize all your past, present, and upcoming Indian adventures</p>
        </div>
        <Link
          to="/trips/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-adventure-500 to-amber-500 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-md shadow-adventure-500/20 hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Plan a New Trip</span>
        </Link>
      </div>

      {/* Reusable TopBar */}
      <TopBar
        searchPlaceholder="Search your trips by name, destination, or notes..."
        searchValue={search}
        onSearchChange={setSearch}
        groupByOptions={groupByOptions}
        selectedGroupBy={selectedGroupBy}
        onGroupByChange={setSelectedGroupBy}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={setSelectedFilters}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* Tabs Filter Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Trips', count: filtered.length },
          { id: 'ongoing', label: 'Ongoing', count: ongoingTrips.length },
          { id: 'upcoming', label: 'Up-coming', count: upcomingTrips.length },
          { id: 'completed', label: 'Completed', count: completedTrips.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sections View */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-slate-400 mx-auto animate-spin-slow" />
          <h3 className="text-lg font-bold text-slate-800">No trips found matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or plan a new custom trip now.
          </p>
        </div>
      ) : activeTab === 'all' ? (
        <div className="space-y-10">
          {/* Ongoing Section */}
          {ongoingTrips.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Ongoing Adventures</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ongoingTrips.map(renderTripCard)}
              </div>
            </section>
          )}

          {/* Upcoming Section */}
          {upcomingTrips.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-sky-500" />
                <span>Up-coming Expeditions</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingTrips.map(renderTripCard)}
              </div>
            </section>
          )}

          {/* Completed Section */}
          {completedTrips.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-slate-400" />
                <span>Completed Journeys</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {completedTrips.map(renderTripCard)}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(activeTab === 'ongoing' ? ongoingTrips :
            activeTab === 'upcoming' ? upcomingTrips : completedTrips).map(renderTripCard)}
        </div>
      )}

      {/* Share Modal */}
      {shareModalData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Share Public Itinerary</h3>
              <button onClick={() => { setShareModalData(null); setCopySuccess(false); }} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Anyone with this link can view your complete day-by-day itinerary and clone it into their own account.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-mono text-slate-700 truncate mr-2">{shareModalData.url}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareModalData.url);
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
