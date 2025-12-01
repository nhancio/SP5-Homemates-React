import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
const isConfigValid = supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl !== 'YOUR_SUPABASE_URL' && 
                      supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
                      supabaseUrl.startsWith('http');

if (!isConfigValid) {
  const errorMsg = '⚠️ CRITICAL: Supabase environment variables are not configured properly. ' +
                   'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Netlify environment variables.';
  console.error(errorMsg);
  
  // Show user-friendly error in production
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="text-align: center; max-width: 600px;">
            <h1 style="color: #C2185B; margin-bottom: 16px;">Configuration Error</h1>
            <p style="color: #666; margin-bottom: 24px;">
              The application is not properly configured. Please contact the administrator.
            </p>
            <p style="color: #999; font-size: 14px;">
              Error: Missing Supabase environment variables
            </p>
          </div>
        </div>
      `;
    }
  }
}

// Create Supabase client with fallback values to prevent crashes
export const supabase = createClient(
  isConfigValid ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigValid ? supabaseAnonKey : 'placeholder-key',
  {
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

