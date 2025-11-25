# Supabase Migration Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key (found in Settings > API)

## Step 2: Run SQL Migration

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-migration.sql`
4. Run the SQL script
5. Verify all tables are created successfully

## Step 3: Configure Google OAuth

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Enable **Google** provider
3. You'll need:
   - Google OAuth Client ID
   - Google OAuth Client Secret
4. Add authorized redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Your production domain callback URL

### Getting Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs from Supabase
7. Copy Client ID and Client Secret to Supabase

## Step 4: Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Update Code

All code has been updated to use Supabase. The migration includes:

- ✅ Authentication service
- ✅ Listings service (rent & sell)
- ✅ Credits service
- ✅ Chat service
- ✅ Markets service
- ✅ Matching service
- ✅ AppContext

## Step 6: Test Migration

1. Test user authentication (Google OAuth)
2. Test creating listings
3. Test reading listings
4. Test chat functionality
5. Test credits system
6. Test user favorites

## Important Notes

- **Row Level Security (RLS)** is enabled on all tables
- Make sure your Supabase policies match your security requirements
- The `user_id` field in users table stores the Supabase auth UID
- All timestamps are stored as TIMESTAMPTZ (timezone-aware)
- JSONB fields are used for complex nested data (rentDetails, sellDetails, rooms)

## Troubleshooting

### Authentication Issues
- Verify Google OAuth is properly configured in Supabase
- Check redirect URIs match exactly
- Ensure environment variables are set correctly

### Permission Errors
- Check RLS policies are correctly set
- Verify user is authenticated before operations
- Check user_id matches auth.uid()

### Data Migration
- Export data from Firebase if needed
- Create migration script to import data to Supabase
- Test with sample data first

