import * as React from 'react';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import OnboardingModal from '../components/modals/OnboardingModal';
import PreferencesModal from '../components/modals/PreferencesModal';
import { signInWithGoogle, logoutUser, getUserFavorites } from '../services/auth';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

type BaseFilters = {
  priceMin: number;
  priceMax: number;
  location: string;
  propertyType: string;
};

type RentFilters = BaseFilters & {
  roomType: string;
  tenantType: string;
  bathroomType: string;
};

type BuyFilters = BaseFilters & {
  builtUpArea: number;
  ageOfProperty: string;
  possessionStatus: string;
};

export type Filters = {
  fullHome: {
    city: string;
    locality: string;
    propertyType: string;
    furnishingType: string;
    bhk: string;
    bathrooms: string;
    minPrice: number;
    maxPrice: number;
    minSqft: number;
    maxSqft: number;
    amenities: string;
    availability: string;
    availableFrom: string;
    ageOfProperty: string;
    possessionStatus: string;
  };
  rent: {
    city: string;
    locality: string;
    propertyType: string;
    furnishingType: string;
    bhk: string;
    bathrooms: string;
    minRent: number;
    maxRent: number;
    minSqft: number;
    maxSqft: number;
    amenities: string;
    availability: string;
    availableFrom: string;
    ageOfProperty: string;
    possessionStatus: string;
  };
  buy: {
    city: string;
    locality: string;
    propertyType: string;
    bhk?: string;
    bathrooms?: string;
    minPrice: number;
    maxPrice: number;
    minSqft: number;
    maxSqft: number;
    ageOfProperty: string;
    possessionStatus: string;
  };
  activeType: 'fullHome' | 'rent' | 'buy';
};

type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  isPremium: boolean;
  preferences?: string[];
};

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  favoriteProperties: string[];
  toggleFavorite: (propertyId: string) => void;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
}

const defaultFilters: Filters = {
  activeType: 'fullHome',
  fullHome: {
    city: '',
    locality: '',
    propertyType: '',
    furnishingType: '',
    bhk: '',
    bathrooms: '',
    minPrice: 1000,
    maxPrice: 30000,
    minSqft: 0,
    maxSqft: 0,
    amenities: '',
    availability: '',
    availableFrom: '',
    ageOfProperty: '',
    possessionStatus: '',
  },
  rent: {
    city: '',
    locality: '',
    propertyType: '',
    furnishingType: '',
    bhk: '',
    bathrooms: '',
    minRent: 1000,
    maxRent: 30000,
    minSqft: 0,
    maxSqft: 0,
    amenities: '',
    availability: '',
    availableFrom: '',
    ageOfProperty: '',
    possessionStatus: '',
  },
  buy: {
    city: '',
    locality: '',
    propertyType: '',
    minPrice: 1000,
    maxPrice: 30000,
    minSqft: 0,
    maxSqft: 0,
    ageOfProperty: '',
    possessionStatus: '',
  }
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Add setUserOnline and setUserOffline
async function setUserOnline(userId: string) {
  try {
    await updateDoc(doc(db, 'u', userId), {
      online: true,
      lastActive: Date.now(),
    });
  } catch (e) { /* ignore */ }
}
async function setUserOffline(userId: string) {
  try {
    await updateDoc(doc(db, 'u', userId), {
      online: false,
      lastActive: Date.now(),
    });
  } catch (e) { /* ignore */ }
}

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [filters, setFilters] = React.useState<Filters>(defaultFilters);
  const [favoriteProperties, setFavoriteProperties] = React.useState<string[]>([]);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const login = async () => {
    try {
      const result = await signInWithGoogle();
      console.log('Login result:', result); // DEBUG LOG
      if (result.success && 'user' in result && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        await setUserOnline(result.user.id);
        if ('isNewUser' in result && result.isNewUser) {
          console.log('New user detected, showing onboarding modal'); // DEBUG LOG
          setShowOnboarding(true);
        }
      } else {
        console.error('Login failed:', result);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    if (user) {
      await setUserOffline(user.id);
    }
    const result = await logoutUser();
    if (result.success) {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;

    setFavoriteProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user info from Firestore 'u' table
        const userRef = doc(db, 'u', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        let userData;
        let needsOnboarding = false;
        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            id: firebaseUser.uid,
            name: data.name || firebaseUser.displayName || '',
            email: data.email || firebaseUser.email || '',
            photoURL: data.photoURL || firebaseUser.photoURL || '',
            isPremium: data.isPremium || false,
            preferences: data.preferences || [],
          };
          // Check for required fields
          const hasRequiredFields = !!(data.userPhoneNumber && data.gender && data.lookingFor);
          if (typeof data.onboardingComplete === 'undefined') {
            if (hasRequiredFields) {
              await updateDoc(userRef, { onboardingComplete: true });
              needsOnboarding = false;
            } else {
              needsOnboarding = true;
            }
          } else {
            needsOnboarding = !data.onboardingComplete;
          }
        } else {
          userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            isPremium: false,
            preferences: [],
          };
          needsOnboarding = true;
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setShowOnboarding(needsOnboarding);
        await setUserOnline(firebaseUser.uid);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });
    return () => unsubscribe();
  }, []);

  // Set user offline on tab close
  useEffect(() => {
    if (!user) return;
    const handleUnload = () => setUserOffline(user.id);
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user]);

  // Update lastActive every 60 seconds while logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setUserOnline(user.id);
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        const favorites = await getUserFavorites(user.id);
        setFavoriteProperties(favorites);
      }
    };

    loadFavorites();
  }, [user]);

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    filters,
    setFilters,
    login,
    logout,
    favoriteProperties,
    toggleFavorite,
    showPreferences,
    setShowPreferences,
  };

  // Block app features if onboarding is required
  return (
    <AppContext.Provider value={value}>
      {children}
      {showOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          email={user.email}
          name={user.name}
          onClose={() => setShowOnboarding(false)}
        />
      )}
      {showPreferences && user && (
        <PreferencesModal onClose={() => setShowPreferences(false)} />
      )}
      {showOnboarding && <div className="fixed inset-0 bg-white bg-opacity-80 z-40" />} {/* Overlay to block features */}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

const CATEGORY_OPTIONS = [
  { label: 'IT', value: 'IT' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Finance', value: 'Finance' }, // Add more as needed
];
