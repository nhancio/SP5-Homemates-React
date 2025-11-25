// Quick test script to check Supabase connection
// Run with: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please set:');
  console.log('  VITE_SUPABASE_URL=...');
  console.log('  VITE_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n1. Testing markets table...');
    const start = Date.now();
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('id, city, market')
      .limit(5);
    const duration = Date.now() - start;
    
    if (marketsError) {
      console.error('❌ Markets query error:', marketsError);
    } else {
      console.log(`✅ Markets query success in ${duration}ms`);
      console.log(`   Found ${markets?.length || 0} markets`);
    }
    
    console.log('\n2. Testing users table...');
    const start2 = Date.now();
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, email, name')
      .limit(5);
    const duration2 = Date.now() - start2;
    
    if (usersError) {
      console.error('❌ Users query error:', usersError);
    } else {
      console.log(`✅ Users query success in ${duration2}ms`);
      console.log(`   Found ${users?.length || 0} users`);
    }
    
    console.log('\n3. Testing rent_listings table...');
    const start3 = Date.now();
    const { data: rentListings, error: rentError } = await supabase
      .from('rent_listings')
      .select('id, address_city, status')
      .eq('status', 'active')
      .limit(5);
    const duration3 = Date.now() - start3;
    
    if (rentError) {
      console.error('❌ Rent listings query error:', rentError);
    } else {
      console.log(`✅ Rent listings query success in ${duration3}ms`);
      console.log(`   Found ${rentListings?.length || 0} active listings`);
    }
    
    console.log('\n4. Testing sell_listings table...');
    const start4 = Date.now();
    const { data: sellListings, error: sellError } = await supabase
      .from('sell_listings')
      .select('id, address_city, status')
      .eq('status', 'active')
      .limit(5);
    const duration4 = Date.now() - start4;
    
    if (sellError) {
      console.error('❌ Sell listings query error:', sellError);
    } else {
      console.log(`✅ Sell listings query success in ${duration4}ms`);
      console.log(`   Found ${sellListings?.length || 0} active listings`);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('\nSummary:');
    console.log(`  Markets: ${marketsError ? '❌' : '✅'} (${duration}ms)`);
    console.log(`  Users: ${usersError ? '❌' : '✅'} (${duration2}ms)`);
    console.log(`  Rent Listings: ${rentError ? '❌' : '✅'} (${duration3}ms)`);
    console.log(`  Sell Listings: ${sellError ? '❌' : '✅'} (${duration4}ms)`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConnection();

