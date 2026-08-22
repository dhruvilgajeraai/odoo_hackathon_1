-- GlobeTrotter Database Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  city VARCHAR(100),
  country VARCHAR(100),
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user', -- 'user' | 'admin'
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_budget NUMERIC(12, 2) DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  share_slug VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cities Table (Catalog)
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100),
  name VARCHAR(150) NOT NULL,
  country VARCHAR(150) NOT NULL,
  region VARCHAR(100),
  cost_index NUMERIC(5, 2) DEFAULT 1.0,
  popularity INT DEFAULT 50,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE
);

-- 4. Stops Table (Trip segments / cities)
CREATE TABLE IF NOT EXISTS stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  order_index INT NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_budget NUMERIC(12, 2) DEFAULT 0,
  notes TEXT
);

-- 5. Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'activity', -- 'transport', 'stay', 'food', 'activity', 'sightseeing'
  cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 60,
  day_number INT DEFAULT 1,
  time_slot VARCHAR(50) DEFAULT 'morning', -- 'morning', 'afternoon', 'evening', 'night'
  source VARCHAR(50) DEFAULT 'user', -- 'user' | 'catalog'
  location_notes TEXT
);

-- 6. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_stops_trip_id ON stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_stop_id ON activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_slug ON trips(share_slug);
CREATE INDEX IF NOT EXISTS idx_cities_popularity ON cities(popularity DESC);
