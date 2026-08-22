import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Calendar, MapPin, DollarSign, Clock, ArrowDown, Copy, 
  Share2, Compass, Check, AlertCircle, ArrowRight, Globe 
} from 'lucide-react';
import { formatINR, formatISTDate } from '../utils/formatters';

const CATEGORY_COLORS = {
  sightseeing: '#0284c7',
  activity: '#f59e0b',
  food: '#ef4444',
  stay: '#8b5cf6',
  transport: '#10b981'
};

export default function PublicTripView() {
  const { share_slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function loadPublicTrip() {
      try {
        const res = await api.getPublicTrip(share_slug);
        setTrip(res.trip);
      } catch (err) {
        setError(err.message || 'This trip is either private or does not exist.');
      } finally {
        setLoading(false);
      }
    }
    loadPublicTrip();
  }, [share_slug]);

  const handleCopyTrip = async () => {
    if (!user) {
      navigate(`/login?redirect=/t/${share_slug}`);
      return;
    }

    setCopying(true);
    try {
      const res = await api.copyTrip(trip.id);
      navigate(`/trips/${res.trip.id}/build`);
    } catch (err) {
      alert(err.message || 'Failed to copy trip to your account.');
      setCopying(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const shareOnTwitter = () => {
    const text = `Check out this amazing Indian itinerary: "${trip?.name}" on GlobeTrotter!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = `Check out this Indian trip itinerary: ${trip?.name} - ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Trip Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'This trip link could not be found.'}</p>
        <Link to="/explore" className="inline-block bg-brand-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md">
          Explore Indian Destinations
        </Link>
      </div>
    );
  }

  const dayGroups = {};
  (trip.stops || []).forEach(stop => {
    (stop.activities || []).forEach(act => {
      const day = act.day_number || 1;
      if (!dayGroups[day]) dayGroups[day] = [];
      dayGroups[day].push({
        ...act,
        cityName: stop.city?.name || 'City Stop'
      });
    });
  });

  const sortedDays = Object.keys(dayGroups).map(Number).sort((a, b) => a - b);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Read-Only Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 min-h-[300px] flex items-end p-6 sm:p-10">
        <img
          src={trip.cover_photo_url}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent"></div>

        <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-white">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full backdrop-blur-md">
              <Globe className="w-3.5 h-3.5" />
              <span>Public Shared Itinerary</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{trip.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">{trip.description}</p>

            <div className="flex items-center space-x-3 pt-1">
              <img
                src={trip.creator?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.creator?.name}`}
                alt={trip.creator?.name}
                className="w-8 h-8 rounded-full ring-2 ring-white/40 object-cover"
              />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px]">Curated by</span>
                <span className="font-bold text-white">{trip.creator?.name}</span>
              </div>
            </div>
          </div>

          {/* Copy Trip CTA */}
          <div className="flex flex-col sm:items-end space-y-2">
            <button
              onClick={handleCopyTrip}
              disabled={copying}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-adventure-500 to-amber-500 hover:from-adventure-600 hover:to-amber-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-adventure-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Copy className="w-4 h-4 stroke-[2.5]" />
              <span>{copying ? 'Cloning Itinerary...' : 'Copy Trip to My Account'}</span>
            </button>
            <span className="text-[11px] text-slate-400">Clone and customize this full plan in INR</span>
          </div>
        </div>
      </div>

      {/* Social Sharing Bar & Quick Stats */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 font-semibold">Share this trip:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={shareOnWhatsApp}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold"
            >
              WhatsApp
            </button>
            <button
              onClick={shareOnTwitter}
              className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg font-bold"
            >
              Twitter / X
            </button>
            <button
              onClick={shareOnFacebook}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold"
            >
              Facebook
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold flex items-center space-x-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copySuccess ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-600 font-medium">
          <span>{trip.stops?.length || 0} Stops</span>
          <span>•</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Est. Budget: {formatINR(trip.total_cost || trip.target_budget)}
          </span>
        </div>
      </div>

      {/* Day-Wise Public Timeline */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Day-by-Day Journey Plan
        </h2>

        <div className="space-y-8">
          {sortedDays.map((dayNum) => {
            const dayActivities = dayGroups[dayNum] || [];

            return (
              <div key={dayNum} className="space-y-4">
                <div className="flex items-center space-x-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl">
                  <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                    {dayNum}
                  </span>
                  <h3 className="font-extrabold text-sm tracking-tight">Day {dayNum}</h3>
                </div>

                <div className="space-y-3 pl-4 border-l-2 border-slate-200 ml-4">
                  {dayActivities.map((act, idx) => (
                    <div key={act.id} className="space-y-3">
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {act.time_slot}
                            </span>
                            <span
                              className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-white"
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
                            <p className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{act.location_notes}</span>
                            </p>
                          )}
                        </div>

                        <div className="font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl self-start sm:self-center">
                          {formatINR(act.cost)}
                        </div>
                      </div>

                      {idx < dayActivities.length - 1 && (
                        <div className="flex justify-center -my-1">
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
