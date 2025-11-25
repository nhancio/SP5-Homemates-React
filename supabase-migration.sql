-- ============================================
-- Supabase Migration SQL for HomeMates
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (u collection)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL, -- Firebase UID equivalent
  email TEXT,
  name TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  credits INTEGER DEFAULT 5,
  credits_last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT FALSE,
  preferences TEXT[] DEFAULT '{}',
  gender TEXT,
  age INTEGER,
  profession TEXT,
  city TEXT,
  locality TEXT,
  user_phone_number TEXT,
  looking_for TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  favorites TEXT[] DEFAULT '{}', -- Array of property IDs
  budget_min INTEGER,
  budget_max INTEGER,
  move_in_date DATE,
  flat_type TEXT,
  room_type TEXT,
  bathroom_type TEXT,
  online BOOLEAN DEFAULT FALSE,
  last_active BIGINT,
  user_email TEXT,
  user_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_locality ON users(locality);

-- ============================================
-- 2. RENT LISTINGS TABLE (r collection)
-- ============================================
CREATE TABLE IF NOT EXISTS rent_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  created_by_user TEXT NOT NULL,
  listing_type TEXT DEFAULT 'rent',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  -- Address
  address_city TEXT,
  address_locality TEXT,
  address_building_name TEXT,
  address_google_maps_link TEXT,
  
  -- Property details
  property_type TEXT,
  room_type TEXT, -- BHK
  furnish_type TEXT,
  parking TEXT,
  building_type TEXT,
  handover_date TEXT,
  is_immediate BOOLEAN,
  description TEXT,
  contact_number TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Room details for full flat
  rooms JSONB, -- Array of individual room objects
  
  -- Rent details
  rent_details JSONB, -- Contains preferredTenant, costs, additionalBills, amenities
  
  -- Room availability
  room_available TEXT,
  
  created_at BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rent_listings
CREATE INDEX IF NOT EXISTS idx_rent_listings_user_id ON rent_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_rent_listings_status ON rent_listings(status);
CREATE INDEX IF NOT EXISTS idx_rent_listings_city ON rent_listings(address_city);
CREATE INDEX IF NOT EXISTS idx_rent_listings_locality ON rent_listings(address_locality);
CREATE INDEX IF NOT EXISTS idx_rent_listings_property_type ON rent_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_rent_listings_created_at ON rent_listings(created_at DESC);

-- ============================================
-- 3. SELL LISTINGS TABLE (s collection)
-- ============================================
CREATE TABLE IF NOT EXISTS sell_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  created_by_user TEXT NOT NULL,
  listing_type TEXT DEFAULT 'sell',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  -- Address
  address_city TEXT,
  address_locality TEXT,
  address_building_name TEXT,
  address_google_maps_link TEXT,
  
  -- Property details
  property_type TEXT,
  room_type TEXT, -- BHK
  furnish_type TEXT,
  parking TEXT,
  building_type TEXT,
  handover_date TEXT,
  is_immediate BOOLEAN,
  description TEXT,
  contact_number TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Sell details
  sell_details JSONB, -- Contains price, gst, propertyType, amenities, etc.
  looking_for TEXT,
  
  created_at BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sell_listings
CREATE INDEX IF NOT EXISTS idx_sell_listings_user_id ON sell_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_sell_listings_status ON sell_listings(status);
CREATE INDEX IF NOT EXISTS idx_sell_listings_city ON sell_listings(address_city);
CREATE INDEX IF NOT EXISTS idx_sell_listings_locality ON sell_listings(address_locality);
CREATE INDEX IF NOT EXISTS idx_sell_listings_property_type ON sell_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_sell_listings_created_at ON sell_listings(created_at DESC);

-- ============================================
-- 4. MARKETS TABLE (city/locality data)
-- ============================================
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL,
  market TEXT NOT NULL, -- locality name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for markets
CREATE INDEX IF NOT EXISTS idx_markets_city ON markets(city);
CREATE INDEX IF NOT EXISTS idx_markets_market ON markets(market);
CREATE UNIQUE INDEX IF NOT EXISTS idx_markets_city_market ON markets(city, market);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Rent listings policies
CREATE POLICY "Anyone can read active rent listings" ON rent_listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create rent listings" ON rent_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own rent listings" ON rent_listings
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid()::text = created_by_user);

CREATE POLICY "Users can delete own rent listings" ON rent_listings
  FOR DELETE USING (auth.uid()::text = user_id OR auth.uid()::text = created_by_user);

-- Sell listings policies
CREATE POLICY "Anyone can read active sell listings" ON sell_listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create sell listings" ON sell_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own sell listings" ON sell_listings
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid()::text = created_by_user);

CREATE POLICY "Users can delete own sell listings" ON sell_listings
  FOR DELETE USING (auth.uid()::text = user_id OR auth.uid()::text = created_by_user);

-- Markets policies (public read)
CREATE POLICY "Anyone can read markets" ON markets
  FOR SELECT USING (true);

-- ============================================
-- 8. FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rent_listings_updated_at BEFORE UPDATE ON rent_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sell_listings_updated_at BEFORE UPDATE ON sell_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE users IS 'User profiles and preferences';
COMMENT ON TABLE rent_listings IS 'Rental property listings';
COMMENT ON TABLE sell_listings IS 'Sale property listings';
COMMENT ON TABLE markets IS 'City and locality (market) data';

-- ============================================
-- Migration Complete!
-- ============================================
-- Next steps:
-- 1. Configure Supabase Auth with Google OAuth
-- 2. Update your application code to use Supabase client
-- 3. Test authentication and data operations
-- ============================================

