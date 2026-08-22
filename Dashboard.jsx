import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import TopBar from '../components/common/TopBar';
import IndiaMap from '../components/common/IndiaMap';
import { Plus, MapPin, Calendar, Compass, ArrowRight, DollarSign, Sparkles, Star } from 'lucide-react';
import { formatINR, formatISTDate } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedSort, setSelectedSort] = useState('');

  const [featuredCities, setFeaturedCities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [citiesRes, tripsRes] = await Promise.all([
          api.getCities({ featured: 'true' }),
          api.getTrips({ user: 'me' })
        ]);
        setFeaturedCities(citiesRes.cities || []);
        setUserTrips(tripsRes.trips || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Filtered Cities for search
  let displayCities = [...featuredCities];
  if (search) {
    const s = search.toLowerCase();
    displayCities = displayCities.filter(c => 
      c.name.toLowerCase().includes(s) || c.country.toLowerCase().includes(s) || (c.region && c.region.toLowerCase().includes(s))
    );
  }

  // Filter & Sort options for TopBar
  const groupByOptions = [
    { value: 'region', label: 'Region (North, South, West, East)' },
    { value: 'cost', label: 'Budget Tier' }
  ];

  const filterOptions = [
    {
      key: 'region',
      label: 'Region',
      options: [
        { value: 'North India', label: 'North India' },
        { value: 'South India', label: 'South India' },
        { value: 'West India', label: 'West India' },
        { value: 'Islands', label: 'Islands' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'cost_asc', label: 'Budget (Low to High)' },
    { value: 'cost_desc', label: 'Luxury (High to Low)' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Hero Promotional Banner with Indian Theme */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 min-h-[340px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop&q=80"
          alt="Incredible India Taj Mahal & Heritage"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-transparent"></div>

        <div className="relative z-10 p-8 sm:p-12 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Incredible India • Smart Travel Planner</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Namaste, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-sky-300">{user?.first_name || 'Explorer'}</span>!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Plan multi-stop trips across Rajasthan palaces, Himalayan snow peaks, Kerala backwaters, and Goa beaches with live INR budget tracking.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/trips/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-adventure-500 to-amber-500 hover:from-adventure-600 hover:to-amber-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-adventure-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>+ Plan a New Trip</span>
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3.5 rounded-2xl font-bold text-sm backdrop-blur-md transition-all"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Destinations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive India Tourism Map */}
      <IndiaMap />

      {/* Reusable TopBar Component */}
      <TopBar
        title="Explore Destinations"
        subtitle="Search Indian destinations or filter recommendations"
        searchPlaceholder="Search destinations, cities, or activities..."
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

      {/* Top Regional Selections (5 Horizontal Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Top Regional Selections</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">Top 5 in India</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Iconic Indian destinations ready to add to your itinerary</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-brand-600 hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayCities.slice(0, 5).map((city) => (
            <div
              key={city.id}
              onClick={() => navigate(`/trips/new?city=${city.id}`)}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[11px] font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{city.popularity}%</span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  {city.region || city.country}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{city.country}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">Cost Tier:</span>
                  <span className="font-bold text-amber-600">{'★'.repeat(Math.round(city.cost_index || 3))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Previous Trips (3 Cards Horizontal Row) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Trips & Itineraries</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to your ongoing, upcoming, and completed travel plans</p>
          </div>
          <Link to="/trips" className="text-xs font-bold text-brand-600 hover:underline flex items-center space-x-1">
            <span>Manage All Trips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {userTrips.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800">No trips planned yet!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start building your first multi-stop Indian itinerary with live INR expense tracking.
            </p>
            <Link
              to="/trips/new"
              className="inline-flex items-center space-x-1.5 bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-brand-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userTrips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.cover_photo_url}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md text-white ${
                      trip.status === 'ongoing' ? 'bg-emerald-500/90' :
                      trip.status === 'upcoming' ? 'bg-sky-500/90' : 'bg-slate-600/90'
                    }`}>
                      {trip.status}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-lg tracking-tight truncate group-hover:text-sky-300 transition-colors">
                      {trip.name}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatISTDate(trip.start_date)} → {formatISTDate(trip.end_date)}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {trip.description || 'Explore scenic cities, historical monuments, and culinary hotspots.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">{trip.stop_count || 0} Stops</span>
                    <span className="font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                      {formatINR(trip.total_cost || trip.target_budget)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          to="/trips/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-adventure-500 to-amber-500 hover:from-adventure-600 hover:to-amber-600 text-white px-5 py-3.5 rounded-full font-black text-sm shadow-2xl shadow-adventure-500/40 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>+ Plan a trip</span>
        </Link>
      </div>
    </div>
  );
}
