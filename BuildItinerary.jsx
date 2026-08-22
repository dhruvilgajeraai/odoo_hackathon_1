import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Plus, MapPin, Calendar, DollarSign, ArrowUp, ArrowDown, Trash2, 
  Clock, CheckCircle, Eye, Edit3, X, Sparkles, Navigation 
} from 'lucide-react';
import { formatINR, formatISTDate } from '../utils/formatters';

export default function BuildItinerary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addActivityStopId, setAddActivityStopId] = useState(null);
  const [cities, setCities] = useState([]);

  // Add Section form
  const [newCityId, setNewCityId] = useState('');
  const [newSectionBudget, setNewSectionBudget] = useState('15000');
  const [newSectionNotes, setNewSectionNotes] = useState('');

  // Add Activity form
  const [activityForm, setActivityForm] = useState({
    name: '',
    category: 'sightseeing',
    cost: '1000',
    duration_minutes: '90',
    day_number: '1',
    time_slot: 'morning',
    location_notes: ''
  });

  const loadTripData = async () => {
    try {
      const res = await api.getFullTrip(id);
      setTrip(res.trip);
    } catch (err) {
      setError(err.message || 'Failed to load itinerary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
    api.getCities().then(res => setCities(res.cities || [])).catch(console.error);
  }, [id]);

  // Add new stop/section
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newCityId) return;

    try {
      await api.addStop(id, {
        city_id: newCityId,
        target_budget: Number(newSectionBudget) || 0,
        notes: newSectionNotes
      });
      setAddSectionOpen(false);
      setNewCityId('');
      setNewSectionNotes('');
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to add section.');
    }
  };

  // Reorder stop (up or down)
  const handleMoveStop = async (stopId, currentIdx, direction) => {
    const newIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (newIdx < 0 || newIdx >= trip.stops.length) return;

    try {
      await api.updateStop(stopId, { order_index: newIdx });
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to reorder stops.');
    }
  };

  // Delete stop
  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Are you sure you want to remove this section and all its activities?')) return;
    try {
      await api.deleteStop(stopId);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to delete section.');
    }
  };

  // Add activity to stop
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.name || !addActivityStopId) return;

    try {
      await api.addActivity(addActivityStopId, {
        ...activityForm,
        cost: Number(activityForm.cost) || 0,
        duration_minutes: Number(activityForm.duration_minutes) || 60,
        day_number: Number(activityForm.day_number) || 1
      });
      setAddActivityStopId(null);
      setActivityForm({
        name: '',
        category: 'sightseeing',
        cost: '1000',
        duration_minutes: '90',
        day_number: '1',
        time_slot: 'morning',
        location_notes: ''
      });
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to add activity.');
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activityId) => {
    try {
      await api.deleteActivity(activityId);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to delete activity.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Trip not found</h2>
        <Link to="/trips" className="text-brand-600 underline mt-2 block">Return to My Trips</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-black uppercase tracking-wider">
            <Edit3 className="w-4 h-4" />
            <span>Itinerary Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{trip.name}</h1>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center space-x-2 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatISTDate(trip.start_date)} → {formatISTDate(trip.end_date)}</span>
            <span>•</span>
            <span>Target Budget: {formatINR(trip.target_budget)}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link
            to={`/trips/${trip.id}`}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>View Full Itinerary & Budget</span>
          </Link>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {trip.stops.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
            <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No stops or sections added yet!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add your first Indian city stop to begin scheduling hotels, transport, and daily sightseeing activities.
            </p>
            <button
              onClick={() => setAddSectionOpen(true)}
              className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-brand-700"
            >
              + Add Section (City Stop)
            </button>
          </div>
        ) : (
          trip.stops.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 font-black text-sm flex items-center justify-center border border-brand-100">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                      <span>Section {index + 1}: {stop.city ? stop.city.name : 'Custom City'}</span>
                      {stop.city && <span className="text-xs text-slate-500 font-normal">({stop.city.country})</span>}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Date Range: <span className="text-slate-700 font-semibold">{formatISTDate(stop.start_date)} to {formatISTDate(stop.end_date)}</span>
                    </p>
                  </div>
                </div>

                {/* Section Controls: Reorder & Delete */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveStop(stop.id, index, 'up')}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    title="Move section up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === trip.stops.length - 1}
                    onClick={() => handleMoveStop(stop.id, index, 'down')}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    title="Move section down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section Details / Budget Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Description & Travel Notes</span>
                  <p className="text-slate-700 mt-0.5">
                    {stop.notes || 'All the necessary information about this section (travel, hotels, reservations).'}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Section Target Budget</span>
                    <span className="font-black text-slate-800 text-sm">{formatINR(stop.target_budget)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Actual Total Spent</span>
                    <span className={`font-black text-sm ${stop.total_cost > stop.target_budget && stop.target_budget > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {formatINR(stop.total_cost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activities in this Stop */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Activities in this Section ({stop.activities?.length || 0})
                  </h4>
                  <button
                    onClick={() => setAddActivityStopId(stop.id)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {stop.activities?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No activities added yet. Click "+ Add Activity" to schedule sightseeing, dinners, or stays.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {stop.activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl hover:border-brand-200 transition-all text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Day {act.day_number} • {act.time_slot}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900">{act.name}</span>
                            <span className="ml-2 text-slate-400 text-[11px] capitalize">({act.category})</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {formatINR(act.cost)}
                          </span>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* "+ Add another Section" button at the bottom */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setAddSectionOpen(true)}
            className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/40 rounded-3xl flex items-center justify-center space-x-2 text-slate-600 hover:text-brand-700 font-black text-sm transition-all"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>+ Add another Section (Next City Stop)</span>
          </button>
        </div>
      </div>

      {/* Modal: Add Section / Stop */}
      {addSectionOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Add Next Stop / Section</h3>
              <button onClick={() => setAddSectionOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600">Select Indian City / Destination</label>
                <select
                  required
                  value={newCityId}
                  onChange={(e) => setNewCityId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="">-- Choose an Indian city --</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600">Target Budget for this Stop (₹)</label>
                <input
                  type="number"
                  value={newSectionBudget}
                  onChange={(e) => setNewSectionBudget(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600">Notes / Hotel & Transport Details</label>
                <textarea
                  rows="3"
                  value={newSectionNotes}
                  onChange={(e) => setNewSectionNotes(e.target.value)}
                  placeholder="Hotel reservations, train connections, notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-brand-700"
              >
                Add Section to Itinerary
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Activity */}
      {addActivityStopId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Add Activity to Section</h3>
              <button onClick={() => setAddActivityStopId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Activity Name *</label>
                <input
                  type="text"
                  required
                  value={activityForm.name}
                  onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                  placeholder="e.g. Scuba Diving, Temple Tour, Sunset Cruise"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600">Category</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="activity">Activity & Outdoor</option>
                    <option value="food">Food & Dining</option>
                    <option value="stay">Stay / Resort</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-600">Cost (₹)</label>
                  <input
                    type="number"
                    value={activityForm.cost}
                    onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600">Day #</label>
                  <input
                    type="number"
                    min="1"
                    value={activityForm.day_number}
                    onChange={(e) => setActivityForm({ ...activityForm, day_number: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600">Time Slot</label>
                  <select
                    value={activityForm.time_slot}
                    onChange={(e) => setActivityForm({ ...activityForm, time_slot: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600">Duration (m)</label>
                  <input
                    type="number"
                    value={activityForm.duration_minutes}
                    onChange={(e) => setActivityForm({ ...activityForm, duration_minutes: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Location Notes</label>
                <input
                  type="text"
                  value={activityForm.location_notes}
                  onChange={(e) => setActivityForm({ ...activityForm, location_notes: e.target.value })}
                  placeholder="Address or landmark in India"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-brand-700 mt-2"
              >
                Save Activity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
