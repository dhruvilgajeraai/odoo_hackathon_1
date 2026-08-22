import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, Mail, Phone, MapPin, Globe, Camera, Edit3, Save, 
  Check, Calendar, Eye, Compass, Shield, Sparkles, Upload, Image 
} from 'lucide-react';
import { formatINR, formatISTDate } from '../utils/formatters';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    country: '',
    bio: '',
    photo_url: ''
  });

  const [preplannedTrips, setPreplannedTrips] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [photoUploadedNotice, setPhotoUploadedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || '',
        photo_url: user.photo_url || ''
      });
    }

    async function loadTrips() {
      try {
        const res = await api.getTrips({ user: 'me' });
        const allTrips = res.trips || [];
        const todayStr = new Date().toISOString().split('T')[0];

        const upcoming = allTrips.filter(t => t.start_date >= todayStr);
        const completed = allTrips.filter(t => t.end_date < todayStr);

        setPreplannedTrips(upcoming.slice(0, 3));
        setPreviousTrips(completed.slice(0, 3));
      } catch (err) {
        console.error('Error loading trips for profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Custom Local File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setFormData(prev => ({ ...prev, photo_url: base64Data }));
      setPhotoUploadedNotice(true);
      setTimeout(() => setPhotoUploadedNotice(false), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(formData);
      updateUser(res.user);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header & Info Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            
            {/* Circular User Image with Direct File Upload Trigger */}
            <div className="relative group">
              <img
                src={formData.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name}`}
                alt={user?.first_name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-brand-500/20 shadow-lg"
              />

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Upload Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 hover:bg-black/70 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-2 text-center"
                title="Upload custom photo from your computer"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Change Photo</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {user?.first_name} {user?.last_name}
                </h1>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start space-x-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </p>
              {(user?.city || user?.country) && (
                <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.city}{user?.city && user?.country ? ', ' : ''}{user?.country}</span>
                </p>
              )}

              {/* Quick photo upload button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo from Device</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-brand-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center space-x-1.5 bg-brand-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-brand-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {photoUploadedNotice && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center space-x-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Custom photo selected! Click <strong>"Save Changes"</strong> to permanently save your profile photo.</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile details & custom photo successfully updated!</span>
          </div>
        )}

        {/* User Details Form / View */}
        {isEditing ? (
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase">City & Country</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="India"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-600 uppercase">Bio & Travel Preferences</label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              ></textarea>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Traveler</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {user?.bio || 'Passionate explorer discovering incredible Indian heritage and mountain trails.'}
            </p>
          </div>
        )}
      </div>

      {/* Preplanned Trips Section (3 Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Preplanned Trips (Upcoming)</h2>
            <p className="text-xs text-slate-500">Upcoming journeys scheduled on your itinerary</p>
          </div>
          <Link to="/trips" className="text-xs font-bold text-brand-600 hover:underline">
            View All
          </Link>
        </div>

        {preplannedTrips.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-500">
            No upcoming trips planned. Click below to schedule one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {preplannedTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-36 overflow-hidden relative">
                  <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Upcoming
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                    {formatINR(trip.total_cost || trip.target_budget)}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{trip.name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatISTDate(trip.start_date)} → {formatISTDate(trip.end_date)}</span>
                    </p>
                  </div>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="w-full flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Itinerary</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Previous Trips Section (3 Cards) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Previous Trips (Completed)</h2>
            <p className="text-xs text-slate-500">Past journeys and archived memories</p>
          </div>
          <Link to="/trips" className="text-xs font-bold text-brand-600 hover:underline">
            View All
          </Link>
        </div>

        {previousTrips.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-500">
            No completed trips archived yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {previousTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-36 overflow-hidden relative">
                  <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover grayscale-[30%]" />
                  <div className="absolute top-2.5 left-2.5 bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Completed
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                    {formatINR(trip.total_cost || trip.target_budget)}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{trip.name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatISTDate(trip.start_date)} → {formatISTDate(trip.end_date)}</span>
                    </p>
                  </div>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="w-full flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Itinerary</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
