import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn('⚠️ Supabase URL not configured. Please set VITE_SUPABASE_URL in your .env file');
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️ Supabase Anon Key not configured. Please set VITE_SUPABASE_ANON_KEY in your .env file');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'homemates-web'
    }
  }
});

// Add connection debugging
if (typeof window !== 'undefined') {
  console.log('[Supabase] Client initialized');
  console.log('[Supabase] URL:', supabaseUrl?.substring(0, 30) + '...');
  
  // Test connection on init
  supabase.from('markets').select('id').limit(1).then(({ error }) => {
    if (error) {
      console.error('[Supabase] Connection test failed:', error);
    } else {
      console.log('[Supabase] ✅ Connection test passed');
    }
  }).catch(err => {
    console.error('[Supabase] Connection test exception:', err);
  });
}

// Export auth for convenience
export const auth = supabase.auth;

