import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Award, Settings, LogOut, X, CreditCard, Pencil } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropertyCard from '../components/ui/PropertyCard';
import { getListingsByUser, initiatePhonePePayment } from '../services/listings';

const ProfilePage = () => {

  const { user, isAuthenticated, login, logout } = useAppContext();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [uploading, setUploading] = useState(false);

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
                  <h1 className="text-2xl font-bold">{displayName}</h1>
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
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Hey! Here's my availability on Homemates.`);
                      alert('Availability link copied to clipboard!');
                    }}
                    className="btn btn-secondary text-sm px-4 py-2"
                  >
                    Share Availability
                  </button>
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
                <div key={listing.id} className="relative group">
                  <PropertyCard property={listing} listingType={listing.listingType === 'sell' ? 'buy' : 'rent'} />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn btn-xs btn-secondary" onClick={() => alert('Edit functionality coming soon!')}>Edit</button>
                    <button className="btn btn-xs btn-danger" onClick={() => alert('Delete functionality coming soon!')}>Delete</button>
                  </div>
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
                    <li>• Priority listing visibility</li>
                    <li>• Advanced search filters</li>
                    <li>• Direct contact with owners</li>
                    <li>• Premium support</li>
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary-600 mb-4">
                    ₹999 / month
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
      </div>
    </div>
  );
};

export default ProfilePage;