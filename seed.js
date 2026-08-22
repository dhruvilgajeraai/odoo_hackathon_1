import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, getLocalStore, setLocalStore, isPostgres } from '../config/database.js';

export async function runSeed() {
  console.log('🌱 Starting GlobeTrotter database seeding...');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const demoPasswordHash = await bcrypt.hash('Alex@123', salt);

  const adminId = '11111111-1111-1111-1111-111111111111';
  const userId = '22222222-2222-2222-2222-222222222222';

  const users = [
    {
      id: adminId,
      email: 'admin@globetrotter.com',
      password_hash: adminPasswordHash,
      first_name: 'Admin',
      last_name: 'Explorer',
      phone: '+1 555 0199',
      city: 'San Francisco',
      country: 'United States',
      bio: 'GlobeTrotter Lead Administrator and Passionate World Adventurer.',
      role: 'admin',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: userId,
      email: 'alex@globetrotter.com',
      password_hash: demoPasswordHash,
      first_name: 'Alex',
      last_name: 'Rivera',
      phone: '+1 555 0142',
      city: 'Barcelona',
      country: 'Spain',
      bio: 'Digital nomad exploring European gems and Asian street food culture.',
      role: 'user',
      photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    }
  ];

  const cities = [
    {
      id: 'c01-paris',
      external_id: 'PAR',
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      cost_index: 3.5,
      popularity: 98,
      lat: 48.8566,
      lng: 2.3522,
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c02-rome',
      external_id: 'ROM',
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      cost_index: 3.0,
      popularity: 95,
      lat: 41.9028,
      lng: 12.4964,
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c03-tokyo',
      external_id: 'TYO',
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      cost_index: 3.8,
      popularity: 99,
      lat: 35.6762,
      lng: 139.6503,
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c04-barcelona',
      external_id: 'BCN',
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      cost_index: 2.8,
      popularity: 92,
      lat: 41.3879,
      lng: 2.16992,
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c05-bali',
      external_id: 'DPS',
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      cost_index: 1.8,
      popularity: 94,
      lat: -8.4095,
      lng: 115.1889,
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c06-newyork',
      external_id: 'NYC',
      name: 'New York City',
      country: 'United States',
      region: 'North America',
      cost_index: 4.2,
      popularity: 96,
      lat: 40.7128,
      lng: -74.0060,
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c07-cairo',
      external_id: 'CAI',
      name: 'Cairo',
      country: 'Egypt',
      region: 'Africa',
      cost_index: 1.9,
      popularity: 88,
      lat: 30.0444,
      lng: 31.2357,
      image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    },
    {
      id: 'c08-kyoto',
      external_id: 'UKY',
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      cost_index: 3.2,
      popularity: 93,
      lat: 35.0116,
      lng: 135.7681,
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    },
    {
      id: 'c09-santorini',
      external_id: 'JTR',
      name: 'Santorini',
      country: 'Greece',
      region: 'Europe',
      cost_index: 3.4,
      popularity: 91,
      lat: 36.3932,
      lng: 25.4615,
      image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    },
    {
      id: 'c10-dubai',
      external_id: 'DXB',
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      cost_index: 4.0,
      popularity: 94,
      lat: 25.2048,
      lng: 55.2708,
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    }
  ];

  // Sample Trips
  const trip1Id = 't01-euro-summer';
  const trip2Id = 't02-japan-cherry';
  const trip3Id = 't03-past-bali';

  const trips = [
    {
      id: trip1Id,
      user_id: userId,
      name: 'Grand European Explorer',
      description: 'A two-week journey through the art, history, and culinary wonders of Paris, Rome, and Barcelona.',
      cover_photo_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1000&auto=format&fit=crop&q=80',
      start_date: '2026-09-10',
      end_date: '2026-09-24',
      target_budget: 3500.00,
      is_public: true,
      share_slug: 'grand-euro-2026',
      created_at: '2026-08-01T10:00:00.000Z'
    },
    {
      id: trip2Id,
      user_id: userId,
      name: 'Japan Autumn Discovery',
      description: 'Futuristic skyscrapers of Tokyo, serene bamboo groves of Kyoto, and authentic ramen trails.',
      cover_photo_url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1000&auto=format&fit=crop&q=80',
      start_date: '2026-11-05',
      end_date: '2026-11-18',
      target_budget: 4200.00,
      is_public: true,
      share_slug: 'japan-autumn-2026',
      created_at: '2026-08-10T12:00:00.000Z'
    },
    {
      id: trip3Id,
      user_id: userId,
      name: 'Bali Spiritual & Tropical Retreat',
      description: 'Yoga mornings in Ubud, temple blessings, and surfing on the southern coastline.',
      cover_photo_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&fit=crop&q=80',
      start_date: '2026-05-01',
      end_date: '2026-05-12',
      target_budget: 1800.00,
      is_public: true,
      share_slug: 'bali-retreat-2026',
      created_at: '2026-04-15T09:00:00.000Z'
    }
  ];

  // Stops for Trip 1
  const stop1Id = 's01-paris';
  const stop2Id = 's02-rome';
  const stop3Id = 's03-barcelona';

  const stops = [
    {
      id: stop1Id,
      trip_id: trip1Id,
      city_id: 'c01-paris',
      order_index: 0,
      start_date: '2026-09-10',
      end_date: '2026-09-15',
      target_budget: 1400.00,
      notes: 'Stay near Le Marais or Montmartre for evening walks.'
    },
    {
      id: stop2Id,
      trip_id: trip1Id,
      city_id: 'c02-rome',
      order_index: 1,
      start_date: '2026-09-15',
      end_date: '2026-09-20',
      target_budget: 1200.00,
      notes: 'Colosseum & Vatican tours booked in advance.'
    },
    {
      id: stop3Id,
      trip_id: trip1Id,
      city_id: 'c04-barcelona',
      order_index: 2,
      start_date: '2026-09-20',
      end_date: '2026-09-24',
      target_budget: 900.00,
      notes: 'Tapas crawl in Gothic Quarter and Sagrada Familia tour.'
    }
  ];

  const activities = [
    // Paris Stop (Stop 1)
    {
      id: 'a01',
      stop_id: stop1Id,
      name: 'Louvre Museum Guided Tour & Mona Lisa',
      category: 'sightseeing',
      cost: 45.00,
      duration_minutes: 180,
      day_number: 1,
      time_slot: 'morning',
      source: 'catalog',
      location_notes: 'Rue de Rivoli, 75001 Paris'
    },
    {
      id: 'a02',
      stop_id: stop1Id,
      name: 'Seine River Sunset Cruise with Champagne',
      category: 'activity',
      cost: 35.00,
      duration_minutes: 75,
      day_number: 1,
      time_slot: 'evening',
      source: 'catalog',
      location_notes: 'Port de la Bourdonnais'
    },
    {
      id: 'a03',
      stop_id: stop1Id,
      name: 'Eiffel Tower Summit Access & Dinner at Madame Brasserie',
      category: 'food',
      cost: 120.00,
      duration_minutes: 150,
      day_number: 2,
      time_slot: 'night',
      source: 'user',
      location_notes: 'Champ de Mars, 5 Av. Anatole France'
    },
    {
      id: 'a04',
      stop_id: stop1Id,
      name: 'Boutique Hotel Le Marais (5 Nights)',
      category: 'stay',
      cost: 650.00,
      duration_minutes: 0,
      day_number: 1,
      time_slot: 'morning',
      source: 'user',
      location_notes: 'Rue des Francs-Bourgeois'
    },
    {
      id: 'a05',
      stop_id: stop1Id,
      name: 'TGV High-Speed Train: Paris to Rome',
      category: 'transport',
      cost: 110.00,
      duration_minutes: 360,
      day_number: 5,
      time_slot: 'morning',
      source: 'user',
      location_notes: 'Gare de Lyon'
    },

    // Rome Stop (Stop 2)
    {
      id: 'a06',
      stop_id: stop2Id,
      name: 'Colosseum & Roman Forum VIP Underground Tour',
      category: 'sightseeing',
      cost: 60.00,
      duration_minutes: 210,
      day_number: 1,
      time_slot: 'morning',
      source: 'catalog',
      location_notes: 'Piazza del Colosseo'
    },
    {
      id: 'a07',
      stop_id: stop2Id,
      name: 'Handmade Pasta & Tiramisu Masterclass with Wine',
      category: 'food',
      cost: 75.00,
      duration_minutes: 150,
      day_number: 2,
      time_slot: 'evening',
      source: 'catalog',
      location_notes: 'Trastevere Kitchen Studio'
    },
    {
      id: 'a08',
      stop_id: stop2Id,
      name: 'Vatican Museums & Sistine Chapel Early Access',
      category: 'sightseeing',
      cost: 55.00,
      duration_minutes: 180,
      day_number: 3,
      time_slot: 'morning',
      source: 'catalog',
      location_notes: 'Viale Vaticano'
    },
    {
      id: 'a09',
      stop_id: stop2Id,
      name: 'Trastevere Heritage Hotel (5 Nights)',
      category: 'stay',
      cost: 550.00,
      duration_minutes: 0,
      day_number: 1,
      time_slot: 'afternoon',
      source: 'user',
      location_notes: 'Via della Lungaretta'
    },

    // Barcelona Stop (Stop 3)
    {
      id: 'a10',
      stop_id: stop3Id,
      name: 'Sagrada Familia Fast-Track Tower Access',
      category: 'sightseeing',
      cost: 40.00,
      duration_minutes: 120,
      day_number: 1,
      time_slot: 'morning',
      source: 'catalog',
      location_notes: 'C/ de Mallorca, 401'
    },
    {
      id: 'a11',
      stop_id: stop3Id,
      name: 'Tapas & Sangria Walking Tour in El Born',
      category: 'food',
      cost: 65.00,
      duration_minutes: 180,
      day_number: 2,
      time_slot: 'evening',
      source: 'catalog',
      location_notes: 'Plaça de Santa Maria'
    },
    {
      id: 'a12',
      stop_id: stop3Id,
      name: 'Park Güell & Gaudi Architecture Walk',
      category: 'sightseeing',
      cost: 20.00,
      duration_minutes: 120,
      day_number: 3,
      time_slot: 'afternoon',
      source: 'catalog',
      location_notes: 'Gràcia, 08024 Barcelona'
    }
  ];

  const community_posts = [
    {
      id: 'p01',
      user_id: userId,
      trip_id: trip1Id,
      content: 'Watching the sunset over the Seine with live jazz playing near Notre-Dame was an unforgettable highlight of our European journey! Don’t skip the early morning Louvre slot.',
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      likes_count: 48,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'p02',
      user_id: adminId,
      trip_id: null,
      content: 'Pro Tip: When visiting Tokyo, get a Suica/Pasmo card on your phone immediately for lightning fast metro transitions and vending machine ramen spots!',
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      likes_count: 89,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'p03',
      user_id: userId,
      trip_id: trip3Id,
      content: 'Sunrise hike at Mount Batur in Bali. Strenuous 2 AM wake-up, but drinking hot coffee while clouds part over the volcanic lake is pure magic! ✨',
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      likes_count: 62,
      created_at: new Date(Date.now() - 86400000 * 9).toISOString()
    }
  ];

  if (isPostgres) {
    // Insert into Postgres tables if connected
    console.log('Seeding Postgres tables...');
    for (const u of users) {
      await query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, city, country, bio, role, photo_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (email) DO NOTHING`,
        [u.id, u.email, u.password_hash, u.first_name, u.last_name, u.phone, u.city, u.country, u.bio, u.role, u.photo_url, u.created_at]
      );
    }
    for (const c of cities) {
      await query(
        `INSERT INTO cities (id, external_id, name, country, region, cost_index, popularity, lat, lng, image_url, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.external_id, c.name, c.country, c.region, c.cost_index, c.popularity, c.lat, c.lng, c.image_url, c.is_featured]
      );
    }
  } else {
    // Populate local persistent store
    console.log('Seeding local storage database...');
    setLocalStore({
      users,
      cities,
      trips,
      stops,
      activities,
      community_posts
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('Credentials:');
  console.log('  Admin User: admin@globetrotter.com / Admin@123');
  console.log('  Demo User:  alex@globetrotter.com / Alex@123');
}

if (process.argv[1].endsWith('seed.js')) {
  runSeed().catch(console.error);
}
