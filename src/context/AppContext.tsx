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
  rent: {
    city: string;
    locality: string;
    propertyType: string;
    furnishingType: string;
    roomType: string;
    bathroomType: string;
    minRent: number;
    maxRent: number;
    preferredTenant: string;
    amenities: string[];
  };
  buy: {
    city: string;
    locality: string;
    propertyType: string;
    furnishingType: string;
    minPrice: number;
    maxPrice: number;
    minSqft: number;
    maxSqft: number;
    ageOfProperty: string;
    possessionStatus: string;
    amenities: string[];
  };
  activeType: 'rent' | 'buy';
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
  activeType: 'buy',
  rent: {
    city: '',
    locality: '',
    propertyType: '',
    furnishingType: '',
    roomType: '',
    bathroomType: '',
    minRent: 0,
    maxRent: 0,
    preferredTenant: '',
    amenities: [],
  },
  buy: {
    city: '',
    locality: '',
    propertyType: '',
    furnishingType: '',
    minPrice: 0,
    maxPrice: 0,
    minSqft: 0,
    maxSqft: 0,
    ageOfProperty: '',
    possessionStatus: '',
    amenities: [],
  },
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
