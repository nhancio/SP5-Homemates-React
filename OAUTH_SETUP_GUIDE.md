# 🔐 OAuth Redirect URI Setup Guide

## The Problem: Error 400: redirect_uri_mismatch

This error occurs when the redirect URI in Google Cloud Console doesn't match what Supabase is sending.

## Understanding the OAuth Flow

```
User clicks Login
    ↓
App → Supabase OAuth
    ↓
Supabase → Google OAuth
    ↓
Google → Supabase Callback URL (THIS MUST MATCH!)
    ↓
Supabase → App (redirects back)
```

## Step-by-Step Fix

### Step 1: Get Your Supabase Callback URL

1. **Go to Supabase Dashboard**
2. **Navigate to:** Authentication → URL Configuration
3. **Find:** "Redirect URLs" section
4. **Copy the Site URL** - This is your base URL
5. **The callback URL will be:** `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

**Example:**
- If your Supabase URL is: `https://abcdefghijklmnop.supabase.co`
- Your callback URL is: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

### Step 2: Configure Supabase Site URL

1. **In Supabase Dashboard:**
   - Go to **Authentication** → **URL Configuration**
   - **Site URL:** Set to your app URL
     - For local dev: `http://localhost:5173`
     - For production: `https://yourdomain.com`
   - **Redirect URLs:** Add both:
     - `http://localhost:5173` (for local dev)
     - `https://yourdomain.com` (for production)
   - Click **Save**

### Step 3: Configure Google Cloud Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project** (or create one)
3. **Navigate to:** APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID** (or create one)
5. **Click Edit** (pencil icon)

6. **In "Authorized redirect URIs" section, add:**
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   
   **Replace `YOUR_PROJECT_REF` with your actual Supabase project reference**
   
   **Example:**
   ```
   https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```

7. **Also add your app URLs (optional, for direct OAuth):**
   ```
   http://localhost:5173
   https://yourdomain.com
   ```

8. **Click Save**

### Step 4: Verify Configuration

1. **Check Supabase:**
   - Authentication → Providers → Google
   - Ensure Google provider is enabled
   - Client ID and Secret are set

2. **Check Google Cloud Console:**
   - The redirect URI must **exactly match**:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - No trailing slashes
   - Must be `https://` (not `http://`)
   - Must include `/auth/v1/callback` path

### Step 5: Test the Flow

1. **Clear browser cache/cookies** (important!)
2. **Restart your dev server:**
   ```bash
   npm run dev
   ```
3. **Try logging in again**
4. **Check browser console** for any errors

## Common Issues & Solutions

### ❌ "redirect_uri_mismatch" still appears

**Solution:**
- Double-check the redirect URI in Google Cloud Console
- It must be **exactly**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- No typos, no extra characters
- Wait 1-2 minutes after saving (Google caches settings)

### ❌ "Invalid client" error

**Solution:**
- Verify Client ID and Secret in Supabase match Google Cloud Console
- Check that OAuth consent screen is configured
- Ensure Google+ API is enabled

### ❌ Redirects to wrong page

**Solution:**
- Check Supabase Site URL configuration
- Verify redirect URLs in Supabase settings
- Ensure your app URL matches what's configured

### ❌ Works locally but not in production

**Solution:**
- Add production URL to Supabase Redirect URLs
- Add production URL to Google Cloud Console redirect URIs
- Update Supabase Site URL to production URL

## Quick Checklist

- [ ] Supabase callback URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- [ ] Added to Google Cloud Console Authorized redirect URIs
- [ ] Supabase Site URL is set correctly
- [ ] Supabase Redirect URLs include your app URL
- [ ] Google OAuth Client ID and Secret are in Supabase
- [ ] Cleared browser cache
- [ ] Restarted dev server

## Testing

After configuration:

1. **Open your app** (e.g., `http://localhost:5173`)
2. **Click Login**
3. **Select Google account**
4. **Should redirect:**
   - ✅ To Google login page
   - ✅ Back to Supabase
   - ✅ Back to your app
   - ✅ User is logged in

## Need Help?

- **Check Supabase Logs:** Dashboard → Logs → Auth Logs
- **Check Browser Console:** Look for error messages
- **Verify URLs:** Make sure all URLs match exactly (case-sensitive)

---

**Important:** The redirect URI in Google Cloud Console must be the **Supabase callback URL**, not your app URL!

