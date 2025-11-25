import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Award, Settings, LogOut, X, CreditCard, Pencil, Trash, MoreVertical, Eye, Edit, Star, Info, UserCheck, Users, MessageCircle, Briefcase, Headphones, Shield } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../config/supabase';
import PropertyCard from '../components/ui/PropertyCard';
import { getListingsByUser, initiatePhonePePayment, updateListing, deleteListing } from '../services/listings';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import QRCode from 'react-qr-code';
import { getUserFavorites } from '../utils/userFavorites';
import { getListingsByIds } from '../services/listings';
import { getUsers } from '../services/users';
import { USER_PREFERENCES } from '../constants/theme';
import * as LucideIcons from 'lucide-react';
import * as Yup from 'yup';

// Add WhatsAppIcon helper
const WhatsAppIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 mr-1 inline-block align-middle" />
);
// Add GmailIcon helper
const GmailIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png" alt="Gmail" className="w-5 h-5 mr-1 inline-block align-middle" />
);

const profileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Phone number is required'),
  age: Yup.number().min(16, 'Age must be at least 16').max(120, 'Age must be realistic').required('Age is required'),
  gender: Yup.string().required('Gender is required'),
  profession: Yup.string().required('Profession is required'),
  city: Yup.string().required('City is required'),
  bio: Yup.string().min(10, 'Bio should be at least 10 characters'),
  lookingFor: Yup.string(),
  preferences: Yup.array().of(Yup.string()),
  funFact: Yup.string(),
  linkedin: Yup.string().url('Enter a valid LinkedIn URL').nullable(),
  instagram: Yup.string().url('Enter a valid Instagram URL').nullable(),
  facebook: Yup.string().url('Enter a valid Facebook URL').nullable(),
});

const ProfilePage = () => {

  const { user, isAuthenticated, login, logout, loginError, clearLoginError } = useAppContext();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [deletingListing, setDeletingListing] = useState<string | null>(null);
  const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    profession: '',
  });

  // Inline editing state (must be at the top, unconditional)
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [editingLookingFor, setEditingLookingFor] = useState(false);
  const [lookingForInput, setLookingForInput] = useState('');
  const [editingFunFact, setEditingFunFact] = useState(false);
  const [funFactInput, setFunFactInput] = useState('');
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [preferencesInput, setPreferencesInput] = useState<string[]>([]);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<any>({});

  // Edit Profile Modal state
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  // Add coverPhotoURL to profile state and edit form
  const [editProfileForm, setEditProfileForm] = useState({
    photoURL: '',
    coverPhotoURL: '',
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    profession: '',
    city: '',
    bio: '',
    lookingFor: '',
    preferences: [],
    funFact: '',
    linkedin: '',
    instagram: '',
    facebook: ''
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [mutualUsers, setMutualUsers] = useState<any[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'My Profile | Homemates';
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchUserCredits();
    }
  }, [user, isAuthenticated]);

  const fetchUserCredits = async () => {
    try {
      const { getUserCredits } = await import('../services/credits');
      const creditInfo = await getUserCredits(user!.id);
      setUserCredits(Math.max(0, creditInfo.credits));
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileUser(null);
        return;
      }
      setLoading(true);
      try {
        console.log('[ProfilePage] Fetching user profile for:', user.id);
        const startTime = Date.now();
        
        // Fetch from Supabase users table with timeout
        const queryPromise = supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('[ProfilePage] User profile query timeout after 3s - using session data');
            resolve({ data: null, error: { message: 'Timeout', code: 'TIMEOUT' } });
          }, 3000); // Reduced to 3 seconds for faster fallback
        });
        
        const { data: userData, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        const duration = Date.now() - startTime;
        console.log(`[ProfilePage] Query completed in ${duration}ms`);
        
        if (error && error.code !== 'PGRST116') {
          console.error('[ProfilePage] Error fetching user:', error);
          // Show error but don't block - use fallback data
          setProfileUser({
            id: user.id,
            photoURL: user.photoURL,
            userName: user.name,
            userEmail: user.email,
            userPhoneNumber: user.userPhoneNumber || '',
            age: user.age || 0,
            gender: user.gender || '',
            profession: user.profession || '',
            city: user.city || '',
            locality: user.locality || '',
            bio: '',
            lookingFor: '',
            preferences: user.preferences || [],
            funFact: '',
            coverPhotoURL: '',
            linkedin: '',
            instagram: '',
            facebook: '',
          });
          setLoading(false);
          return;
        }
        
        if (userData && !error) {
          // Transform Supabase data to match expected format
          setProfileUser({
            id: user.id,
            photoURL: userData.photo_url,
            userName: userData.name,
            userEmail: userData.email,
            userPhoneNumber: userData.user_phone_number,
            age: userData.age,
            gender: userData.gender,
            profession: userData.profession,
            city: userData.city,
            locality: userData.locality,
            bio: userData.bio,
            lookingFor: userData.looking_for,
            preferences: userData.preferences || [],
            funFact: userData.fun_fact,
            coverPhotoURL: userData.cover_photo_url,
            linkedin: userData.linkedin,
            instagram: userData.instagram,
            facebook: userData.facebook,
          });
        } else {
          // fallback to auth user if not found
          setProfileUser(user);
        }
      } catch (err) {
        setProfileUser(user);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Fetch user listings with timeout
    const fetchUserListings = async () => {
      if (!user) return;
      
      setListingsLoading(true);
      setListingsError(null);
      
      try {
        console.log('[ProfilePage] Fetching user listings for:', user.id);
        const startTime = Date.now();
        
        // Add timeout to listings query
        const listingsPromise = getListingsByUser(user.id);
        const listingsTimeout = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('[ProfilePage] Listings query timeout');
            resolve([]);
          }, 5000);
        });
        
        const listings = await Promise.race([listingsPromise, listingsTimeout]) as any[];
        const duration = Date.now() - startTime;
        console.log(`[ProfilePage] Listings fetched in ${duration}ms, count: ${listings?.length || 0}`);
        
        setUserListings(listings || []);
      } catch (error) {
        console.error('[ProfilePage] Error fetching user listings:', error);
        setListingsError('Failed to load listings');
        setUserListings([]);
      } finally {
        setListingsLoading(false);
      }
    };
    fetchUserListings();
  }, [user]);

  useEffect(() => {
    if (profileUser) {
      setBioInput(profileUser.bio || profileUser.about || '');
      setLookingForInput(profileUser.lookingFor || profileUser.openTo || '');
      setFunFactInput(profileUser.funFact || '');
      setPreferencesInput(profileUser.preferences || []);
    }
  }, [profileUser]);

  useEffect(() => {
    setEditProfileForm({
      photoURL: profileUser?.photoURL || '',
      coverPhotoURL: profileUser?.coverPhotoURL || '',
      name: profileUser?.userName || profileUser?.name || '',
      email: profileUser?.userEmail || profileUser?.email || '',
      phone: profileUser?.userPhoneNumber || profileUser?.phoneNumber || '',
      age: profileUser?.age || '',
      gender: profileUser?.gender || '',
      profession: profileUser?.profession || '',
      city: profileUser?.address?.city || profileUser?.city || '',
      bio: profileUser?.bio || profileUser?.about || '',
      lookingFor: profileUser?.lookingFor || profileUser?.openTo || '',
      preferences: profileUser?.preferences || [],
      funFact: profileUser?.funFact || '',
      linkedin: profileUser?.linkedin || '',
      instagram: profileUser?.instagram || '',
      facebook: profileUser?.facebook || ''
    });
  }, [profileUser]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user || !user.id) return;
      try {
        console.log('[ProfilePage] Fetching recent activity...');
        const startTime = Date.now();
        
        // Add timeout to favorites query
        const favoritesPromise = getUserFavorites(user.id);
        const favoritesTimeout = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('[ProfilePage] Favorites query timeout');
            resolve([]);
          }, 3000);
        });
        
        const favoriteIds = await Promise.race([favoritesPromise, favoritesTimeout]) as string[];
        const favoritesDuration = Date.now() - startTime;
        console.log(`[ProfilePage] Favorites fetched in ${favoritesDuration}ms`);
        
        if (favoriteIds && favoriteIds.length > 0) {
          const recentIds = favoriteIds.slice(-5).reverse(); // last 5, most recent first
          const propertiesStartTime = Date.now();
          const properties = await getListingsByIds(recentIds);
          const propertiesDuration = Date.now() - propertiesStartTime;
          console.log(`[ProfilePage] Properties fetched in ${propertiesDuration}ms`);
          setRecentProperties(properties);
        } else {
          setRecentProperties([]);
        }
      } catch (err) {
        console.error('[ProfilePage] Error fetching recent activity:', err);
        setRecentProperties([]);
      }
    };
    fetchRecentActivity();
  }, [user]);

  useEffect(() => {
    const fetchMutualInterests = async () => {
      if (!user || !profileUser || !profileUser.preferences || !profileUser.preferences.length) {
        setMutualUsers([]);
        return;
      }
      try {
        // Skip getUsers() as it returns empty array - this was causing delay
        // For now, set empty array. Can be implemented later with proper Supabase query
        setMutualUsers([]);
      } catch (err) {
        console.error('[ProfilePage] Error fetching mutual interests:', err);
        setMutualUsers([]);
      }
    };
    fetchMutualInterests();
  }, [user, profileUser]);



  const handlePhonePePayment = async () => {
    const upgradeAmount = 999; // Premium upgrade amount
    const userPhone = profileUser?.userPhoneNumber || profileUser?.phoneNumber || '';
    
    if (!userPhone) {
      alert('Please add your phone number to your profile to proceed with payment.');
      return;
    }

    try {
      const res = await initiatePhonePePayment(upgradeAmount, userPhone);
      console.log('PhonePe payment response:', res);
    } catch (err) {
      alert('Payment initiation failed');
      console.error(err);
    }
  };

  const handleEditListing = (listing: any) => {
    // Navigate to edit page with listing data
    navigate(`/edit-listing/${listing.listingType}/${listing.id}`, {
      state: { listing }
    });
  };

  const handleDeleteListing = async (listing: any) => {
    if (!confirm(`Are you sure you want to delete the listing "${listing.title || 'this'}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingListing(listing.id);
    try {
      await deleteListing(listing.listingType, listing.id);
      // Remove from local state
      setUserListings(prev => prev.filter(l => l.id !== listing.id));
      alert('Listing deleted successfully!');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    } finally {
      setDeletingListing(null);
    }
  };

  // Add click-away listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdowns = document.querySelectorAll('.z-20.animate-fade-in');
      let clickedInside = false;
      dropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target as Node)) clickedInside = true;
      });
      if (!clickedInside) setShowOptionsFor(null);
    }
    if (showOptionsFor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptionsFor]);

  const handleEditProfileChange = (field: string, value: any) => {
    setEditProfileForm(prev => ({ ...prev, [field]: value }));
  };
  const handleEditProfileSave = async () => {
    setSavingField('editProfileModal');
    try {
      await profileSchema.validate(editProfileForm, { abortEarly: false });
      setProfileErrors({});
      await supabase
        .from('users')
        .update({
          photo_url: editProfileForm.photoURL,
          name: editProfileForm.name,
          email: editProfileForm.email,
        userPhoneNumber: editProfileForm.phone,
        age: editProfileForm.age,
        gender: editProfileForm.gender,
        profession: editProfileForm.profession,
        city: editProfileForm.city,
        bio: editProfileForm.bio,
        lookingFor: editProfileForm.lookingFor,
        preferences: editProfileForm.preferences,
        funFact: editProfileForm.funFact,
        linkedin: editProfileForm.linkedin,
        instagram: editProfileForm.instagram,
        facebook: editProfileForm.facebook
      });
      setProfileUser((prev: any) => ({ ...prev, ...editProfileForm }));
      setEditProfileModalOpen(false);
      setSavingField(null);
    } catch (err: any) {
      const errors: any = {};
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((e: any) => {
          if (e.path && e.message) errors[e.path] = e.message;
        });
      } else if (err.message) {
        errors.general = err.message;
      }
      setProfileErrors(errors);
      setSavingField(null);
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user || !user.id) {
      alert('You must be logged in to upload a cover photo.');
      return;
    }
    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `cover_photos/${user.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('cover-photos')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('cover-photos')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ cover_photo_url: publicUrl })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      setProfileUser((prev: any) => ({ ...prev, coverPhotoURL: publicUrl }));
    } catch (err) {
      alert('Failed to upload cover photo.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleLogin = async () => {
    clearLoginError(); // Clear any previous errors
    await login();
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In to Explore More Options</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view your profile, saved properties, and access all features
            </p>
            <div className="relative">
              <button 
                onClick={handleLogin}
                className="flex items-center justify-center w-full btn btn-primary"
              >
                Sign in with Google
              </button>
              {loginError && (
                <div className="mt-2">
                  <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 w-full" aria-live="polite">
                    {loginError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-lg text-gray-600">Loading profile...</div>
        <div className="text-sm text-gray-400">This should only take a moment</div>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  // Prefer fields from Firestore profile if available, fallback to auth user
  const displayName = profileUser.userName || profileUser.name || 'User';
  const displayEmail = profileUser.userEmail || profileUser.email || '';
  const displayPhone = profileUser.userPhoneNumber || '';
  const displayAge = profileUser.age;
  const displayGender = profileUser.gender;
  const displayProfession = profileUser.profession;
  const displayPreferences = profileUser.preferences;
  const isPremium = profileUser.isPremium;
  const photoURL = profileUser.photoURL;
  const displayCity = profileUser.address?.city || profileUser.city || '';
  const displayBio = profileUser.bio || profileUser.about || '';
  const displayLookingFor = profileUser.lookingFor || profileUser.openTo || '';
  const funFacts = [
    "I love midnight snacks!",
    "I can cook 5 types of pasta.",
    "I play the ukulele.",
    "I have a pet turtle.",
    "I run marathons.",
    "I speak 3 languages.",
    "I love board games.",
    "I’m a movie buff.",
    "I’m a morning person.",
    "I’m a night owl."
  ];
  const randomFunFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  // Profile completion calculation
  const completionFields = [
    photoURL,
    displayBio,
    displayPreferences && displayPreferences.length > 0,
    profileUser.funFact,
    displayLookingFor,
    displayProfession,
    displayCity,
    displayAge,
    displayGender
  ];
  const completedCount = completionFields.filter(Boolean).length;
  const completionPercent = Math.round((completedCount / completionFields.length) * 100);
  let completionMsg = 'Complete your profile to get more matches!';
  if (completionPercent === 100) completionMsg = 'Your profile is complete! 🎉';
  else if (completionPercent > 70) completionMsg = 'Almost there! Just a few more details.';
  else if (completionPercent > 40) completionMsg = 'Keep going! More info means better matches.';

  // Save handlers
  const saveBio = async () => {
    setSavingField('bio');
    try {
      await supabase
        .from('users')
        .update({ bio: bioInput })
        .eq('user_id', profileUser.id);
      setProfileUser((prev: any) => ({ ...prev, bio: bioInput }));
      setEditingBio(false);
    } finally {
      setSavingField(null);
    }
  };
  const saveLookingFor = async () => {
    setSavingField('lookingFor');
    try {
      await supabase
        .from('users')
        .update({ looking_for: lookingForInput })
        .eq('user_id', profileUser.id);
      setProfileUser((prev: any) => ({ ...prev, lookingFor: lookingForInput }));
      setEditingLookingFor(false);
    } finally {
      setSavingField(null);
    }
  };
  const saveFunFact = async () => {
    setSavingField('funFact');
    try {
      await supabase
        .from('users')
        .update({ fun_fact: funFactInput })
        .eq('user_id', profileUser.id);
      setProfileUser((prev: any) => ({ ...prev, funFact: funFactInput }));
      setEditingFunFact(false);
    } finally {
      setSavingField(null);
    }
  };
  const savePreferences = async () => {
    setSavingField('preferences');
    try {
      console.log('Saving preferences:', preferencesInput);
      console.log('User ID:', profileUser.id);
      await supabase
        .from('users')
        .update({ preferences: preferencesInput })
        .eq('user_id', profileUser.id);
      setProfileUser((prev: any) => ({ ...prev, preferences: preferencesInput }));
      setEditingPreferences(false);
      console.log('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSavingField(null);
    }
  };

  return (
    <div className="py-8">
      <div className="container">
        <div className="flex justify-end mb-4">
          {/* <button className="btn btn-outline flex items-center gap-2" onClick={() => setEditProfileModalOpen(true)}>
            <Edit className="w-4 h-4" /> Edit Profile
          </button> */}
        </div>
        {/* Profile Completion Progress Bar */}
        {/* <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-primary-700">Profile Completion</span>
            <span className="text-primary-700 font-bold">{completionPercent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">{completionMsg}</div>
        </div> */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image - now supports upload and display */}
          <div className="relative h-32 bg-gradient-to-r from-primary-600 to-primary-800">
            {/* Show a default cover photo based on user preferences, or fallback */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                zIndex: 1,
                backgroundImage: `linear-gradient(90deg, #be185d 0%, #881337 100%), url('data:image/svg+xml;utf8,<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g opacity=\"0.13\"><circle cx=\"16\" cy=\"16\" r=\"2\" fill=\"white\"/><path d=\"M16 4 V10 M16 22 V28 M4 16 H10 M22 16 H28 M8 8 L12 12 M20 20 L24 24 M8 24 L12 20 M20 12 L24 8\" stroke=\"white\" stroke-width=\"1.2\"/></g></svg>')`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto',
                backgroundBlendMode: 'overlay',
              }}
            />
          </div>
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start -mt-16 mb-4 md:mb-0" style={{zIndex:2, position:'relative'}}>
                <div className="relative group w-32 h-32 flex items-center justify-center">
                  <img
                    src={photoURL ? photoURL : '/images/default-avatar.png'}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=E0E0E0&color=7c2d6e&size=128`;
                    }}
                    alt={displayName}
                    className="w-32 h-32 rounded-full object-cover shadow-md"
                  />
                </div>
                  {isPremium && (
                    <div className="absolute -right-2 -bottom-2 bg-accent-500 text-white p-1 rounded-full z-10">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
              </div>
              {/* User Info */}
              <div className="md:ml-6 text-center md:text-left flex-grow">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-bold">
                      {displayName}
                    </h1>
                  </div>
                  {/* Logout Button - Top Right */}
                  <div className="flex items-center gap-2 flex-shrink-0 md:mt-4">
                    <button
                      onClick={logout}
                      className="btn flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                      <span className="sm:hidden">Logout</span>
                    </button>
                  </div>
                </div>
                {/* Compact Info Grid */}
                <div className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayEmail && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600" />
                        <span className="truncate">{displayEmail}</span>
                      </div>
                    )}
                    {displayPhone && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600" />
                        <span>{displayPhone}</span>
                      </div>
                    )}
                    {displayCity && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600" />
                        <span>{displayCity}</span>
                      </div>
                    )}
                    {displayProfession && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Briefcase className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600" />
                        <span>{displayProfession}</span>
                      </div>
                    )}
                    {displayAge && displayGender && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600" />
                        <span>{displayAge} • {displayGender}</span>
                      </div>
                    )}
                    {isPremium && (
                      <div className="flex items-center text-primary-600 font-semibold text-sm">
                        <Star className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>VIP Tenant</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Upgrade to VIP Tenant - Full Width */}
                {!isPremium && (
                  <div className="mt-6">
                    <div className="bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 rounded-lg p-4 md:p-6 shadow-lg">
                      <div className="text-center mb-4">
                        <p className="text-base md:text-lg mb-2">Current Plan: <span className="bg-gray-200 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">Free</span></p>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center justify-center gap-2">
                          <Award className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                          Upgrade to VIP Tenant
                        </h3>
                        
                        {/* VIP Features */}
                        <div className="mb-6 space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <Users className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                              <span className="font-semibold text-sm md:text-base">25 Contacts</span>
                              <p className="text-xs text-gray-600">Contact up to 25 property owners</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <Headphones className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                              <span className="font-semibold text-sm md:text-base">Priority Support</span>
                              <p className="text-xs text-gray-600">Faster response times</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <UserCheck className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                              <span className="font-semibold text-sm md:text-base">Dedicated Relationship Manager</span>
                              <p className="text-xs text-gray-600">Personal assistance assigned</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2 mb-6">
                          <div className="flex items-center gap-3">
                            <span className="line-through text-gray-400 text-lg md:text-xl">₹9,999</span>
                            <span className="text-3xl md:text-4xl font-bold text-primary-700">₹499</span>
                          </div>
                          <p className="text-xs text-gray-500">Limited time offer</p>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate('/payment');
                          }}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 md:px-6 py-3 text-base md:text-lg font-semibold rounded-lg transition-colors mb-4 shadow-md hover:shadow-lg" 
                        >
                          Upgrade to VIP Tenant
                        </button>
                        <div className="text-xs md:text-sm text-gray-600 mb-3">
                          Get exclusive benefits and premium features with VIP Tenant membership.
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
                          <Shield className="w-4 h-4" />
                          <span>Secure Payment via Razorpay</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* VIP Status Display */}
                {isPremium && (
                  <div className="mt-6">
                    <div className="bg-gradient-to-br from-primary-100 to-primary-50 border-2 border-primary-300 rounded-lg p-4 md:p-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Award className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                        <h3 className="text-lg md:text-xl font-bold text-primary-700">VIP Tenant Active</h3>
                      </div>
                      <div className="text-center text-sm md:text-base text-gray-700">
                        You're enjoying all VIP Tenant benefits!
                      </div>
                    </div>
                  </div>
                )}
                {/* About Me section */}
                <div className="mt-6">
                  <h3 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4 md:w-5 md:h-5" /> About Me</h3>
                  {editingBio ? (
                    <div>
                      <textarea
                        value={bioInput}
                        onChange={e => setBioInput(e.target.value)}
                        className="input w-full mb-2"
                        rows={3}
                        autoFocus
                      />
                      <button className="btn btn-primary btn-sm mr-2" onClick={saveBio} disabled={savingField==='bio'}>Save</button>
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditingBio(false); setBioInput(displayBio); }}>Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-primary-50 rounded p-3 cursor-pointer" onClick={() => setEditingBio(true)}>
                      <span className="text-sm md:text-base">{displayBio || <span className="italic text-gray-400">Add a short bio to let others know more about you!</span>}</span>
                      <Edit className="w-4 h-4 text-primary-600 ml-2 flex-shrink-0" />
                    </div>
                  )}
                </div>
                {/* Your Choices (Preferences) section */}
                <div className="mt-6">
                  <h3 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2"><MessageCircle className="w-4 h-4 md:w-5 md:h-5" /> Your Choices</h3>
                  {editingPreferences ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {USER_PREFERENCES.map((pref) => {
                        // Use a fallback icon if the specified icon doesn't exist
                        const Icon = (LucideIcons as any)[pref.icon] || LucideIcons.User;
                        const selected = preferencesInput.includes(pref.label);
                        return (
                          <button
                            key={pref.id}
                            type="button"
                            onClick={() => {
                              setPreferencesInput(selected
                                ? preferencesInput.filter((p: string) => p !== pref.label)
                                : [...preferencesInput, pref.label]);
                            }}
                            className={`flex flex-col items-center justify-center px-3 py-2 rounded-full border transition min-w-[70px] text-xs font-medium focus:outline-none ${selected
                              ? 'bg-primary-600 text-white border-primary-600 shadow'
                              : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
                            tabIndex={0}
                          >
                            <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-white' : 'text-primary-600'}`} />
                            <span className="whitespace-nowrap">{pref.label}</span>
                          </button>
                        );
                      })}
                      <div className="w-full flex gap-2 mt-2">
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={savePreferences} 
                          disabled={savingField === 'preferences'}
                        >
                          {savingField === 'preferences' ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => { 
                            setEditingPreferences(false); 
                            setPreferencesInput(displayPreferences || []); 
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {displayPreferences && displayPreferences.length > 0 ? (
                          displayPreferences.map((pref: string) => (
                            <span key={pref} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold border border-primary-100">
                              {pref}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No preferences set yet.</span>
                        )}
                      </div>
                      <button className="ml-2" onClick={() => {
                        setEditingPreferences(true);
                        setPreferencesInput(displayPreferences || []);
                      }}><Edit className="w-4 h-4 text-primary-600" /></button>
                    </div>
                  )}
                </div>

                {/* User stats */}
                <div className="mt-6 flex flex-wrap gap-6 items-center">
                  {/* <div className="flex items-center gap-2 text-primary-700 font-semibold">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">{userListings.length} Listings Posted</span>
                  </div> */}
                </div>

              </div>
            </div>
          </div>
        </div>





        {/* Manage Listings Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Manage Listings</h2>
          {listingsLoading ? (
            <div className="text-gray-600">Loading your listings...</div>
          ) : listingsError ? (
            <div className="text-red-500">{listingsError}</div>
          ) : userListings.length === 0 ? (
            <div className="text-gray-500">You have not posted any listings yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map(listing => (
                <PropertyCard 
                  key={listing.id}
                  property={listing} 
                  listingType={listing.listingType === 'sell' ? 'buy' : 'rent'}
                  showManageActions={true}
                  onDelete={(id) => {
                    setUserListings(prev => prev.filter(l => l.id !== id));
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={editProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto p-8 z-10">
              <Dialog.Title className="text-2xl font-bold mb-4">Edit Profile</Dialog.Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input className="input w-full" value={editProfileForm.name} onChange={e => handleEditProfileChange('name', e.target.value)} />
                  {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input className="input w-full" value={editProfileForm.phone} onChange={e => handleEditProfileChange('phone', e.target.value)} />
                  {profileErrors.phone && <p className="text-red-500 text-xs mt-1">{profileErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input className="input w-full" value={editProfileForm.age} onChange={e => handleEditProfileChange('age', e.target.value)} />
                  {profileErrors.age && <p className="text-red-500 text-xs mt-1">{profileErrors.age}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <input className="input w-full" value={editProfileForm.gender} onChange={e => handleEditProfileChange('gender', e.target.value)} />
                  {profileErrors.gender && <p className="text-red-500 text-xs mt-1">{profileErrors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Profession</label>
                  <input className="input w-full" value={editProfileForm.profession} onChange={e => handleEditProfileChange('profession', e.target.value)} />
                  {profileErrors.profession && <p className="text-red-500 text-xs mt-1">{profileErrors.profession}</p>}
                </div>
              <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input className="input w-full" value={editProfileForm.city} onChange={e => handleEditProfileChange('city', e.target.value)} />
                  {profileErrors.city && <p className="text-red-500 text-xs mt-1">{profileErrors.city}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">About Me</label>
                  <textarea className="input w-full" rows={2} value={editProfileForm.bio} onChange={e => handleEditProfileChange('bio', e.target.value)} />
                  {profileErrors.bio && <p className="text-red-500 text-xs mt-1">{profileErrors.bio}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Looking For</label>
                  <input className="input w-full" value={editProfileForm.lookingFor} onChange={e => handleEditProfileChange('lookingFor', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Preferences (comma separated)</label>
                  <input className="input w-full" value={editProfileForm.preferences.join(', ')} onChange={e => handleEditProfileChange('preferences', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Fun Fact</label>
                  <input className="input w-full" value={editProfileForm.funFact} onChange={e => handleEditProfileChange('funFact', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn</label>
                  <input className="input w-full" value={editProfileForm.linkedin} onChange={e => handleEditProfileChange('linkedin', e.target.value)} />
                  {profileErrors.linkedin && <p className="text-red-500 text-xs mt-1">{profileErrors.linkedin}</p>}
          </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  <input className="input w-full" value={editProfileForm.instagram} onChange={e => handleEditProfileChange('instagram', e.target.value)} />
                  {profileErrors.instagram && <p className="text-red-500 text-xs mt-1">{profileErrors.instagram}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook</label>
                  <input className="input w-full" value={editProfileForm.facebook} onChange={e => handleEditProfileChange('facebook', e.target.value)} />
                  {profileErrors.facebook && <p className="text-red-500 text-xs mt-1">{profileErrors.facebook}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button className="btn btn-outline" onClick={() => setEditProfileModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEditProfileSave} disabled={savingField==='editProfileModal'}>Save Changes</button>
              </div>
            </div>
          </div>
        </Dialog>

      </div>
    </div>
  );
};

export default ProfilePage;