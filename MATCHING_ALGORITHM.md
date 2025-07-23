# Preference Matching Algorithm

## Overview

The Homemates app now features an advanced preference matching algorithm that intelligently matches users based on multiple criteria including preferences, location, budget, lifestyle, and compatibility factors.

## Algorithm Components

### 1. User Matching (`findUserMatches`)

Matches users with potential flatmates based on:

- **Preference Match (35% weight)**: Shared interests and lifestyle preferences
- **Location Match (25% weight)**: City and locality compatibility  
- **Budget Match (20% weight)**: Budget range overlap
- **Lifestyle Match (15% weight)**: Age, profession, and lifestyle compatibility
- **Compatibility Score (5% weight)**: Online status and profile completeness

### 2. Property Matching (`findPropertyMatches`)

Matches users with properties based on:

- **Location Match (30% weight)**: City and locality preferences
- **Budget Match (35% weight)**: Price/rent within budget range
- **Preference Match (25% weight)**: Flat type, room type, bathroom type
- **Availability Match (10% weight)**: Move-in date compatibility

## Key Features

### Smart Scoring System
- Weighted scoring across multiple dimensions
- Normalized scores (0-100%) for easy comparison
- Detailed breakdown of match factors

### Compatibility Insights
- Detailed analysis of match strengths and weaknesses
- Personalized recommendations for better matches
- Shared preference highlighting

### Real-time Updates
- Online status tracking
- Profile completeness scoring
- Dynamic match recalculation

## Usage Examples

### Find User Matches
```typescript
import { findUserMatches } from '../services/matching';

const matches = await findUserMatches(currentUser, 20);
// Returns top 20 matches with scores and breakdowns
```

### Get Property Matches
```typescript
import { findPropertyMatches } from '../services/matching';

const propertyMatches = await findPropertyMatches(user, 'rent', 10);
// Returns top 10 rental property matches
```

### Compatibility Analysis
```typescript
import { getCompatibilityInsights } from '../services/matching';

const insights = getCompatibilityInsights(user1, user2);
// Returns detailed compatibility analysis
```

## Algorithm Weights

### User Matching Weights
- Preference Match: 35%
- Location Match: 25%
- Budget Match: 20%
- Lifestyle Match: 15%
- Compatibility Score: 5%

### Property Matching Weights
- Location Match: 30%
- Budget Match: 35%
- Preference Match: 25%
- Availability Match: 10%

## Match Score Calculation

### Preference Match
```typescript
const shared = user1Prefs.filter(pref => user2Prefs.has(pref));
const total = new Set([...user1Prefs, ...user2Prefs]).size;
const score = (shared.length / total) * 100;
```

### Location Match
- Same locality: 100%
- Same city: 70%
- Different city: 0%

### Budget Match
- Perfect overlap: 100%
- Partial overlap: Calculated percentage
- No overlap: 0%

### Lifestyle Match
- Age difference ≤ 5 years: +20 points
- Age difference ≤ 10 years: +10 points
- Same profession: +15 points
- Both students: +10 points
- Both working professionals: +10 points

## Implementation Files

- `src/services/matching.ts` - Core matching algorithms
- `src/pages/FindFriendsPage.tsx` - Enhanced user matching interface
- `src/components/MatchingDashboard.tsx` - Algorithm showcase dashboard
- `src/pages/HomePage.tsx` - Integrated dashboard display

## Future Enhancements

1. **Machine Learning Integration**
   - User behavior analysis
   - Predictive matching
   - Learning from successful matches

2. **Advanced Filters**
   - Personality type matching
   - Cultural preferences
   - Pet compatibility

3. **Real-time Matching**
   - Live preference updates
   - Instant match notifications
   - Dynamic score recalculation

4. **Property Recommendations**
   - Amenity-based matching
   - Neighborhood preferences
   - Transportation accessibility

## Performance Considerations

- Efficient Firebase queries with indexing
- Cached match results for better performance
- Pagination for large datasets
- Background match calculation

## Testing

The algorithm can be tested using:
- Unit tests for individual scoring functions
- Integration tests for full matching pipeline
- User acceptance testing with real data
- Performance testing with large datasets 