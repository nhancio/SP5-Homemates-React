# 🚀 Next Steps: Supabase Setup & Testing Guide

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
   - Sign up or log in
   - Click "New Project"

2. **Project Setup:**
   - **Name**: `homemates-app` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for project to initialize

3. **Get Your Credentials:**
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

## Step 2: Run SQL Migration

1. **Open SQL Editor:**
   - In Supabase Dashboard, click **SQL Editor** in left sidebar
   - Click **New Query**

2. **Run Migration:**
   - Open `supabase-migration.sql` from your project
   - Copy **ALL** contents
   - Paste into SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - Wait for "Success. No rows returned" message

3. **Verify Tables Created:**
   - Go to **Table Editor** in left sidebar
   - You should see:
     - ✅ `users`
     - ✅ `rent_listings`
     - ✅ `sell_listings`
     - ✅ `markets`

## Step 3: Configure Google OAuth

### A. Get Google OAuth Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create/Select Project:**
   - Click project dropdown → "New Project"
   - Name: `Homemates App`
   - Click "Create"

3. **Enable Google+ API:**
   - Go to **APIs & Services** → **Library**
   - Search "Google+ API"
   - Click **Enable**

4. **Create OAuth Credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Homemates Web Client`

5. **Add Authorized Redirect URIs:**
   - Get your Supabase redirect URI from: **Authentication** → **URL Configuration**
   - It will be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Add this to **Authorized redirect URIs**
   - Also add: `http://localhost:5173/auth/callback` (for local dev)
   - Click **Create**
   - **Copy Client ID and Client Secret**

### B. Configure in Supabase

1. **In Supabase Dashboard:**
   - Go to **Authentication** → **Providers**
   - Find **Google** and click to expand
   - Click **Enable Google provider**

2. **Add Credentials:**
   - Paste **Client ID** from Google Cloud Console
   - Paste **Client Secret** from Google Cloud Console
   - Click **Save**

## Step 4: Set Environment Variables

1. **Create `.env` file in project root:**
   ```bash
   cd /Users/nithi/Desktop/Nhancio/SP5-Homemates-React
   touch .env
   ```

2. **Add your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   
   Replace:
   - `xxxxx` with your actual project reference
   - `your_anon_key_here` with your actual anon key

3. **Add to `.gitignore`** (if not already):
   ```
   .env
   .env.local
   ```

## Step 5: Create Storage Bucket (for Cover Photos)

1. **In Supabase Dashboard:**
   - Go to **Storage** in left sidebar
   - Click **New bucket**
   - Name: `cover-photos`
   - **Public bucket**: ✅ Check this (so images are accessible)
   - Click **Create bucket**

2. **Set Bucket Policies** (if needed):
   - Click on `cover-photos` bucket
   - Go to **Policies** tab
   - Ensure public read access is enabled

## Step 6: Test the Migration

### A. Start Development Server

```bash
npm run dev
```

### B. Test Authentication

1. **Open app in browser** (usually `http://localhost:5173`)
2. **Click Login/Sign In**
3. **Select Google account**
4. **Verify:**
   - ✅ Redirects back to app
   - ✅ User is logged in
   - ✅ User data appears in Supabase **Authentication** → **Users**

### C. Test Database Operations

1. **Check User Created:**
   - Go to Supabase **Table Editor** → `users`
   - Verify your user record exists with:
     - `user_id` (matches auth user ID)
     - `email`, `name`, `photo_url`
     - `credits: 5` (for new users)

2. **Test Creating Listing:**
   - Try creating a rent or sell listing
   - Check `rent_listings` or `sell_listings` table
   - Verify data is saved correctly

3. **Test Favorites:**
   - Favorite a property
   - Check `users` table → `favorites` column
   - Should contain array of property IDs

### D. Test WhatsApp Chat

1. **Click "Chat" button on any property**
2. **Verify:**
   - ✅ Opens WhatsApp in new tab
   - ✅ Phone number is pre-filled
   - ✅ Message is pre-filled

## Step 7: Verify Row Level Security (RLS)

1. **Check RLS is Enabled:**
   - Go to **Table Editor** → Select any table
   - Click **Policies** tab
   - Verify policies are listed

2. **Test Permissions:**
   - Try accessing data while logged out
   - Try accessing other users' data
   - Should be blocked by RLS

## Step 8: Data Migration (If You Have Existing Firebase Data)

If you have existing data in Firebase that needs to be migrated:

1. **Export Firebase Data:**
   ```bash
   # Use Firebase CLI or export manually
   firebase firestore:export ./firebase-export
   ```

2. **Transform Data:**
   - Convert Firestore format to SQL INSERT statements
   - Match column names to Supabase schema

3. **Import to Supabase:**
   - Use Supabase SQL Editor or import tool
   - Run INSERT statements

## Troubleshooting

### ❌ "Failed to resolve import @supabase/supabase-js"
**Solution:** Run `npm install`

### ❌ "Invalid API key" or "Invalid URL"
**Solution:** 
- Check `.env` file exists
- Verify environment variables are correct
- Restart dev server after changing `.env`

### ❌ OAuth redirect not working
**Solution:**
- Verify redirect URI in Google Cloud Console matches Supabase callback URL exactly
- Check Supabase URL Configuration settings

### ❌ "permission denied" errors
**Solution:**
- Check RLS policies are correct
- Verify user is authenticated
- Check user_id matches auth.uid()

### ❌ Images not uploading
**Solution:**
- Verify `cover-photos` bucket exists
- Check bucket is public
- Verify storage policies allow uploads

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] SQL migration executed successfully
- [ ] Google OAuth configured
- [ ] Environment variables set
- [ ] Storage bucket created
- [ ] Can log in with Google
- [ ] User data saved to Supabase
- [ ] Can create listings
- [ ] Can favorite properties
- [ ] WhatsApp chat redirects work
- [ ] No console errors

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Check logs**: Browser console and Supabase Dashboard → Logs

---

**You're all set! 🎉** Your app is now running on Supabase instead of Firebase.

