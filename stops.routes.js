import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLocalStore } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Helper: Recalculate consecutive stop dates
function recalculateStopDates(tripId, store) {
  const trip = (store.trips || []).find(t => t.id === tripId);
  if (!trip) return;

  const stops = (store.stops || [])
    .filter(s => s.trip_id === tripId)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  if (stops.length === 0) return;

  let currentStart = new Date(trip.start_date);
  
  stops.forEach((stop, idx) => {
    stop.order_index = idx;
    
    // Determine duration of current stop (default 3 days if not set)
    let durationDays = 3;
    if (stop.start_date && stop.end_date) {
      const s = new Date(stop.start_date);
      const e = new Date(stop.end_date);
      const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
      if (!isNaN(diff)) durationDays = diff;
    }

    const stopStart = new Date(currentStart);
    const stopEnd = new Date(stopStart);
    stopEnd.setDate(stopEnd.getDate() + durationDays);

    stop.start_date = stopStart.toISOString().split('T')[0];
    stop.end_date = stopEnd.toISOString().split('T')[0];

    // Next stop starts where this one ends
    currentStart = new Date(stopEnd);
  });
}

// 1. Add stop to trip
router.post('/trips/:tripId/stops', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { city_id, start_date, end_date, target_budget, notes, order_index } = req.body;

    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to add stops to this trip.' });
    }

    const existingStops = (store.stops || []).filter(s => s.trip_id === tripId);
    const newOrderIndex = order_index !== undefined ? Number(order_index) : existingStops.length;

    const newStop = {
      id: uuidv4(),
      trip_id: tripId,
      city_id: city_id || null,
      order_index: newOrderIndex,
      start_date: start_date || trip.start_date,
      end_date: end_date || trip.end_date,
      target_budget: Number(target_budget) || 0,
      notes: notes || ''
    };

    store.stops.push(newStop);
    recalculateStopDates(tripId, store);

    const city = (store.cities || []).find(c => c.id === newStop.city_id) || null;

    res.status(201).json({
      message: 'Stop added successfully!',
      stop: { ...newStop, city, activities: [] }
    });
  } catch (err) {
    console.error('Add stop error:', err);
    res.status(500).json({ error: 'Failed to add stop.' });
  }
});

// 2. Update stop (details, target budget, or order)
router.put('/stops/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { city_id, start_date, end_date, target_budget, notes, order_index } = req.body;

    const store = getLocalStore();
    const stop = (store.stops || []).find(s => s.id === id);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found.' });
    }

    const trip = (store.trips || []).find(t => t.id === stop.trip_id);
    if (trip && trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this stop.' });
    }

    if (city_id !== undefined) stop.city_id = city_id;
    if (target_budget !== undefined) stop.target_budget = Number(target_budget) || 0;
    if (notes !== undefined) stop.notes = notes;
    if (start_date !== undefined) stop.start_date = start_date;
    if (end_date !== undefined) stop.end_date = end_date;

    // If reordering
    if (order_index !== undefined) {
      stop.order_index = Number(order_index);
    }

    if (trip) {
      recalculateStopDates(trip.id, store);
    }

    const city = (store.cities || []).find(c => c.id === stop.city_id) || null;
    res.json({ message: 'Stop updated successfully!', stop: { ...stop, city } });
  } catch (err) {
    console.error('Update stop error:', err);
    res.status(500).json({ error: 'Failed to update stop.' });
  }
});

// 3. Delete stop
router.delete('/stops/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const store = getLocalStore();
    const stop = (store.stops || []).find(s => s.id === id);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found.' });
    }

    const trip = (store.trips || []).find(t => t.id === stop.trip_id);
    if (trip && trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this stop.' });
    }

    // Cascade delete activities
    store.activities = (store.activities || []).filter(a => a.stop_id !== id);
    store.stops = (store.stops || []).filter(s => s.id !== id);

    if (trip) {
      recalculateStopDates(trip.id, store);
    }

    res.json({ message: 'Stop and its activities deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stop.' });
  }
});

export default router;
