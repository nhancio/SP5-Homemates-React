# 🔍 Supabase Query Debugging & Performance Fixes

## Issues Fixed

### 1. **Infinite Loading on Profile Page**
- **Problem**: Profile page was stuck on "Loading profile..." 
- **Root Cause**: User data query had no timeout, could hang indefinitely
- **Fix**: Added 5-second timeout with fallback to session data
- **Location**: `src/pages/ProfilePage.tsx`

### 2. **Infinite Loading on Home Page Properties**
- **Problem**: FeaturedProperties component loading forever
- **Root Cause**: `getListings()` queries had no timeout
- **Fix**: Added 10-second timeout, returns empty arrays on timeout/error
- **Location**: `src/components/sections/FeaturedProperties.tsx`

### 3. **Slow Supabase Queries**
- **Problem**: All queries could hang without timeout
- **Fix**: Created `queryWithTimeout` helper utility
- **Location**: `src/utils/supabaseHelpers.ts`

## Debugging Features Added

### Console Logging
All Supabase queries now log:
- `[OperationName] Starting query...`
- `[OperationName] Success in Xms`
- `[OperationName] Error after Xms: [error details]`
- `[OperationName] Timeout after Xms`

### Timeout Protection
- **Profile queries**: 5 seconds
- **Listings queries**: 8 seconds  
- **Featured properties**: 10 seconds
- **User favorites**: 3 seconds
- **Markets**: 5 seconds
- **Auth state**: 5 seconds

### Error Handling
- All queries return empty arrays/objects on error (no crashes)
- Fallback data used when queries fail
- Homepage always shows (never blocked)

## Files Modified

1. ✅ `src/utils/supabaseHelpers.ts` - New timeout utility
2. ✅ `src/services/listings.ts` - Added timeouts to all queries
3. ✅ `src/pages/ProfilePage.tsx` - Added timeout + fallback
4. ✅ `src/components/sections/FeaturedProperties.tsx` - Added timeout
5. ✅ `src/pages/RentPropertiesPage.tsx` - Added timeout for gender query
6. ✅ `src/services/markets.ts` - Added timeouts
7. ✅ `src/utils/userFavorites.ts` - Added timeout
8. ✅ `src/context/AppContext.tsx` - Added timeouts to user data queries

## How to Debug

### Check Browser Console
Look for logs like:
```
[getListings-rent] Starting query...
[getListings-rent] Success in 234ms
```

### Check for Timeouts
If you see:
```
[OperationName] Timeout after Xms
```
The query is taking too long - check:
1. Supabase connection
2. Network issues
3. Database performance
4. RLS policies blocking queries

### Check Query Performance
All queries log their duration. If > 3 seconds:
- Check Supabase dashboard for slow queries
- Verify indexes are created
- Check RLS policies aren't too complex

## Testing

1. **Open browser console** (F12)
2. **Navigate to home page** - Check for `[FeaturedProperties]` logs
3. **Navigate to profile** - Check for `[ProfilePage]` logs
4. **Check network tab** - Verify Supabase requests complete
5. **Look for timeout warnings** - If any, investigate that query

## Fallback Behavior

If any query fails or times out:
- ✅ Homepage still shows
- ✅ Empty arrays returned (no crashes)
- ✅ User can still navigate
- ✅ Error logged to console for debugging

## Next Steps if Issues Persist

1. **Check Supabase Dashboard**:
   - Go to Logs → API Logs
   - Check for slow queries
   - Verify RLS policies

2. **Check Network**:
   - Open DevTools → Network
   - Filter by "supabase"
   - Check response times

3. **Verify Environment Variables**:
   - Check `.env` file exists
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Restart dev server after changes

4. **Check Database**:
   - Verify tables exist
   - Check RLS policies allow reads
   - Verify indexes on frequently queried columns

