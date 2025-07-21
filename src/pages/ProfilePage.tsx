import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Award, Settings, LogOut, X, CreditCard, Pencil, Trash, MoreVertical, Eye, Edit, Star, Info, UserCheck, Users, MessageCircle, Briefcase } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useAppContext } from '../context/AppContext';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

  const { user, isAuthenticated, login, logout } = useAppContext();
  const navigate = useNavigate();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
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
  // Add showContactInfo to profile state and edit form
  const [showContactInfo, setShowContactInfo] = useState(true);
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
      setUserCredits(creditInfo.credits);
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
        // Fetch from "u" collection by user.id
        const userDoc = await getDoc(doc(db, 'u', user.id));
        if (userDoc.exists()) {
          setProfileUser({ id: user.id, ...userDoc.data() });
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
    // Fetch user listings
    const fetchUserListings = async () => {
      if (!user) {
        setUserListings([]);
        return;
      }
      setListingsLoading(true);
      setListingsError(null);
      try {
        const listings = await getListingsByUser(user.id);
        setUserListings(listings);
      } catch (err) {
        setListingsError('Failed to load your listings.');
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
    setShowContactInfo(profileUser?.showContactInfo !== false); // default to true if undefined
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
      const favoriteIds = await getUserFavorites(user.id);
      if (favoriteIds.length) {
        const recentIds = favoriteIds.slice(-5).reverse(); // last 5, most recent first
        const properties = await getListingsByIds(recentIds);
        setRecentProperties(properties);
      } else {
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
        const allUsers = await getUsers();
        const mutuals = allUsers
          .filter(u => u.id !== user.id && u.preferences && u.preferences.length)
          .map(u => {
            const shared = u.preferences.filter((p: string) => profileUser.preferences.includes(p));
            return shared.length > 0 ? { ...u, shared } : null;
          })
          .filter(Boolean);
        setMutualUsers(mutuals);
      } catch (err) {
        setMutualUsers([]);
      }
    };
    fetchMutualInterests();
  }, [user, profileUser]);

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUpgradePopup(true);
  };

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
      setShowUpgradePopup(false);
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
      await updateDoc(doc(db, 'u', profileUser.id), {
        photoURL: editProfileForm.photoURL,
        userName: editProfileForm.name,
        userEmail: editProfileForm.email,
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
      const storageRef = ref(storage, `cover_photos/${user.id}.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'u', user.id), { coverPhotoURL: downloadURL });
      setProfileUser((prev: any) => ({ ...prev, coverPhotoURL: downloadURL }));
    } catch (err) {
      alert('Failed to upload cover photo.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleContactToggle = async () => {
    const newValue = !showContactInfo;
    setShowContactInfo(newValue);
    if (user && user.id) {
      await updateDoc(doc(db, 'u', user.id), { showContactInfo: newValue });
      setProfileUser((prev: any) => ({ ...prev, showContactInfo: newValue }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view your profile and saved properties
            </p>
            <button 
              onClick={() => login()}
              className="flex items-center justify-center w-full btn btn-primary"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="text-lg text-gray-600">Loading profile...</div>
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
      await updateDoc(doc(db, 'u', profileUser.id), { bio: bioInput });
      setProfileUser((prev: any) => ({ ...prev, bio: bioInput }));
      setEditingBio(false);
    } finally {
      setSavingField(null);
    }
  };
  const saveLookingFor = async () => {
    setSavingField('lookingFor');
    try {
      await updateDoc(doc(db, 'u', profileUser.id), { lookingFor: lookingForInput });
      setProfileUser((prev: any) => ({ ...prev, lookingFor: lookingForInput }));
      setEditingLookingFor(false);
    } finally {
      setSavingField(null);
    }
  };
  const saveFunFact = async () => {
    setSavingField('funFact');
    try {
      await updateDoc(doc(db, 'u', profileUser.id), { funFact: funFactInput });
      setProfileUser((prev: any) => ({ ...prev, funFact: funFactInput }));
      setEditingFunFact(false);
    } finally {
      setSavingField(null);
    }
  };
  const savePreferences = async () => {
    setSavingField('preferences');
    try {
      await updateDoc(doc(db, 'u', profileUser.id), { preferences: preferencesInput });
      setProfileUser((prev: any) => ({ ...prev, preferences: preferencesInput }));
      setEditingPreferences(false);
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
        <div className="mb-6">
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
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image - now supports upload and display */}
          <div className="relative h-32 bg-gradient-to-r from-primary-600 to-primary-800">
            {profileUser.coverPhotoURL && (
              <img
                src={profileUser.coverPhotoURL}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
              />
            )}
            <button
              type="button"
              className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-2 shadow hover:bg-primary-700 transition-opacity opacity-90 focus:outline-none"
              style={{ zIndex: 2 }}
              title="Change cover photo"
              aria-label="Edit cover photo"
              onClick={() => document.getElementById('cover-photo-input')?.click()}
            >
              <Pencil className="w-5 h-5" />
            </button>
            <input
              id="cover-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoUpload}
            />
            {uploading && (
              <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-40">
                <span className="text-primary-600 font-semibold">Uploading...</span>
              </div>
            )}
          </div>
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start -mt-16 mb-4 md:mb-0">
                <div className="relative group w-32 h-32">
                      <img 
                    src={photoURL ? photoURL : '/images/default-avatar.png'}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=E0E0E0&color=7c2d6e&size=128`;
                    }}
                        alt={displayName} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                  />
                  {/* Pencil icon overlay */}
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-primary-600 text-white rounded-full p-2 shadow hover:bg-primary-700 transition-opacity opacity-90 group-hover:opacity-100 focus:outline-none"
                    style={{ fontSize: 16, zIndex: 20 }}
                    onClick={() => setShowFileInput(true)}
                    title="Change profile picture"
                    aria-label="Edit profile photo"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {/* File input (hidden) */}
                  {showFileInput && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute bottom-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ zIndex: 30 }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!user || !user.id) {
                          alert('You must be logged in to upload a profile photo.');
                          return;
                        }
                        setUploading(true);
                        try {
                          // Upload to Firebase Storage
                          const storageRef = ref(storage, `profile_photos/${user.id}.jpg`);
                          await uploadBytes(storageRef, file);
                          const downloadURL = await getDownloadURL(storageRef);
                          // Update Firestore user profile
                          const userDocRef = doc(db, 'u', user.id);
                          await updateDoc(userDocRef, { photoURL: downloadURL });
                          // Update local state
                          setProfileUser((prev: any) => ({ ...prev, photoURL: downloadURL }));
                          setShowFileInput(false);
                        } catch (err) {
                          alert('Failed to upload profile photo.');
                          console.error(err);
                        } finally {
                          setUploading(false);
                        }
                      }}
                      onBlur={() => setShowFileInput(false)}
                      autoFocus
                    />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center rounded-full z-40">
                      <span className="text-primary-600 font-semibold">Uploading...</span>
                      </div>
                    )}
                  {isPremium && (
                    <div className="absolute -right-2 -bottom-2 bg-accent-500 text-white p-1 rounded-full z-10">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
              {/* User Info */}
              <div className="md:ml-6 text-center md:text-left flex-grow">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {displayName}
                    {/* <button
                      className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-primary-50 text-primary-600"
                      onClick={() => setEditProfileOpen(true)}
                      title="Edit Profile"
                      aria-label="Edit Profile"
                    >
                      <Edit className="w-5 h-5" />
                    </button> */}
                  </h1>
                </div>
                <div className="mt-4 space-y-2">
                  {/* Contact Info Toggle */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Show Contact Info</span>
                    <button
                      className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 transition-colors duration-300 ${showContactInfo ? 'bg-primary-500' : 'bg-gray-300'}`}
                      onClick={handleContactToggle}
                      title="Toggle contact info visibility"
                      aria-label="Toggle contact info visibility"
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${showContactInfo ? 'translate-x-4' : ''}`}
                      />
                    </button>
                  </div>
                  {/* Contact Info (conditionally rendered) */}
                  {showContactInfo && (
                    <>
                      <p className="flex items-center justify-center md:justify-start text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {displayEmail}
                      </p>
                      {displayPhone && (
                        <p className="flex items-center justify-center md:justify-start text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {displayPhone}
                        </p>
                      )}
                    </>
                  )}
                  {displayCity && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {displayCity}
                    </p>
                  )}
                  {displayAge && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      Age: {displayAge}
                    </p>
                  )}
                  {displayGender && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Gender: {displayGender}
                    </p>
                  )}
                  {displayProfession && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Profession: {displayProfession}
                    </p>
                  )}
                  {/* Premium/Verified badge */}
                  {isPremium && (
                    <p className="flex items-center justify-center md:justify-start text-primary-600 font-semibold">
                      <Star className="w-4 h-4 mr-2" /> Premium Member
                    </p>
                  )}
                </div>
                {/* Subscription UI - moved here for first scroll visibility */}
                <div className="mt-6 subscription-section">
                  <p className="plan-status text-lg mb-2">Plan: <span className="free-tag bg-gray-200 text-primary-700 px-2 py-1 rounded">Free</span></p>
                  <div className="premium-box bg-primary-50 border border-primary-200 rounded-lg p-6 mt-2">
                    <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
                    <ul className="benefits-list list-disc pl-6 mb-4 text-primary-700">
                      <li className="flex items-center gap-2 mb-1"><span className="text-green-600">✔</span> View verified contacts</li>
                      <li className="flex items-center gap-2 mb-1"><span className="text-green-600">✔</span> Appear higher in search</li>
                      <li className="flex items-center gap-2 mb-1"><span className="text-green-600">✔</span> Unlimited swipes</li>
                    </ul>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-bold text-primary-700">₹99/month</span>
                      <span className="text-gray-500">or</span>
                      <span className="text-lg font-semibold text-primary-600">₹499/year</span>
                    </div>
                    <button className="upgrade-btn btn btn-primary px-6 py-2 text-lg font-semibold">Upgrade Now</button>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1"><span role="img" aria-label="secure">🔒</span> Secure Payment</div>
                  </div>
                </div>

                {/* Credits Section */}
                <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                    Your Credits
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-primary-600">{userCredits}</div>
                      <div className="text-sm text-gray-600">Credits remaining</div>
                      <p className="text-xs text-gray-500 mt-1">
                        Use credits to contact property owners via call or WhatsApp
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/payment'}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                      Buy More Credits
                    </button>
                  </div>
                </div>
                {/* About Me and Looking For sections */}
                <div className="mt-6 flex flex-col md:flex-row gap-6">
                  {/* About Me */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Info className="w-5 h-5" /> About Me</h3>
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
                        <span>{displayBio || <span className="italic text-gray-400">Add a short bio to let others know more about you!</span>}</span>
                        <Edit className="w-4 h-4 text-primary-600 ml-2" />
                      </div>
                    )}
                  </div>
                  {/* Looking For */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Users className="w-5 h-5" /> Looking For</h3>
                    {editingLookingFor ? (
                      <div>
                        <select
                          className="input w-full mb-2"
                          value={lookingForInput}
                          onChange={e => setLookingForInput(e.target.value)}
                          autoFocus
                        >
                          <option value="">Select</option>
                          <option value="Room">Room</option>
                          <option value="Flat">Flat</option>
                          <option value="Homemate">Homemate</option>
                        </select>
                        <button className="btn btn-primary btn-sm mr-2" onClick={saveLookingFor} disabled={savingField==='lookingFor'}>Save</button>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditingLookingFor(false); setLookingForInput(displayLookingFor); }}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-primary-50 rounded p-3 cursor-pointer" onClick={() => setEditingLookingFor(true)}>
                        <span>{displayLookingFor || <span className="italic text-gray-400">Let others know what you’re looking for (e.g., Room, Flat, Homemate).</span>}</span>
                        <Edit className="w-4 h-4 text-primary-600 ml-2" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Your Choices (Preferences) section */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Your Choices</h3>
                  {editingPreferences ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {USER_PREFERENCES.map((pref) => {
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
                        <button className="btn btn-primary btn-sm" onClick={savePreferences} disabled={savingField==='preferences'}>Save</button>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditingPreferences(false); setPreferencesInput(displayPreferences || []); }}>Cancel</button>
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
                      <button className="ml-2" onClick={() => setEditingPreferences(true)}><Edit className="w-4 h-4 text-primary-600" /></button>
                    </div>
                  )}
                </div>
                {/* Social Links section */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span>Social Links</span>
                    {/* <button
                      className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-primary-50 text-primary-600"
                      onClick={() => setEditProfileOpen(true)}
                      title="Edit Social Links"
                      aria-label="Edit Social Links"
                    >
                      <Edit className="w-5 h-5" />
                    </button> */}
                  </h3>
                  <div className="flex flex-wrap gap-4 items-center">
                    {profileUser.instagram && (
                      <a href={`https://instagram.com/${profileUser.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-600 hover:underline">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 2.75a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5zm0 1.5a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5zm5.25.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                        Instagram
                      </a>
                    )}
                    {profileUser.linkedin && (
                      <a href={profileUser.linkedin.startsWith('http') ? profileUser.linkedin : `https://linkedin.com/in/${profileUser.linkedin.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 hover:underline">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.845-1.563 3.043 0 3.604 2.004 3.604 4.609v5.587z"/></svg>
                        LinkedIn
                      </a>
                    )}
                    {profileUser.facebook && (
                      <a href={profileUser.facebook.startsWith('http') ? profileUser.facebook : `https://facebook.com/${profileUser.facebook.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.733 0 1.325-.593 1.325-1.326v-21.349c0-.733-.592-1.326-1.325-1.326z"/></svg>
                        Facebook
                      </a>
                    )}
                    {profileUser.twitter && (
                      <a href={profileUser.twitter.startsWith('http') ? profileUser.twitter : `https://twitter.com/${profileUser.twitter.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-500 hover:underline">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482c-4.086-.205-7.713-2.164-10.141-5.144a4.822 4.822 0 0 0-.664 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.868 9.868 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.457-2.548z"/></svg>
                        Twitter
                      </a>
                    )}
                    {profileUser.website && (
                      <a href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-700 hover:underline">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14a6 6 0 1 0 0 12A6 6 0 0 0 12 6z"/></svg>
                        Website
                      </a>
                    )}
                    {!(profileUser.instagram || profileUser.linkedin || profileUser.facebook || profileUser.twitter || profileUser.website) && (
                      <span className="italic text-gray-400">No social links added yet.</span>
                    )}
                  </div>
                </div>
                {/* Share Your Profile section with WhatsApp only */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span>Share Your Profile</span>
                  </h3>
                  <div className="flex items-center gap-4">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent('Check out my Homemates profile: ' + window.location.origin + '/profile/' + profileUser.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success flex items-center gap-2 whatsapp-share-btn"
                      style={{ backgroundColor: '#25D366', color: 'white' }}
                    >
                      <WhatsAppIcon /> Share on WhatsApp
                    </a>
                  </div>
                </div>
                {/* User stats */}
                <div className="mt-6 flex flex-wrap gap-6 items-center">
                  <div className="flex items-center gap-2 text-primary-700 font-semibold">
                    <CreditCard className="w-5 h-5" />
                    {userListings.length} Listings Posted
                  </div>
                </div>
                <div className="flex justify-center md:justify-start mt-4">
                  <button 
                    onClick={logout}
                    className="btn btn-primary px-12 text-lg font-medium"
                  >
                    Logout
                  </button>
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
                <div key={listing.id} className="relative">
                  {/* More options dropdown */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative">
                      <button
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 transition"
                        onClick={() => setShowOptionsFor(showOptionsFor === listing.id ? null : listing.id)}
                        title="More Options"
                        aria-label="More Options"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      {showOptionsFor === listing.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-20 animate-fade-in">
                          <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-sm gap-2" onClick={() => { setShowOptionsFor(null); handleEditListing(listing); }}>
                            <Pencil className="w-4 h-4 text-primary-600" /> Edit
                          </button>
                          <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-sm gap-2" onClick={() => { setShowOptionsFor(null); handleDeleteListing(listing); }} disabled={deletingListing === listing.id}>
                            <Trash className="w-4 h-4 text-red-500" /> Delete
                          </button>
                          <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-sm gap-2" onClick={() => { setShowOptionsFor(null); navigate(listing.listingType === 'rent' ? `/rent/${listing.id}` : `/buy/${listing.id}`); }}>
                            <Eye className="w-4 h-4 text-gray-600" /> View
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <PropertyCard property={listing} listingType={listing.listingType === 'sell' ? 'buy' : 'rent'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Policy Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
          <a href="/privacy_policy" className="btn btn-secondary text-sm px-4 py-2">Privacy Policy</a>
          <a href="/refund_policy" className="btn btn-secondary text-sm px-4 py-2">Refund Policy</a>
          <a href="/TandC" className="btn btn-secondary text-sm px-4 py-2">T&amp;C</a>
        </div>
        {/* Edit Profile Modal */}
        <Dialog open={editProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
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