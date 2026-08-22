import bcrypt from 'bcryptjs';
import { query, getLocalStore, setLocalStore, isPostgres } from '../config/database.js';

export async function runSeed() {
  console.log('🇮🇳 Starting GlobeTrotter India database seeding...');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Priya@123', salt);
  const demoPasswordHash = await bcrypt.hash('Rahul@123', salt);

  const adminId = '11111111-1111-1111-1111-111111111111';
  const userId = '22222222-2222-2222-2222-222222222222';

  const users = [
    {
      id: adminId,
      email: 'priya@globetrotter.in',
      password_hash: adminPasswordHash,
      first_name: 'Priya',
      last_name: 'Sharma',
      phone: '+91 98765 43210',
      city: 'New Delhi',
      country: 'India',
      bio: 'GlobeTrotter India Lead Administrator & Himalayan Trekker.',
      role: 'admin',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: userId,
      email: 'rahul@globetrotter.in',
      password_hash: demoPasswordHash,
      first_name: 'Rahul',
      last_name: 'Verma',
      phone: '+91 98123 45678',
      city: 'Mumbai',
      country: 'India',
      bio: 'Travel enthusiast exploring incredible Indian heritage, beaches, and mountain trails.',
      role: 'user',
      photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    }
  ];

  const cities = [
    {
      id: 'c01-goa',
      external_id: 'GOI',
      name: 'Goa',
      country: 'India',
      region: 'West India',
      cost_index: 2.5,
      popularity: 98,
      lat: 15.2993,
      lng: 74.1240,
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c02-jaipur',
      external_id: 'JAI',
      name: 'Jaipur',
      country: 'India',
      region: 'North India',
      cost_index: 2.2,
      popularity: 96,
      lat: 26.9124,
      lng: 75.7873,
      image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c03-manali',
      external_id: 'MNL',
      name: 'Manali',
      country: 'India',
      region: 'North India',
      cost_index: 2.4,
      popularity: 95,
      lat: 32.2432,
      lng: 77.1892,
      image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c04-kerala',
      external_id: 'COK',
      name: 'Alleppey & Munnar (Kerala)',
      country: 'India',
      region: 'South India',
      cost_index: 2.8,
      popularity: 97,
      lat: 9.4981,
      lng: 76.3388,
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c05-ladakh',
      external_id: 'IXL',
      name: 'Leh Ladakh',
      country: 'India',
      region: 'North India',
      cost_index: 3.2,
      popularity: 99,
      lat: 34.1526,
      lng: 77.5771,
      image_url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80',
      is_featured: true
    },
    {
      id: 'c06-varanasi',
      external_id: 'VNS',
      name: 'Varanasi',
      country: 'India',
      region: 'North India',
      cost_index: 1.8,
      popularity: 93,
      lat: 25.3176,
      lng: 82.9739,
      image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    },
    {
      id: 'c07-udaipur',
      external_id: 'UDR',
      name: 'Udaipur',
      country: 'India',
      region: 'West India',
      cost_index: 3.0,
      popularity: 94,
      lat: 24.5854,
      lng: 73.7125,
      image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    },
    {
      id: 'c08-rishikesh',
      external_id: 'RSH',
      name: 'Rishikesh',
      country: 'India',
      region: 'North India',
      cost_index: 1.9,
      popularity: 92,
      lat: 30.0869,
      lng: 78.2676,
      image_url: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    },
    {
      id: 'c09-mumbai',
      external_id: 'BOM',
      name: 'Mumbai',
      country: 'India',
      region: 'West India',
      cost_index: 3.5,
      popularity: 95,
      lat: 19.0760,
      lng: 72.8777,
      image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    },
    {
      id: 'c10-andaman',
      external_id: 'IXZ',
      name: 'Andaman & Nicobar',
      country: 'India',
      region: 'Islands',
      cost_index: 3.6,
      popularity: 94,
      lat: 11.7401,
      lng: 92.6586,
      image_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80',
      is_featured: false
    }
  ];

  // Sample Trips in India
  const trip1Id = 't01-royal-rajasthan';
  const trip2Id = 't02-kerala-backwaters';
  const trip3Id = 't03-goa-beach-bliss';

  const trips = [
    {
      id: trip1Id,
      user_id: userId,
      name: 'Royal Rajasthan Heritage Trail',
      description: 'Grand palaces of Jaipur, romantic lake city of Udaipur, and desert safari adventures.',
      cover_photo_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&auto=format&fit=crop&q=80',
      start_date: '2026-09-15',
      end_date: '2026-09-25',
      target_budget: 45000.00, // in INR (₹45,000)
      is_public: true,
      share_slug: 'royal-rajasthan-2026',
      created_at: '2026-08-01T10:00:00.000Z'
    },
    {
      id: trip2Id,
      user_id: userId,
      name: "God's Own Country: Kerala Backwaters",
      description: 'Munnar mist-covered tea gardens, traditional luxury houseboat stay in Alleppey backwaters.',
      cover_photo_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1000&auto=format&fit=crop&q=80',
      start_date: '2026-11-10',
      end_date: '2026-11-20',
      target_budget: 38000.00, // in INR (₹38,000)
      is_public: true,
      share_slug: 'kerala-backwaters-2026',
      created_at: '2026-08-10T12:00:00.000Z'
    },
    {
      id: trip3Id,
      user_id: userId,
      name: 'Goa Coastal Getaway & Scuba Trip',
      description: 'Sunsets at Palolem, scuba diving at Grand Island, and authentic Goan seafood shack trails.',
      cover_photo_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&auto=format&fit=crop&q=80',
      start_date: '2026-05-01',
      end_date: '2026-05-07',
      target_budget: 25000.00, // in INR (₹25,000)
      is_public: true,
      share_slug: 'goa-bliss-2026',
      created_at: '2026-04-15T09:00:00.000Z'
    }
  ];

  // Stops for Trip 1 (Rajasthan)
  const stop1Id = 's01-jaipur';
  const stop2Id = 's02-udaipur';

  const stops = [
    {
      id: stop1Id,
      trip_id: trip1Id,
      city_id: 'c02-jaipur',
      order_index: 0,
      start_date: '2026-09-15',
      end_date: '2026-09-20',
      target_budget: 22000.00,
      notes: 'Heritage Haveli stay near Hawa Mahal and Amer Fort night light show.'
    },
    {
      id: stop2Id,
      trip_id: trip1Id,
      city_id: 'c07-udaipur',
      order_index: 1,
      start_date: '2026-09-20',
      end_date: '2026-09-25',
      target_budget: 23000.00,
      notes: 'Lake Pichola sunset boat ride and City Palace museum tour.'
    },
    // Stops for Trip 3 (Goa)
    {
      id: 's03-goa-stop',
      trip_id: trip3Id,
      city_id: 'c01-goa',
      order_index: 0,
      start_date: '2026-05-01',
      end_date: '2026-05-07',
      target_budget: 25000.00,
      notes: 'North Goa water sports & South Goa serene beaches.'
    }
  ];

  const activities = [
    // Jaipur Stop
    {
      id: 'a01',
      stop_id: stop1Id,
      name: 'Amer Fort Guided Tour & Elephant Sanctuary Visit',
      category: 'sightseeing',
      cost: 1200.00, // ₹1,200
      duration_minutes: 180,
      day_number: 1,
      time_slot: 'morning',
      source: 'catalog',
      location_notes: 'Devisinghpura, Amer, Jaipur'
    },
    {
      id: 'a02',
      stop_id: stop1Id,
      name: 'Hawa Mahal Photo Walk & Johari Bazaar Street Food',
      category: 'food',
      cost: 800.00, // ₹800
      duration_minutes: 120,
      day_number: 1,
      time_slot: 'evening',
      source: 'catalog',
      location_notes: 'Badi Choupad, J.D.A. Market, Pink City'
    },
    {
      id: 'a03',
      stop_id: stop1Id,
      name: 'Traditional Rajasthani Thali Dinner at Chokhi Dhani',
      category: 'food',
      cost: 1600.00, // ₹1,600
      duration_minutes: 180,
      day_number: 2,
      time_slot: 'night',
      source: 'user',
      location_notes: '12 Miles Tonk Road, Goner Mod Flyover'
    },
    {
      id: 'a04',
      stop_id: stop1Id,
      name: 'Heritage Haveli Deluxe Stay (5 Nights)',
      category: 'stay',
      cost: 12500.00, // ₹12,500
      duration_minutes: 0,
      day_number: 1,
      time_slot: 'morning',
      source: 'user',
      location_notes: 'Bani Park Heritage Hotel'
    },
    {
      id: 'a05',
      stop_id: stop1Id,
      name: 'AC Superfast Express Train: Jaipur to Udaipur',
      category: 'transport',
      cost: 1400.00, // ₹1,400
      duration_minutes: 390,
      day_number: 5,
      time_slot: 'morning',
      source: 'user',
      location_notes: 'Jaipur Junction Railway Station'
    },

    // Udaipur Stop
    {
      id: 'a06',
      stop_id: stop2Id,
      name: 'Lake Pichola Sunset Boat Cruise & Jag Mandir Island',
      category: 'activity',
      cost: 950.00, // ₹950
      duration_minutes: 90,
      day_number: 1,
      time_slot: 'evening',
      source: 'catalog',
      location_notes: 'Rameshwar Ghat, City Palace Jetty'
    },
    {
      id: 'a07',
      stop_id: stop2Id,
      name: 'City Palace Complex & Vintage Car Museum Pass',
      category: 'sightseeing',
      cost: 750.00, // ₹750
      duration_minutes: 150,
      day_number: 2,
      time_slot: 'morning',
      source: 'catalog',
      location_notes: 'Old City, Udaipur'
    },
    {
      id: 'a08',
      stop_id: stop2Id,
      name: 'Lakeview Heritage Resort Stay (5 Nights)',
      category: 'stay',
      cost: 14000.00, // ₹14,000
      duration_minutes: 0,
      day_number: 1,
      time_slot: 'afternoon',
      source: 'user',
      location_notes: 'Hanuman Ghat, Lake Pichola'
    },

    // Goa Activities
    {
      id: 'a09',
      stop_id: 's03-goa-stop',
      name: 'Scuba Diving & Water Sports at Grand Island with GoPro Video',
      category: 'activity',
      cost: 2800.00, // ₹2,800
      duration_minutes: 240,
      day_number: 1,
      time_slot: 'morning',
      source: 'catalog',
      location_notes: 'Malvan / Grand Island Jetty'
    },
    {
      id: 'a10',
      stop_id: 's03-goa-stop',
      name: 'Sunset Cruise with Live Mandovi Folk Dance & DJ',
      category: 'activity',
      cost: 650.00, // ₹650
      duration_minutes: 75,
      day_number: 2,
      time_slot: 'evening',
      source: 'catalog',
      location_notes: 'Santa Monica Jetty, Panaji'
    },
    {
      id: 'a11',
      stop_id: 's03-goa-stop',
      name: 'Beachfront Wooden Cottage Stay in Palolem (6 Nights)',
      category: 'stay',
      cost: 15000.00, // ₹15,000
      duration_minutes: 0,
      day_number: 1,
      time_slot: 'afternoon',
      source: 'user',
      location_notes: 'South Palolem Beach'
    }
  ];

  const community_posts = [
    {
      id: 'p01',
      user_id: userId,
      trip_id: trip1Id,
      content: 'Watching the sunset over Lake Pichola with the illuminated City Palace reflecting in the water was completely mesmerizing! Definitely hire an evening boat from Rameshwar Ghat. ✨🇮🇳',
      image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80',
      likes_count: 84,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'p02',
      user_id: adminId,
      trip_id: null,
      content: 'Pro Tip for Ladakh: Spend at least 48 hours acclimatizing in Leh before heading to Khardung La or Pangong Lake. Keep ORS and camphor handy for high altitude serenity!',
      image_url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80',
      likes_count: 142,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'p03',
      user_id: userId,
      trip_id: trip3Id,
      content: 'Morning scuba diving session at Grand Island in Goa! Water visibility was crystal clear and we spotted reef fish and sea turtles. Perfect holiday vibe! 🏖️🤿',
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      likes_count: 96,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ];

  if (isPostgres) {
    console.log('Seeding Postgres tables with Indian catalog...');
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
    console.log('Populating local store with Indian data...');
    setLocalStore({
      users,
      cities,
      trips,
      stops,
      activities,
      community_posts
    });
  }

  console.log('✅ Indian Localization Database Seeding Completed!');
  console.log('🇮🇳 Test Accounts:');
  console.log('  Admin User: priya@globetrotter.in / Priya@123');
  console.log('  Demo User:  rahul@globetrotter.in / Rahul@123');
}

if (process.argv[1].endsWith('seed.js')) {
  runSeed().catch(console.error);
}
