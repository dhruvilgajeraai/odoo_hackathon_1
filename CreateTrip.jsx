import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { MapPin, Calendar, Compass, ArrowRight, Sparkles, Check, Plus } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCityId = searchParams.get('city');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default 7 days
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 7);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);
  
  const [targetBudget, setTargetBudget] = useState('35000'); // INR default
  const [selectedCityId, setSelectedCityId] = useState(preselectedCityId || '');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  const [cities, setCities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await api.getCities();
        setCities(res.cities || []);
        if (preselectedCityId) {
          const matched = res.cities.find(c => c.id === preselectedCityId);
          if (matched) {
            setSelectedCityId(matched.id);
            setName(`${matched.name} Getaway`);
            setCoverPhotoUrl(matched.image_url);
          }
        } else if (res.cities.length > 0) {
          setSelectedCityId(res.cities[0].id);
          setName(`${res.cities[0].name} Journey`);
          setCoverPhotoUrl(res.cities[0].image_url);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    loadCatalog();
  }, [preselectedCityId]);

  useEffect(() => {
    async function loadSuggestions() {
      if (!selectedCityId) return;
      try {
        const res = await api.getActivities({ city_id: selectedCityId });
        setSuggestions((res.activities || []).slice(0, 6));
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    }
    loadSuggestions();
  }, [selectedCityId]);

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    const matched = cities.find(c => c.id === cityId);
    if (matched) {
      setName(`${matched.name} Journey`);
      setCoverPhotoUrl(matched.image_url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !startDate || !endDate) {
      setError('Please fill in trip name and dates.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createTrip({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        target_budget: Number(targetBudget) || 0,
        cover_photo_url: coverPhotoUrl,
        initial_city_id: selectedCityId
      });

      navigate(`/trips/${res.trip.id}/build`);
    } catch (err) {
      setError(err.message || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-black uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Step 1 of 2</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Plan a New Indian Trip</h1>
        <p className="text-sm text-slate-500">
          Set up your core trip details, choose your starting destination, and explore curated activity recommendations.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trip Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Trip Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Rajasthan Heritage, Goa Beach Bliss, Manali Snow Expedition"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Select a Place (Destination City Picker) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Starting Place / Primary Destination *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCityChange(city.id)}
                    className={`relative rounded-2xl overflow-hidden border-2 text-left p-3 flex flex-col justify-between transition-all ${
                      selectedCityId === city.id
                        ? 'border-brand-600 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="h-16 w-full rounded-xl overflow-hidden mb-2">
                      <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-900">{city.name}</p>
                        <p className="text-[10px] text-slate-500">{city.region || city.country}</p>
                      </div>
                      {selectedCityId === city.id && (
                        <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Target Budget in INR */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Budget (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  placeholder="35000"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Trip Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key highlights, travel companions, photography spots..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Suggestion for Places to Visit / Activities to perform (6 Cards Grid: 2 rows x 3 cols) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Suggestions for Places to Visit & Activities to Perform</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Popular recommended attractions in your selected Indian destination
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggestions.map((act) => (
              <div
                key={act.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md">
                      {act.category}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {formatINR(act.cost)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{act.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.location_notes || 'Iconic Indian attraction'}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>⏱ {act.duration_minutes} mins</span>
                  <span className="text-brand-600 font-semibold flex items-center space-x-1">
                    <span>Available in Itinerary</span>
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save & Continue Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-adventure-500 to-amber-500 hover:from-adventure-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-adventure-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Trip...' : 'Save & Build Itinerary'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
