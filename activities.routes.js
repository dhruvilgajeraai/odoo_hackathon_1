import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLocalStore } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// 1. Add activity to a stop
router.post('/stops/:stopId/activities', authenticateToken, async (req, res) => {
  try {
    const { stopId } = req.params;
    const { name, category, cost, duration_minutes, day_number, time_slot, source, location_notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Activity name is required.' });
    }

    const store = getLocalStore();
    const stop = (store.stops || []).find(s => s.id === stopId);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found.' });
    }

    const trip = (store.trips || []).find(t => t.id === stop.trip_id);
    if (trip && trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to add activities to this trip.' });
    }

    const newActivity = {
      id: uuidv4(),
      stop_id: stopId,
      name: name.trim(),
      category: category || 'activity',
      cost: Number(cost) || 0,
      duration_minutes: Number(duration_minutes) || 60,
      day_number: Number(day_number) || 1,
      time_slot: time_slot || 'morning',
      source: source || 'user',
      location_notes: location_notes || ''
    };

    store.activities.push(newActivity);

    res.status(201).json({
      message: 'Activity added successfully!',
      activity: newActivity
    });
  } catch (err) {
    console.error('Add activity error:', err);
    res.status(500).json({ error: 'Failed to add activity.' });
  }
});

// 2. Update activity
router.put('/activities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, cost, duration_minutes, day_number, time_slot, location_notes } = req.body;

    const store = getLocalStore();
    const activity = (store.activities || []).find(a => a.id === id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found.' });
    }

    const stop = (store.stops || []).find(s => s.id === activity.stop_id);
    const trip = stop ? (store.trips || []).find(t => t.id === stop.trip_id) : null;

    if (trip && trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this activity.' });
    }

    if (name !== undefined) activity.name = name.trim();
    if (category !== undefined) activity.category = category;
    if (cost !== undefined) activity.cost = Number(cost) || 0;
    if (duration_minutes !== undefined) activity.duration_minutes = Number(duration_minutes) || 60;
    if (day_number !== undefined) activity.day_number = Number(day_number) || 1;
    if (time_slot !== undefined) activity.time_slot = time_slot;
    if (location_notes !== undefined) activity.location_notes = location_notes;

    res.json({ message: 'Activity updated successfully!', activity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update activity.' });
  }
});

// 3. Delete activity
router.delete('/activities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const store = getLocalStore();
    const activity = (store.activities || []).find(a => a.id === id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found.' });
    }

    const stop = (store.stops || []).find(s => s.id === activity.stop_id);
    const trip = stop ? (store.trips || []).find(t => t.id === stop.trip_id) : null;

    if (trip && trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this activity.' });
    }

    store.activities = (store.activities || []).filter(a => a.id !== id);

    res.json({ message: 'Activity deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete activity.' });
  }
});

export default router;
