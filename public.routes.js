import express from 'express';
import { getLocalStore } from '../config/database.js';

const router = express.Router();

// Public Read-Only Trip View by Slug (Screen 13)
router.get('/trips/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const store = getLocalStore();
    const trip = (store.trips || []).find(t => t.share_slug === slug || t.id === slug);

    if (!trip) {
      return res.status(404).json({ error: 'Public trip not found or link has expired.' });
    }

    if (!trip.is_public) {
      return res.status(403).json({ error: 'This trip is private and has not been made public.' });
    }

    const creator = (store.users || []).find(u => u.id === trip.user_id);
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

    // Calculate duration & category distribution
    const categoryTotals = { transport: 0, stay: 0, food: 0, activity: 0, sightseeing: 0 };
    enrichedStops.forEach(s => {
      s.activities.forEach(a => {
        const cat = (a.category || 'activity').toLowerCase();
        if (categoryTotals[cat] !== undefined) categoryTotals[cat] += Number(a.cost) || 0;
        else categoryTotals.activity += Number(a.cost) || 0;
      });
    });

    res.json({
      trip: {
        ...trip,
        creator: {
          name: creator ? `${creator.first_name} ${creator.last_name}` : 'GlobeTrotter Traveler',
          photo_url: creator ? creator.photo_url : null,
          city: creator ? creator.city : '',
          country: creator ? creator.country : ''
        },
        stops: enrichedStops,
        total_cost: grandTotalCost,
        categories: categoryTotals
      }
    });
  } catch (err) {
    console.error('Public trip view error:', err);
    res.status(500).json({ error: 'Failed to fetch public trip.' });
  }
});

export default router;
