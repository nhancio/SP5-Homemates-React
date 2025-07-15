import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Award, Settings, LogOut, X, CreditCard, Pencil, Trash, MoreVertical, Eye, Edit } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropertyCard from '../components/ui/PropertyCard';
import { getListingsByUser, initiatePhonePePayment, updateListing, deleteListing } from '../services/listings';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'My Profile | Homemates';
  }, []);

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
      setEditProfileData({
        name: profileUser.userName || profileUser.name || '',
        email: profileUser.userEmail || profileUser.email || '',
        phone: profileUser.userPhoneNumber || '',
        gender: profileUser.gender || '',
        age: profileUser.age || '',
        profession: profileUser.profession || '',
      });
    }
  }, [profileUser]);

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

  return (
    <div className="py-8">
      <div className="container">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image - Reduced height from h-48 to h-32 */}
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>
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
                    <button
                      className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-primary-50 text-primary-600"
                      onClick={() => setEditProfileOpen(true)}
                      title="Edit Profile"
                      aria-label="Edit Profile"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </h1>
                </div>
                <div className="mt-4 space-y-2">
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
                  {displayAge && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      Age: {displayAge}
                    </p>
                  )}
                  {displayGender && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      Gender: {displayGender}
                    </p>
                  )}
                  {displayProfession && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      Profession: {displayProfession}
                    </p>
                  )}
                  {displayPreferences && displayPreferences.length > 0 && (
                    <p className="flex items-center justify-center md:justify-start text-gray-600">
                      Preferences: {displayPreferences.join(', ')}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  
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
                          <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-sm gap-2" onClick={() => { setShowOptionsFor(null); navigate(`/listing/${listing.listingType}/${listing.id}`); }}>
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
        {/* Membership Status */}
        {!isPremium && (
          <div className="mt-8 bg-gradient-to-r from-accent-500 to-amber-500 text-white rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
                <p className="mb-4 md:mb-0">
                  Get exclusive access to premium listings, priority support, and more!
                </p>
              </div>
              <button
                onClick={handleUpgradeClick}
                className="bg-white text-accent-600 hover:bg-gray-100 px-6 py-2 rounded-md font-medium transition"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
        {showUpgradePopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 relative">
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-semibold mb-4">Upgrade to Premium</h3>
              <p className="text-gray-600 mb-6">
                Get exclusive access to premium listings, priority support, and more features!
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Premium Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Unlimited contacts</li>
                    <li>• Priority support</li>
                    <li>• Exclusive features</li>
                    <li>• And much more...</li>
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary-600 mb-4">
                    <span className="line-through text-gray-400 mr-2">₹499</span>
                    <span className="text-primary-600 font-bold text-2xl">₹99</span>
                    <span className="text-base text-gray-500 ml-1">/ month</span>
                  </p>
                  <button
                    onClick={handlePhonePePayment}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 text-lg hover:scale-105 transition-transform border-2 border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 w-full justify-center"
                  >
                    <CreditCard className="w-6 h-6" />
                    Pay with PhonePe
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {editProfileOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative">
              <button
                onClick={() => setEditProfileOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) return;
                  try {
                    const userDocRef = doc(db, 'u', user.id);
                    await updateDoc(userDocRef, {
                      userName: editProfileData.name,
                      userEmail: editProfileData.email,
                      userPhoneNumber: editProfileData.phone,
                      gender: editProfileData.gender,
                      age: editProfileData.age,
                      profession: editProfileData.profession,
                    });
                    setProfileUser((prev: any) => ({
                      ...prev,
                      userName: editProfileData.name,
                      userEmail: editProfileData.email,
                      userPhoneNumber: editProfileData.phone,
                      gender: editProfileData.gender,
                      age: editProfileData.age,
                      profession: editProfileData.profession,
                    }));
                    setEditProfileOpen(false);
                    alert('Profile updated successfully!');
                  } catch (err) {
                    alert('Failed to update profile.');
                    console.error(err);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={editProfileData.name}
                    onChange={e => setEditProfileData(d => ({ ...d, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="input w-full"
                    value={editProfileData.email}
                    onChange={e => setEditProfileData(d => ({ ...d, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="input w-full"
                    value={editProfileData.phone}
                    onChange={e => setEditProfileData(d => ({ ...d, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={editProfileData.gender}
                    onChange={e => setEditProfileData(d => ({ ...d, gender: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={editProfileData.age}
                    onChange={e => setEditProfileData(d => ({ ...d, age: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Profession</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={editProfileData.profession}
                    onChange={e => setEditProfileData(d => ({ ...d, profession: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditProfileOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;