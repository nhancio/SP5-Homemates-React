import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  id: string;
  userEmail: string;
  userName: string;
  userPhoneNumber: string;
  age: number;
  gender: string;
  profession: string;
  preferences: string[];
  photoURL?: string;
  online?: boolean;
  lastActive?: number;
  city?: string;
  locality?: string;
  lookingFor?: string;
  budget?: {
    min: number;
    max: number;
  };
  moveInDate?: string;
  flatType?: string;
  roomType?: string;
  bathroomType?: string;
}

export interface PropertyListing {
  id: string;
  address: {
    city: string;
    locality: string;
    buildingName: string;
  };
  rentDetails?: {
    costs: {
      rent: number;
    };
    roomDetails: {
      availableRooms: number;
      roomType: string;
      bathroomType: string;
    };
    preferredTenant: {
      lookingFor: string;
      preferences: string[];
    };
  };
  sellDetails?: {
    price: number;
    propertyType: string;
  };
  flatType?: string;
  listingType: 'rent' | 'sell';
  userId: string;
  createdAt: number;
}

export interface MatchScore {
  user: UserProfile;
  score: number;
  breakdown: {
    preferenceMatch: number;
    locationMatch: number;
    budgetMatch: number;
    lifestyleMatch: number;
    compatibilityScore: number;
  };
  sharedPreferences: string[];
  compatibilityFactors: string[];
}

export interface PropertyMatchScore {
  property: PropertyListing;
  score: number;
  breakdown: {
    locationMatch: number;
    budgetMatch: number;
    preferenceMatch: number;
    availabilityMatch: number;
  };
  matchReasons: string[];
}

// Weighted scoring system
const MATCH_WEIGHTS = {
  PREFERENCE_MATCH: 0.35,
  LOCATION_MATCH: 0.25,
  BUDGET_MATCH: 0.20,
  LIFESTYLE_MATCH: 0.15,
  COMPATIBILITY: 0.05
};

const PROPERTY_MATCH_WEIGHTS = {
  LOCATION_MATCH: 0.30,
  BUDGET_MATCH: 0.35,
  PREFERENCE_MATCH: 0.25,
  AVAILABILITY_MATCH: 0.10
};

/**
 * Calculate preference match score between two users
 */
function calculatePreferenceMatch(user1: UserProfile, user2: UserProfile): { score: number; sharedPreferences: string[] } {
  if (!user1.preferences || !user2.preferences) {
    return { score: 0, sharedPreferences: [] };
  }

  const user1Prefs = new Set(user1.preferences.map(p => p.toLowerCase()));
  const user2Prefs = new Set(user2.preferences.map(p => p.toLowerCase()));
  
  const shared = Array.from(user1Prefs).filter(pref => user2Prefs.has(pref));
  const total = new Set([...user1Prefs, ...user2Prefs]).size;
  
  const score = total > 0 ? (shared.length / total) * 100 : 0;
  
  return {
    score: Math.min(score, 100),
    sharedPreferences: shared
  };
}

/**
 * Calculate location match score
 */
function calculateLocationMatch(user1: UserProfile, user2: UserProfile): number {
  if (!user1.city || !user2.city) return 0;
  
  const cityMatch = user1.city.toLowerCase() === user2.city.toLowerCase();
  const localityMatch = user1.locality && user2.locality && 
    user1.locality.toLowerCase() === user2.locality.toLowerCase();
  
  if (localityMatch) return 100;
  if (cityMatch) return 70;
  return 0;
}

/**
 * Calculate budget compatibility
 */
function calculateBudgetMatch(user1: UserProfile, user2: UserProfile): number {
  if (!user1.budget || !user2.budget) return 50; // Neutral score if no budget info
  
  const user1Range = user1.budget.max - user1.budget.min;
  const user2Range = user2.budget.max - user2.budget.min;
  
  const overlap = Math.min(user1.budget.max, user2.budget.max) - Math.max(user1.budget.min, user2.budget.min);
  
  if (overlap <= 0) return 0;
  
  const totalRange = Math.max(user1.budget.max, user2.budget.max) - Math.min(user1.budget.min, user2.budget.min);
  return (overlap / totalRange) * 100;
}

/**
 * Calculate lifestyle compatibility
 */
function calculateLifestyleMatch(user1: UserProfile, user2: UserProfile): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 50; // Base neutral score
  
  // Age compatibility (within 10 years)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 5) {
      score += 20;
      factors.push('Similar age group');
    } else if (ageDiff <= 10) {
      score += 10;
      factors.push('Age compatible');
    } else {
      score -= 10;
      factors.push('Age difference');
    }
  }
  
  // Profession compatibility
  if (user1.profession && user2.profession) {
    const prof1 = user1.profession.toLowerCase();
    const prof2 = user2.profession.toLowerCase();
    
    if (prof1 === prof2) {
      score += 15;
      factors.push('Same profession');
    } else if (prof1.includes('student') && prof2.includes('student')) {
      score += 10;
      factors.push('Both students');
    } else if ((prof1.includes('working') || prof1.includes('professional')) && 
               (prof2.includes('working') || prof2.includes('professional'))) {
      score += 10;
      factors.push('Both working professionals');
    }
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    factors
  };
}

/**
 * Calculate overall compatibility score
 */
function calculateCompatibilityScore(user1: UserProfile, user2: UserProfile): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 50;
  
  // Online status bonus
  if (user2.online && user2.lastActive && (Date.now() - user2.lastActive < 5 * 60 * 1000)) {
    score += 5;
    factors.push('Currently online');
  }
  
  // Profile completeness bonus
  const user2Completeness = [
    user2.photoURL,
    user2.preferences?.length > 0,
    user2.profession,
    user2.city
  ].filter(Boolean).length;
  
  if (user2Completeness >= 3) {
    score += 5;
    factors.push('Complete profile');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    factors
  };
}

/**
 * Main user matching algorithm
 */
export async function findUserMatches(currentUser: UserProfile, limit: number = 20): Promise<MatchScore[]> {
  try {
    // Get all users except current user
    const usersRef = collection(db, 'u');
    const usersSnapshot = await getDocs(usersRef);
    
    const allUsers: UserProfile[] = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (doc.id !== currentUser.id) {
        allUsers.push({
          id: doc.id,
          userEmail: data.userEmail || '',
          userName: data.userName || '',
          userPhoneNumber: data.userPhoneNumber || '',
          age: data.age || 0,
          gender: data.gender || '',
          profession: data.profession || '',
          preferences: data.preferences || [],
          photoURL: data.photoURL,
          online: data.online || false,
          lastActive: data.lastActive || 0,
          city: data.city,
          locality: data.locality,
          lookingFor: data.lookingFor,
          budget: data.budget,
          moveInDate: data.moveInDate,
          flatType: data.flatType,
          roomType: data.roomType,
          bathroomType: data.bathroomType
        });
      }
    });
    
    // Calculate match scores for each user
    const matchScores: MatchScore[] = allUsers.map(user => {
      const preferenceMatch = calculatePreferenceMatch(currentUser, user);
      const locationMatch = calculateLocationMatch(currentUser, user);
      const budgetMatch = calculateBudgetMatch(currentUser, user);
      const lifestyleMatch = calculateLifestyleMatch(currentUser, user);
      const compatibilityScore = calculateCompatibilityScore(currentUser, user);
      
      const totalScore =
        (preferenceMatch.score + locationMatch + budgetMatch + lifestyleMatch.score + compatibilityScore.score) / 5;
      console.log('Matching', currentUser.userName, 'with', user.userName, {
        preference: preferenceMatch.score,
        location: locationMatch,
        budget: budgetMatch,
        lifestyle: lifestyleMatch.score,
        compatibility: compatibilityScore.score,
        total: totalScore
      });
      
      return {
        user,
        score: Math.round(totalScore),
        breakdown: {
          preferenceMatch: Math.round(preferenceMatch.score),
          locationMatch: Math.round(locationMatch),
          budgetMatch: Math.round(budgetMatch),
          lifestyleMatch: Math.round(lifestyleMatch.score),
          compatibilityScore: Math.round(compatibilityScore.score)
        },
        sharedPreferences: preferenceMatch.sharedPreferences,
        compatibilityFactors: [...lifestyleMatch.factors, ...compatibilityScore.factors]
      };
    });
    
    // Sort by score and return top matches
    return matchScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error finding user matches:', error);
    return [];
  }
}

/**
 * Property matching algorithm
 */
export async function findPropertyMatches(user: UserProfile, listingType: 'rent' | 'sell', limit: number = 20): Promise<PropertyMatchScore[]> {
  try {
    // Get all properties
    const listingsRef = collection(db, 'listings');
    const listingsSnapshot = await getDocs(listingsRef);
    
    const allProperties: PropertyListing[] = [];
    listingsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.listingType === listingType) {
        allProperties.push({
          id: doc.id,
          address: data.address || {},
          rentDetails: data.rentDetails,
          sellDetails: data.sellDetails,
          flatType: data.flatType,
          listingType: data.listingType,
          userId: data.userId,
          createdAt: data.createdAt
        });
      }
    });
    
    // Calculate property match scores
    const propertyMatches: PropertyMatchScore[] = allProperties.map(property => {
      const locationMatch = calculatePropertyLocationMatch(user, property);
      const budgetMatch = calculatePropertyBudgetMatch(user, property, listingType);
      const preferenceMatch = calculatePropertyPreferenceMatch(user, property, listingType);
      const availabilityMatch = calculatePropertyAvailabilityMatch(user, property, listingType);
      
      const totalScore = 
        locationMatch * PROPERTY_MATCH_WEIGHTS.LOCATION_MATCH +
        budgetMatch * PROPERTY_MATCH_WEIGHTS.BUDGET_MATCH +
        preferenceMatch * PROPERTY_MATCH_WEIGHTS.PREFERENCE_MATCH +
        availabilityMatch * PROPERTY_MATCH_WEIGHTS.AVAILABILITY_MATCH;
      
      const matchReasons = [];
      if (locationMatch > 70) matchReasons.push('Perfect location match');
      if (budgetMatch > 80) matchReasons.push('Within your budget');
      if (preferenceMatch > 60) matchReasons.push('Matches your preferences');
      if (availabilityMatch > 90) matchReasons.push('Available when you need');
      
      return {
        property,
        score: Math.round(totalScore),
        breakdown: {
          locationMatch: Math.round(locationMatch),
          budgetMatch: Math.round(budgetMatch),
          preferenceMatch: Math.round(preferenceMatch),
          availabilityMatch: Math.round(availabilityMatch)
        },
        matchReasons
      };
    });
    
    return propertyMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error finding property matches:', error);
    return [];
  }
}

/**
 * Calculate property location match
 */
function calculatePropertyLocationMatch(user: UserProfile, property: PropertyListing): number {
  if (!user.city || !property.address.city) return 0;
  
  const userCity = user.city.toLowerCase();
  const propertyCity = property.address.city.toLowerCase();
  
  if (userCity === propertyCity) {
    if (user.locality && property.address.locality) {
      const userLocality = user.locality.toLowerCase();
      const propertyLocality = property.address.locality.toLowerCase();
      return userLocality === propertyLocality ? 100 : 80;
    }
    return 80;
  }
  
  return 0;
}

/**
 * Calculate property budget match
 */
function calculatePropertyBudgetMatch(user: UserProfile, property: PropertyListing, listingType: 'rent' | 'sell'): number {
  if (!user.budget) return 50;
  
  let propertyPrice = 0;
  if (listingType === 'rent' && property.rentDetails?.costs?.rent) {
    propertyPrice = property.rentDetails.costs.rent;
  } else if (listingType === 'sell' && property.sellDetails?.price) {
    propertyPrice = property.sellDetails.price;
  }
  
  if (propertyPrice === 0) return 50;
  
  if (propertyPrice >= user.budget.min && propertyPrice <= user.budget.max) {
    return 100;
  } else if (propertyPrice <= user.budget.max * 1.1) {
    return 70;
  } else if (propertyPrice <= user.budget.max * 1.2) {
    return 40;
  }
  
  return 0;
}

/**
 * Calculate property preference match
 */
function calculatePropertyPreferenceMatch(user: UserProfile, property: PropertyListing, listingType: 'rent' | 'sell'): number {
  let score = 50;
  
  // Flat type match
  if (user.flatType && property.flatType && user.flatType === property.flatType) {
    score += 20;
  }
  
  // Room type match (for rent)
  if (listingType === 'rent' && user.roomType && property.rentDetails?.roomDetails?.roomType) {
    if (user.roomType === property.rentDetails.roomDetails.roomType) {
      score += 15;
    }
  }
  
  // Bathroom type match (for rent)
  if (listingType === 'rent' && user.bathroomType && property.rentDetails?.roomDetails?.bathroomType) {
    if (user.bathroomType === property.rentDetails.roomDetails.bathroomType) {
      score += 15;
    }
  }
  
  return Math.min(100, score);
}

/**
 * Calculate property availability match
 */
function calculatePropertyAvailabilityMatch(user: UserProfile, property: PropertyListing, listingType: 'rent' | 'sell'): number {
  // For now, return a base score
  // This could be enhanced with actual availability data
  return 80;
}

/**
 * Simple preference match percentage (for user vs flat or user vs user)
 * Returns { percent: number, matched: number, total: number, matches: string[] }
 */
export function calculateSimplePreferenceMatch(userPrefs: string[], flatPrefs: string[]): {
  percent: number;
  matched: number;
  total: number;
  matches: string[];
} {
  if (!Array.isArray(userPrefs) || !Array.isArray(flatPrefs) || flatPrefs.length === 0) {
    return { percent: 0, matched: 0, total: flatPrefs.length, matches: [] };
  }
  const matches = flatPrefs.filter(pref => userPrefs.includes(pref));
  const percent = Math.round((matches.length / flatPrefs.length) * 100);
  return {
    percent,
    matched: matches.length,
    total: flatPrefs.length,
    matches
  };
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(user: UserProfile): Promise<{
  topUserMatches: MatchScore[];
  topPropertyMatches: PropertyMatchScore[];
}> {
  const [userMatches, rentMatches, sellMatches] = await Promise.all([
    findUserMatches(user, 10),
    findPropertyMatches(user, 'rent', 5),
    findPropertyMatches(user, 'sell', 5)
  ]);
  
  return {
    topUserMatches: userMatches,
    topPropertyMatches: [...rentMatches, ...sellMatches].sort((a, b) => b.score - a.score).slice(0, 10)
  };
}

/**
 * Get compatibility insights for two users
 */
export function getCompatibilityInsights(user1: UserProfile, user2: UserProfile): {
  overallScore: number;
  strengths: string[];
  areas: string[];
  recommendations: string[];
} {
  console.log('Compatibility Insights:', {
    user1: { name: user1.userName, preferences: user1.preferences, city: user1.city, locality: user1.locality },
    user2: { name: user2.userName, preferences: user2.preferences, city: user2.city, locality: user2.locality }
  });
  const preferenceMatch = calculatePreferenceMatch(user1, user2);
  const locationMatch = calculateLocationMatch(user1, user2);
  const budgetMatch = calculateBudgetMatch(user1, user2);
  const lifestyleMatch = calculateLifestyleMatch(user1, user2);
  const compatibilityScore = calculateCompatibilityScore(user1, user2);
  
  const overallScore = Math.round(
    preferenceMatch.score * MATCH_WEIGHTS.PREFERENCE_MATCH +
    locationMatch * MATCH_WEIGHTS.LOCATION_MATCH +
    budgetMatch * MATCH_WEIGHTS.BUDGET_MATCH +
    lifestyleMatch.score * MATCH_WEIGHTS.LIFESTYLE_MATCH +
    compatibilityScore.score * MATCH_WEIGHTS.COMPATIBILITY
  );
  
  const strengths: string[] = [];
  const areas: string[] = [];
  const recommendations: string[] = [];
  
  if (preferenceMatch.score > 70) {
    strengths.push(`Great preference match (${preferenceMatch.score}%)`);
    strengths.push(`Shared interests: ${preferenceMatch.sharedPreferences.slice(0, 3).join(', ')}`);
  } else if (preferenceMatch.score < 30) {
    areas.push('Limited shared preferences');
    recommendations.push('Consider expanding your interests to find more matches');
  }
  
  if (locationMatch > 80) {
    strengths.push('Perfect location match');
  } else if (locationMatch === 0) {
    areas.push('Different locations');
    recommendations.push('Consider expanding your search area');
  }
  
  if (budgetMatch > 80) {
    strengths.push('Budget compatible');
  } else if (budgetMatch < 30) {
    areas.push('Budget mismatch');
    recommendations.push('Consider adjusting your budget range');
  }
  
  if (lifestyleMatch.score > 70) {
    strengths.push(...lifestyleMatch.factors);
  }
  
  if (compatibilityScore.score > 70) {
    strengths.push(...compatibilityScore.factors);
  }
  
  return {
    overallScore,
    strengths,
    areas,
    recommendations
  };
} 

export { calculatePreferenceMatch, calculateLocationMatch, calculateBudgetMatch, calculateLifestyleMatch };

// MOCK USERS FOR LOCAL TESTING
export const mockUsers: UserProfile[] = [
  {
    id: 'u1',
    userEmail: 'alice@example.com',
    userName: 'Alice',
    userPhoneNumber: '9876543210',
    age: 24,
    gender: 'Female',
    profession: 'Engineer',
    preferences: ['Music', 'Yoga', 'Movies'],
    photoURL: '',
    online: true,
    lastActive: Date.now() - 10000,
    city: 'Bangalore',
    locality: 'Indiranagar',
    budget: { min: 10000, max: 20000 },
    lookingFor: 'Flatmate',
    moveInDate: '2024-07-01',
    flatType: '2BHK',
    roomType: 'Single',
    bathroomType: 'Attached',
  },
  {
    id: 'u2',
    userEmail: 'bob@example.com',
    userName: 'Bob',
    userPhoneNumber: '9123456789',
    age: 29,
    gender: 'Male',
    profession: 'Doctor',
    preferences: ['Cricket', 'Cooking', 'Music'],
    photoURL: '',
    online: false,
    lastActive: Date.now() - 600000,
    city: 'Hyderabad',
    locality: 'Gachibowli',
    budget: { min: 15000, max: 25000 },
    lookingFor: 'Roommate',
    moveInDate: '2024-08-01',
    flatType: '3BHK',
    roomType: 'Shared',
    bathroomType: 'Common',
  },
  {
    id: 'u3',
    userEmail: 'carol@example.com',
    userName: 'Carol',
    userPhoneNumber: '9988776655',
    age: 22,
    gender: 'Female',
    profession: 'Student',
    preferences: ['Reading', 'Yoga', 'Badminton'],
    photoURL: '',
    online: true,
    lastActive: Date.now() - 30000,
    city: 'Chennai',
    locality: 'Adyar',
    budget: { min: 8000, max: 12000 },
    lookingFor: 'Flatmate',
    moveInDate: '2024-07-15',
    flatType: '1BHK',
    roomType: 'Single',
    bathroomType: 'Attached',
  },
  {
    id: 'u4',
    userEmail: 'dave@example.com',
    userName: 'Dave',
    userPhoneNumber: '9871234560',
    age: 35,
    gender: 'Male',
    profession: 'Artist',
    preferences: ['Music', 'Movies', 'Cooking'],
    photoURL: '',
    online: false,
    lastActive: Date.now() - 900000,
    city: 'Bangalore',
    locality: 'Whitefield',
    budget: { min: 20000, max: 30000 },
    lookingFor: 'Roommate',
    moveInDate: '2024-09-01',
    flatType: '2BHK',
    roomType: 'Shared',
    bathroomType: 'Common',
  },
]; 