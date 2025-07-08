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
import { doc, getDoc } from 'firebase/firestore';

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

type Filters = {
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
    minPrice: 0,
    maxPrice: 0,
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
    minRent: 0,
    maxRent: 100000,
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
    minPrice: 0,
    maxPrice: 10000000,
    minSqft: 0,
    maxSqft: 0,
    ageOfProperty: '',
    possessionStatus: '',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const login = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));

        if (result.isNewUser) {
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
        } else {
          userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            isPremium: false,
            preferences: [],
          };
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });
    return () => unsubscribe();
  }, []);

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
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
