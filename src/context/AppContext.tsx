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
import { signInWithGoogle, logoutUser, getUserFavorites, handleAuthCallback } from '../services/auth';
import { supabase, auth } from '../config/supabase';
import { updateUserFavorites } from '../utils/userFavorites';

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
    priceMin: number;
    priceMax: number;
    minSqft: number;
    maxSqft: number;
    ageOfProperty: string;
    possessionStatus: string;
  };
  activeType: 'fullHome' | 'rent' | 'buy';
};

const defaultFilters: Filters = {
  fullHome: {
    city: '',
    locality: '',
    propertyType: '',
    furnishingType: '',
    bhk: '',
    bathrooms: '',
    minPrice: 0,
    maxPrice: 10000000,
    minSqft: 0,
    maxSqft: 10000,
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
    maxRent: 100000,
    minSqft: 0,
    maxSqft: 10000,
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
    bhk: '',
    bathrooms: '',
    priceMin: 0,
    priceMax: 0,
    minSqft: 0,
    maxSqft: 10000,
    ageOfProperty: '',
    possessionStatus: '',
  },
  activeType: 'rent',
};

type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  isPremium: boolean;
  preferences?: string[];
  gender?: string;
  age?: number;
  profession?: string;
  city?: string;
  locality?: string;
  userPhoneNumber?: string;
};

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  favoriteProperties: string[];
  toggleFavorite: (propertyId: string) => void;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  loginError: string | null;
  clearLoginError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function setUserOnline(userId: string) {
  try {
    await supabase
      .from('users')
      .update({
        online: true,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error setting user online:', error);
  }
}

async function setUserOffline(userId: string) {
  try {
    await supabase
      .from('users')
      .update({
        online: false,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
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
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Safety timeout to ensure loading never hangs forever
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading timeout - forcing isLoading to false');
        setIsLoading(false);
      }
    }, 10000); // 10 second max loading time
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const clearLoginError = () => {
    setLoginError(null);
  };

  const login = async () => {
    try {
      clearLoginError(); // Clear any previous errors
      const result = await signInWithGoogle();
      console.log('Login initiated:', result); // DEBUG LOG
      
      // OAuth flow will redirect, so we don't set user here
      // The auth state change listener will handle user data
      if (!result.success) {
        setLoginError(result.error || 'Login failed. Please try again.');
      }
      // If success, the redirect will happen and auth state change will handle the rest
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle specific auth errors
      let errorMessage = 'Login failed. Please try again.';
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Login was cancelled. Please try again.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Login popup was blocked. Please allow popups and try again.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          default:
            errorMessage = `Login error: ${error.message || 'Please try again.'}`;
        }
      }
      setLoginError(errorMessage);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await setUserOffline(user.id);
      }
      const result = await logoutUser();
      if (result.success) {
        setUser(null);
        localStorage.removeItem('user');
        setShowOnboarding(false);
        clearLoginError();
        // Redirect to home page after logout
        window.location.href = '/';
      } else {
        // Even if logout fails, clear local state
        setUser(null);
        localStorage.removeItem('user');
        setShowOnboarding(false);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway and redirect
      setUser(null);
      localStorage.removeItem('user');
      setShowOnboarding(false);
      window.location.href = '/';
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;

    const isCurrentlyFavorite = favoriteProperties.includes(propertyId);
    const newFavoriteState = !isCurrentlyFavorite;

    setFavoriteProperties((prev) =>
      isCurrentlyFavorite
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );

    try {
      await updateUserFavorites(user.id, propertyId, newFavoriteState);
      console.log(`Property ${propertyId} ${newFavoriteState ? 'added to' : 'removed from'} favorites`);
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert the state change if the update failed
      setFavoriteProperties((prev) =>
        newFavoriteState
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId]
      );
    }
  };

  useEffect(() => {
    // Handle OAuth callback - Supabase automatically handles the code exchange
    const handleOAuthCallback = async () => {
      // Check if we're returning from OAuth (Supabase adds hash fragments)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const urlParams = new URLSearchParams(window.location.search);
      
      // Supabase OAuth returns with hash fragments or query params
      if (hashParams.get('access_token') || urlParams.get('code')) {
        // Wait a bit for Supabase to process the callback
        setTimeout(async () => {
          // Exchange the code for a session
          const { data: { session }, error } = await auth.getSession();
          
          if (session && !error) {
            // User is authenticated, handle user data
            await handleAuthCallback();
          }
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 500);
      }
    };
    handleOAuthCallback();

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      try {
        if (session?.user) {
          const userId = session.user.id;
          
          // Fetch user info from Supabase users table with timeout
          console.log('[AppContext] Fetching user data for:', userId);
          const userDataStartTime = Date.now();
          
          const userDataPromise = supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          const userDataTimeout = new Promise((resolve) => {
            setTimeout(() => {
              console.warn('[AppContext] User data query timeout');
              resolve({ data: null, error: { code: 'TIMEOUT' } });
            }, 5000);
          });
          
          const { data: userData, error } = await Promise.race([userDataPromise, userDataTimeout]) as any;
          const userDataDuration = Date.now() - userDataStartTime;
          console.log(`[AppContext] User data query completed in ${userDataDuration}ms`);
          
          let user;
          let needsOnboarding = false;
          
          if (userData && !error) {
            user = {
              id: userId,
              name: userData.name || session.user.user_metadata?.full_name || '',
              email: userData.email || session.user.email || '',
              photoURL: userData.photo_url || session.user.user_metadata?.avatar_url || '',
              isPremium: userData.is_premium || false,
              preferences: userData.preferences || [],
              gender: userData.gender || '',
              age: userData.age || 0,
              profession: userData.profession || '',
              city: userData.city || '',
              locality: userData.locality || '',
              userPhoneNumber: userData.user_phone_number || '',
            };
            
            // Check onboarding status
            // Handle both boolean true and null/undefined cases
            if (userData.onboarding_complete === true) {
              needsOnboarding = false;
            } else if (userData.onboarding_complete === false || userData.onboarding_complete === null) {
              // Check if user has required fields
              const hasRequiredFields = !!(userData.user_phone_number && userData.gender && userData.looking_for);
              if (hasRequiredFields) {
                // User has all fields, mark onboarding as complete
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ onboarding_complete: true })
                  .eq('user_id', userId);
                
                if (!updateError) {
                  needsOnboarding = false;
                } else {
                  console.error('Error updating onboarding status:', updateError);
                  needsOnboarding = true;
                }
              } else {
                needsOnboarding = true;
              }
            } else {
              // onboarding_complete is undefined or some other value
              needsOnboarding = true;
            }
          } else {
            // User doesn't exist in users table yet - create basic user object
            user = {
              id: userId,
              name: session.user.user_metadata?.full_name || '',
              email: session.user.email || '',
              photoURL: session.user.user_metadata?.avatar_url || '',
              isPremium: false,
              preferences: [],
              gender: '',
              age: 0,
              profession: '',
              city: '',
              locality: '',
              userPhoneNumber: '',
            };
            needsOnboarding = true;
          }
          
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          setShowOnboarding(needsOnboarding);
          await setUserOnline(userId);
          clearLoginError();
        } else {
          // No session
          setUser(null);
          localStorage.removeItem('user');
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        // Even on error, set loading to false so app doesn't hang
        setIsLoading(false);
      } finally {
        // Always set loading to false when auth state change completes
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    });
    
    // Check initial session immediately and process it if it exists
    // Add timeout to prevent infinite loading
    const sessionPromise = auth.getSession();
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ timeout: true }), 5000); // 5 second timeout
    });
    
    Promise.race([sessionPromise, timeoutPromise]).then(async (result: any) => {
      // If timeout occurred, just set loading to false and show homepage
      if (result.timeout) {
        console.warn('Session check timeout - showing homepage');
        setIsLoading(false);
        return;
      }
      
      const { data: { session }, error: sessionError } = result;
      
      if (sessionError || !session) {
        setIsLoading(false);
        return;
      }
      
      // Session exists - process it immediately
      try {
        const userId = session.user.id;
        
        // Fetch user info with timeout
        const userDataPromise = supabase
          .from('users')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        const userDataTimeout = new Promise((resolve) => {
          setTimeout(() => resolve({ timeout: true }), 3000); // 3 second timeout
        });
        
        const userResult: any = await Promise.race([userDataPromise, userDataTimeout]);
        
        if (userResult.timeout) {
          console.warn('User data fetch timeout - using session data');
          // Use session data as fallback
          const fallbackUser = {
            id: userId,
            name: session.user.user_metadata?.full_name || '',
            email: session.user.email || '',
            photoURL: session.user.user_metadata?.avatar_url || '',
            isPremium: false,
            preferences: [],
            gender: '',
            age: 0,
            profession: '',
            city: '',
            locality: '',
            userPhoneNumber: '',
          };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          setShowOnboarding(true);
          setIsLoading(false);
          return;
        }
        
        const { data: userData, error } = userResult;
        
        let user;
        let needsOnboarding = false;
        
        if (userData && !error) {
          user = {
            id: userId,
            name: userData.name || session.user.user_metadata?.full_name || '',
            email: userData.email || session.user.email || '',
            photoURL: userData.photo_url || session.user.user_metadata?.avatar_url || '',
            isPremium: userData.is_premium || false,
            preferences: userData.preferences || [],
            gender: userData.gender || '',
            age: userData.age || 0,
            profession: userData.profession || '',
            city: userData.city || '',
            locality: userData.locality || '',
            userPhoneNumber: userData.user_phone_number || '',
          };
          
          // Check onboarding status
          if (userData.onboarding_complete === true) {
            needsOnboarding = false;
          } else if (userData.onboarding_complete === false || userData.onboarding_complete === null) {
            const hasRequiredFields = !!(userData.user_phone_number && userData.gender && userData.looking_for);
            if (hasRequiredFields) {
              const { error: updateError } = await supabase
                .from('users')
                .update({ onboarding_complete: true })
                .eq('user_id', userId);
              needsOnboarding = !updateError;
            } else {
              needsOnboarding = true;
            }
          } else {
            needsOnboarding = true;
          }
        } else {
          // User doesn't exist in users table yet
          user = {
            id: userId,
            name: session.user.user_metadata?.full_name || '',
            email: session.user.email || '',
            photoURL: session.user.user_metadata?.avatar_url || '',
            isPremium: false,
            preferences: [],
            gender: '',
            age: 0,
            profession: '',
            city: '',
            locality: '',
            userPhoneNumber: '',
          };
          needsOnboarding = true;
        }
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setShowOnboarding(needsOnboarding);
        await setUserOnline(userId);
        clearLoginError();
      } catch (error) {
        console.error('Error processing initial session:', error);
        // On error, still show homepage
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      // Always show homepage on error
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
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
        console.log('Loading favorites for user:', user.id);
        const favorites = await getUserFavorites(user.id);
        console.log('Loaded favorites:', favorites);
        setFavoriteProperties(favorites);
      }
    };

    loadFavorites();
  }, [user]);

  // Auto-apply user's city to filters so they only see properties from their city by default
  useEffect(() => {
    const userCity = user?.city?.trim();
    if (!userCity) return;
    setFilters((prev) => {
      // If already matching, avoid re-render
      const alreadyApplied =
        prev.rent.city === userCity &&
        prev.buy.city === userCity &&
        prev.fullHome.city === userCity;
      if (alreadyApplied) return prev;
      return {
        ...prev,
        rent: { ...prev.rent, city: userCity, locality: '' },
        buy: { ...prev.buy, city: userCity, locality: '' },
        fullHome: { ...prev.fullHome, city: userCity, locality: '' },
      };
    });
  }, [user?.city]);

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    filters,
    setFilters,
    login,
    logout,
    favoriteProperties,
    toggleFavorite,
    showPreferences,
    setShowPreferences,
    loginError,
    clearLoginError,
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
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

const CATEGORY_OPTIONS = [
  { label: 'IT', value: 'IT' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Finance', value: 'Finance' }, // Add more as needed
];
