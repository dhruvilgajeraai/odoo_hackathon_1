import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getLocalStore, isPostgres } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function generateSlug(name) {
  const clean = (name || 'trip')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${clean}-${randomSuffix}`;
}

// 1. List user trips (with status filter & search)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, q } = req.query;
    const store = getLocalStore();

    let trips = [];
    if (isPostgres) {
      const resTrips = await query('SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date ASC', [req.user.id]);
      trips = resTrips.rows;
    } else {
      trips = (store.trips || []).filter(t => t.user_id === req.user.id);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter by status if provided
    if (status === 'ongoing') {
      trips = trips.filter(t => t.start_date <= todayStr && t.end_date >= todayStr);
    } else if (status === 'upcoming') {
      trips = trips.filter(t => t.start_date > todayStr);
    } else if (status === 'completed') {
      trips = trips.filter(t => t.end_date < todayStr);
    }

    // Filter by search query
    if (q) {
      const search = q.toLowerCase();
      trips = trips.filter(t => 
        (t.name && t.name.toLowerCase().includes(search)) || 
        (t.description && t.description.toLowerCase().includes(search))
      );
    }

    // Enrich with stops and total calculated cost
    const enrichedTrips = trips.map(trip => {
      const stops = (store.stops || []).filter(s => s.trip_id === trip.id);
      const stopIds = stops.map(s => s.id);
      const activities = (store.activities || []).filter(a => stopIds.includes(a.stop_id));
      const totalCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

      // Cities visited
      const cities = stops.map(s => {
        const cityObj = (store.cities || []).find(c => c.id === s.city_id);
        return cityObj ? cityObj.name : 'Unknown City';
      });

      let calculatedStatus = 'upcoming';
      if (trip.start_date <= todayStr && trip.end_date >= todayStr) calculatedStatus = 'ongoing';
      else if (trip.end_date < todayStr) calculatedStatus = 'completed';

      return {
        ...trip,
        status: calculatedStatus,
        stop_count: stops.length,
        cities,
        total_cost: totalCost
      };
    });

    res.json({ trips: enrichedTrips });
  } catch (err) {
    console.error('List trips error:', err);
    res.status(500).json({ error: 'Failed to fetch trips.' });
  }
});

// 2. Create a new trip
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, cover_photo_url, start_date, end_date, target_budget, initial_city_id } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Trip name, start date, and end date are required.' });
    }

    const tripId = uuidv4();
    const shareSlug = generateSlug(name);
    const defaultCover = cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&auto=format&fit=crop&q=80';

    const newTrip = {
      id: tripId,
      user_id: req.user.id,
      name: name.trim(),
      description: description || '',
      cover_photo_url: defaultCover,
      start_date,
      end_date,
      target_budget: Number(target_budget) || 0,
      is_public: false,
      share_slug: shareSlug,
      created_at: new Date().toISOString()
    };

    const store = getLocalStore();
    store.trips.push(newTrip);

    // If initial city provided (from Screen 4 place selector), create initial stop!
    if (initial_city_id) {
      const initialStop = {
        id: uuidv4(),
        trip_id: tripId,
        city_id: initial_city_id,
        order_index: 0,
        start_date,
        end_date,
        target_budget: Number(target_budget) || 0,
        notes: ''
      };
      store.stops.push(initialStop);
    }

    res.status(201).json({ message: 'Trip created successfully!', trip: newTrip });
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ error: 'Failed to create trip.' });
  }
});

// 3. Get single trip metadata
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.id === req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && !trip.is_public && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to view this trip.' });
    }

    res.json({ trip });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trip.' });
  }
});

// 4. Get full trip hierarchy: Trip -> Stops -> City & Activities (Screen 9 / Screen 5)
router.get('/:id/full', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.id === req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && !trip.is_public && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to access this itinerary.' });
    }

    // Get stops sorted by order_index
    const stops = (store.stops || [])
      .filter(s => s.trip_id === trip.id)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const enrichedStops = stops.map(stop => {
      const city = (store.cities || []).find(c => c.id === stop.city_id) || null;
      const activities = (store.activities || [])
        .filter(a => a.stop_id === stop.id)
        .sort((a, b) => (a.day_number || 1) - (b.day_number || 1));

      const stopCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

      return {
        ...stop,
        city,
        activities,
        total_cost: stopCost
      };
    });

    const grandTotalCost = enrichedStops.reduce((sum, s) => sum + s.total_cost, 0);

    res.json({
      trip: {
        ...trip,
        stops: enrichedStops,
        total_cost: grandTotalCost
      }
    });
  } catch (err) {
    console.error('Full trip error:', err);
    res.status(500).json({ error: 'Failed to fetch full itinerary.' });
  }
});

// 5. Update trip
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.id === req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this trip.' });
    }

    const { name, description, cover_photo_url, start_date, end_date, target_budget, is_public } = req.body;

    if (name !== undefined) trip.name = name.trim();
    if (description !== undefined) trip.description = description;
    if (cover_photo_url !== undefined) trip.cover_photo_url = cover_photo_url;
    if (start_date !== undefined) trip.start_date = start_date;
    if (end_date !== undefined) trip.end_date = end_date;
    if (target_budget !== undefined) trip.target_budget = Number(target_budget) || 0;
    if (is_public !== undefined) trip.is_public = Boolean(is_public);

    res.json({ message: 'Trip updated successfully!', trip });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip.' });
  }
});

// 6. Delete trip
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.id === req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this trip.' });
    }

    // Cascade delete stops and activities
    const stopIds = (store.stops || []).filter(s => s.trip_id === trip.id).map(s => s.id);
    store.activities = (store.activities || []).filter(a => !stopIds.includes(a.stop_id));
    store.stops = (store.stops || []).filter(s => s.trip_id !== trip.id);
    store.trips = (store.trips || []).filter(t => t.id !== trip.id);

    res.json({ message: 'Trip and associated itinerary deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

// 7. Dynamic Budget breakdown endpoint (Screen 9)
router.get('/:id/budget', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.id === req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const stops = (store.stops || []).filter(s => s.trip_id === trip.id);
    const stopIds = stops.map(s => s.id);
    const activities = (store.activities || []).filter(a => stopIds.includes(a.stop_id));

    // Dynamic SUM calculations
    const totalCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    const targetBudget = Number(trip.target_budget) || 0;
    const isOverBudget = targetBudget > 0 && totalCost > targetBudget;
    const overBudgetAmount = isOverBudget ? totalCost - targetBudget : 0;
    const remainingBudget = targetBudget > 0 ? Math.max(0, targetBudget - totalCost) : 0;

    // Category breakdown
    const categoryTotals = {
      transport: 0,
      stay: 0,
      food: 0,
      activity: 0,
      sightseeing: 0
    };

    activities.forEach(a => {
      const cat = (a.category || 'activity').toLowerCase();
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += Number(a.cost) || 0;
      } else {
        categoryTotals.activity += Number(a.cost) || 0;
      }
    });

    const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      amount: categoryTotals[cat],
      percentage: totalCost > 0 ? Number(((categoryTotals[cat] / totalCost) * 100).toFixed(1)) : 0
    }));

    // Stop-by-stop breakdown
    const stopBreakdown = stops.map(stop => {
      const city = (store.cities || []).find(c => c.id === stop.city_id);
      const stopActivities = activities.filter(a => a.stop_id === stop.id);
      const stopCost = stopActivities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
      return {
        stop_id: stop.id,
        city_name: city ? city.name : 'Custom Stop',
        target_budget: Number(stop.target_budget) || 0,
        actual_cost: stopCost,
        is_overbudget: stop.target_budget > 0 && stopCost > stop.target_budget
      };
    });

    // Duration & daily burn calculation
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const averageCostPerDay = Number((totalCost / dayCount).toFixed(2));

    res.json({
      trip_id: trip.id,
      trip_name: trip.name,
      target_budget: targetBudget,
      total_cost: totalCost,
      is_overbudget: isOverBudget,
      overbudget_amount: overBudgetAmount,
      remaining_budget: remainingBudget,
      day_count: dayCount,
      average_cost_per_day: averageCostPerDay,
      categories: categoryBreakdown,
      stops: stopBreakdown
    });
  } catch (err) {
    console.error('Budget error:', err);
    res.status(500).json({ error: 'Failed to calculate budget.' });
  }
});

// 8. Generate / Update Share Slug
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.id === req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (!trip.share_slug) {
      trip.share_slug = generateSlug(trip.name);
    }
    trip.is_public = true;

    res.json({
      message: 'Trip shared publicly!',
      is_public: true,
      share_slug: trip.share_slug,
      share_url: `/t/${trip.share_slug}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to share trip.' });
  }
});

// 9. Deep clone / Copy Trip to active user account (Screen 13)
router.post('/:id/copy', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const sourceTrip = (store.trips || []).find(t => t.id === req.params.id);

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Source trip not found.' });
    }

    const newTripId = uuidv4();
    const newTrip = {
      ...sourceTrip,
      id: newTripId,
      user_id: req.user.id,
      name: `${sourceTrip.name} (Copy)`,
      is_public: false,
      share_slug: generateSlug(`${sourceTrip.name}-copy`),
      created_at: new Date().toISOString()
    };
    store.trips.push(newTrip);

    // Clone all stops and their activities
    const sourceStops = (store.stops || []).filter(s => s.trip_id === sourceTrip.id);
    for (const s of sourceStops) {
      const newStopId = uuidv4();
      const clonedStop = {
        ...s,
        id: newStopId,
        trip_id: newTripId
      };
      store.stops.push(clonedStop);

      const sourceActivities = (store.activities || []).filter(a => a.stop_id === s.id);
      for (const a of sourceActivities) {
        const clonedActivity = {
          ...a,
          id: uuidv4(),
          stop_id: newStopId,
          source: 'user'
        };
        store.activities.push(clonedActivity);
      }
    }

    res.status(201).json({
      message: 'Trip successfully cloned to your account!',
      trip: newTrip
    });
  } catch (err) {
    console.error('Clone trip error:', err);
    res.status(500).json({ error: 'Failed to copy trip.' });
  }
});

export default router;
