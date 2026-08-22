import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import TopBar from '../components/common/TopBar';
import { 
  Search, MapPin, DollarSign, Clock, Plus, Check, Compass, 
  Sparkles, Layers, Filter, ArrowUpDown, ChevronRight, X 
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function SearchExplore() {
  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedSort, setSelectedSort] = useState('');

  // Add to Trip Modal
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [tripStops, setTripStops] = useState([]);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [actRes, cityRes, tripsRes] = await Promise.all([
          api.getActivities(),
          api.getCities(),
          api.getTrips({ user: 'me' })
        ]);
        setActivities(actRes.activities || []);
        setCities(cityRes.cities || []);
        setUserTrips(tripsRes.trips || []);
      } catch (err) {
        console.error('Failed to load search catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setTripStops([]);
      setSelectedStopId('');
      return;
    }
    api.getFullTrip(selectedTripId).then(res => {
      setTripStops(res.trip?.stops || []);
      if (res.trip?.stops?.length > 0) {
        setSelectedStopId(res.trip.stops[0].id);
      }
    }).catch(console.error);
  }, [selectedTripId]);

  const handleAddToTrip = async (e) => {
    e.preventDefault();
    if (!selectedActivity || !selectedStopId) return;

    try {
      await api.addActivity(selectedStopId, {
        name: selectedActivity.name,
        category: selectedActivity.category,
        cost: selectedActivity.cost,
        duration_minutes: selectedActivity.duration_minutes,
        day_number: 1,
        time_slot: 'morning',
        source: 'catalog',
        location_notes: selectedActivity.location_notes
      });
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setSelectedActivity(null);
      }, 1800);
    } catch (err) {
      alert(err.message || 'Failed to add activity to trip.');
    }
  };

  // Filter & Search Logic
  let filtered = [...activities];

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(s) ||
      (a.category && a.category.toLowerCase().includes(s)) ||
      (a.city_name && a.city_name.toLowerCase().includes(s)) ||
      (a.city_country && a.city_country.toLowerCase().includes(s))
    );
  }

  if (selectedFilters.category) {
    filtered = filtered.filter(a => (a.category || '').toLowerCase() === selectedFilters.category.toLowerCase());
  }

  if (selectedFilters.cost_range) {
    const [min, max] = selectedFilters.cost_range.split('-').map(Number);
    filtered = filtered.filter(a => {
      const c = Number(a.cost) || 0;
      return c >= min && (max ? c <= max : true);
    });
  }

  if (selectedSort === 'cost_asc') {
    filtered.sort((a, b) => Number(a.cost) - Number(b.cost));
  } else if (selectedSort === 'cost_desc') {
    filtered.sort((a, b) => Number(b.cost) - Number(a.cost));
  } else if (selectedSort === 'duration') {
    filtered.sort((a, b) => Number(a.duration_minutes) - Number(b.duration_minutes));
  }

  // TopBar Configuration
  const groupByOptions = [
    { value: 'category', label: 'Category (Sightseeing, Food...)' },
    { value: 'city', label: 'City Destination' }
  ];

  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'sightseeing', label: 'Sightseeing' },
        { value: 'activity', label: 'Outdoor & Adventure' },
        { value: 'food', label: 'Food & Dining' },
        { value: 'stay', label: 'Stays & Resorts' },
        { value: 'transport', label: 'Transport' }
      ]
    },
    {
      key: 'cost_range',
      label: 'Price Range (₹)',
      options: [
        { value: '0-1000', label: 'Budget (₹0 - ₹1,000)' },
        { value: '1000-5000', label: 'Moderate (₹1,000 - ₹5,000)' },
        { value: '5000-50000', label: 'Premium (₹5,000+)' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'cost_asc', label: 'Price: Low to High' },
    { value: 'cost_desc', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Indian Activities & Destinations</h1>
        <p className="text-sm text-slate-500">
          Discover top-rated excursions, heritage temple walks, street food tastings, and instantly add them to your trip.
        </p>
      </div>

      {/* Cross-Screen TopBar */}
      <TopBar
        searchPlaceholder="Try searching 'Scuba', 'Houseboat', 'Amer Fort', 'Ganga Aarti', or city..."
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

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-xl font-extrabold text-slate-900">
            Results ({filtered.length} activities found)
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-2">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800">No activities found</h3>
            <p className="text-xs text-slate-500">Try adjusting your keyword or clearing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((act) => (
              <div
                key={act.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg">
                      {act.category}
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {formatINR(act.cost)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">{act.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{act.city_name} {act.city_country ? `(${act.city_country})` : ''}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {act.location_notes || 'Must-visit Indian attraction offering authentic regional experience.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.duration_minutes || 60} mins</span>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedActivity(act);
                      if (userTrips.length > 0) setSelectedTripId(userTrips[0].id);
                    }}
                    className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Add to Your Itinerary</h3>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-brand-50/60 rounded-2xl border border-brand-100">
              <p className="text-xs font-bold text-brand-900">{selectedActivity.name}</p>
              <p className="text-[11px] text-brand-600 mt-0.5">
                Cost: {formatINR(selectedActivity.cost)} • Duration: {selectedActivity.duration_minutes}m
              </p>
            </div>

            {addSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1 text-emerald-800">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold">Activity Added to Your Itinerary!</p>
              </div>
            ) : (
              <form onSubmit={handleAddToTrip} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600">Select Trip</label>
                  {userTrips.length === 0 ? (
                    <p className="text-xs text-red-500">You don't have any trips yet. Please plan a trip first!</p>
                  ) : (
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      {userTrips.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {tripStops.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Select Stop / Section</label>
                    <select
                      value={selectedStopId}
                      onChange={(e) => setSelectedStopId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      {tripStops.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          Section {idx + 1}: {s.city ? s.city.name : 'City Stop'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedStopId}
                  className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-brand-700 disabled:opacity-50"
                >
                  Confirm & Add Activity
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
