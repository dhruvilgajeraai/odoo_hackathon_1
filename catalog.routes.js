import express from 'express';
import { getLocalStore } from '../config/database.js';

const router = express.Router();

// 1. Search & List Cities (Screens 3, 4, 8)
router.get('/cities', (req, res) => {
  try {
    const { q, featured, country, region, sort } = req.query;
    const store = getLocalStore();
    let cities = [...(store.cities || [])];

    if (featured === 'true') {
      cities = cities.filter(c => c.is_featured);
    }

    if (country) {
      cities = cities.filter(c => c.country.toLowerCase() === country.toLowerCase());
    }

    if (region) {
      cities = cities.filter(c => c.region && c.region.toLowerCase() === region.toLowerCase());
    }

    if (q) {
      const search = q.toLowerCase().trim();
      cities = cities.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.country.toLowerCase().includes(search) ||
        (c.region && c.region.toLowerCase().includes(search))
      );
    }

    if (sort === 'cost_asc') {
      cities.sort((a, b) => a.cost_index - b.cost_index);
    } else if (sort === 'cost_desc') {
      cities.sort((a, b) => b.cost_index - a.cost_index);
    } else if (sort === 'name') {
      cities.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default sort by popularity descending
      cities.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    res.json({ cities, total: cities.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities.' });
  }
});

// 2. Single City with suggested activities
router.get('/cities/:id', (req, res) => {
  try {
    const store = getLocalStore();
    const city = (store.cities || []).find(c => c.id === req.params.id);

    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }

    // Find stops linked to this city to get activity ideas
    const stopsInCity = (store.stops || []).filter(s => s.city_id === city.id).map(s => s.id);
    const suggestedActivities = (store.activities || [])
      .filter(a => stopsInCity.includes(a.stop_id))
      .slice(0, 8);

    res.json({ city, suggested_activities: suggestedActivities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch city details.' });
  }
});

// 3. Search & List Activities Catalog (Screen 8)
router.get('/activities', (req, res) => {
  try {
    const { q, city_id, category, min_cost, max_cost, sort } = req.query;
    const store = getLocalStore();
    let activities = [...(store.activities || [])];

    if (city_id) {
      const stopIds = (store.stops || []).filter(s => s.city_id === city_id).map(s => s.id);
      activities = activities.filter(a => stopIds.includes(a.stop_id));
    }

    if (category) {
      activities = activities.filter(a => (a.category || '').toLowerCase() === category.toLowerCase());
    }

    if (min_cost) {
      activities = activities.filter(a => Number(a.cost) >= Number(min_cost));
    }

    if (max_cost) {
      activities = activities.filter(a => Number(a.cost) <= Number(max_cost));
    }

    if (q) {
      const search = q.toLowerCase().trim();
      activities = activities.filter(a => 
        a.name.toLowerCase().includes(search) || 
        (a.location_notes && a.location_notes.toLowerCase().includes(search)) ||
        (a.category && a.category.toLowerCase().includes(search))
      );
    }

    if (sort === 'cost_asc') {
      activities.sort((a, b) => Number(a.cost) - Number(b.cost));
    } else if (sort === 'cost_desc') {
      activities.sort((a, b) => Number(b.cost) - Number(a.cost));
    } else if (sort === 'duration') {
      activities.sort((a, b) => Number(a.duration_minutes) - Number(b.duration_minutes));
    } else {
      activities.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Enrich activities with city context if possible
    const enriched = activities.map(act => {
      const stop = (store.stops || []).find(s => s.id === act.stop_id);
      const city = stop ? (store.cities || []).find(c => c.id === stop.city_id) : null;
      return {
        ...act,
        city_name: city ? city.name : 'Popular Destination',
        city_country: city ? city.country : ''
      };
    });

    res.json({ activities: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
});

export default router;
