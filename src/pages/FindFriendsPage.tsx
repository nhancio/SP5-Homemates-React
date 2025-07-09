import React, { useEffect, useState } from 'react';
import { User, Briefcase, Loader, Phone, MessageCircle } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  userEmail: string;
  userName: string;
  userPhoneNumber: string;
  age: number;
  gender: string;
  profession: string;
  preferences: string[];
  photoURL?: string;
}

const CATEGORY_OPTIONS = [
  { label: 'IT', value: 'IT' },
  { label: 'Travel', value: 'Travel' },
];

const LOOKING_FOR_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Student', value: 'Student' },
  { label: 'Working Professional', value: 'Working Professional' },
  { label: 'Walking', value: 'Walking' },
  { label: 'Badminton', value: 'Badminton' },
  { label: 'Cricket', value: 'Cricket' },
  { label: 'Football', value: 'Football' },
  { label: 'Running', value: 'Running' },
  { label: 'Cycling', value: 'Cycling' },
  { label: 'Gym', value: 'Gym' },
  { label: 'Yoga', value: 'Yoga' },
  { label: 'Music', value: 'Music' },
  { label: 'Movies', value: 'Movies' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Cooking', value: 'Cooking' },
  { label: 'Gaming', value: 'Gaming' },
  { label: 'Pet Friendly', value: 'Pet Friendly' },
];

const FindFriendsPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState('');
  const [customFilters, setCustomFilters] = useState<string[]>([]);
  const { user: currentUser, isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('Phone number not available');
    }
  };

  const handleWhatsApp = (phoneNumber: string) => {
    if (!phoneNumber) {
      alert('Phone number not available');
      return;
    }
    const whatsappNumber = '91' + phoneNumber.replace(/\D/g, '');
    const message = 'Hey, are you looking for a flat or flatmate?';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  useEffect(() => {
    const loadUsers = async () => {
      if (!isAuthenticated || !currentUser?.id) {
        navigate('/profile');
        return;
      }

      try {
        setIsLoading(true);
        // Get logged-in user's gender from "u" collection
        const userDoc = await getDoc(doc(db, 'u', currentUser.id));
        const myGender = userDoc.exists() ? (userDoc.data().gender || '') : '';
        // Fetch all users from "u" collection
        const querySnapshot = await getDocs(collection(db, 'u'));
        const data: UserProfile[] = querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userEmail: d.userEmail || d.email || '',
            userName: d.userName || d.name || '',
            userPhoneNumber: d.userPhoneNumber || d.mobile || d.phone || '',
            age: Number(d.age) || 0,
            gender: d.gender || '',
            profession: d.profession || d.occupation || '',
            preferences: Array.isArray(d.preferences) ? d.preferences : [],
            photoURL: d.photoURL || d.photo || d.avatar || '',
          };
        });
        // Filter by gender (same as logged-in user, exclude self)
        const filtered = data.filter(
          u =>
            u.id !== currentUser.id &&
            u.gender &&
            myGender &&
            u.gender.toLowerCase() === myGender.toLowerCase()
        );
        setUsers(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load users at this time');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [currentUser?.id, isAuthenticated, navigate]);

  // Filter users by selected categories (profession), selectedLookingFor, and customFilters
  const allLookingFor = [...selectedLookingFor, ...customFilters];
  const filteredUsers = users.filter(user => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(user.profession);
    if (allLookingFor.length === 0) return categoryMatch;
    // Match if any filter matches profession or preferences
    const professionMatch = allLookingFor.some(opt => user.profession && user.profession.toLowerCase().includes(opt.toLowerCase()));
    const preferenceMatch = allLookingFor.some(opt => user.preferences && user.preferences.some(p => p.toLowerCase() === opt.toLowerCase()));
    return categoryMatch && (professionMatch || preferenceMatch);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Find Friends</h1>
        <span className="text-gray-600">{filteredUsers.length} users found</span>
      </div>
      {/* Unified Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        {/* Category Filter Buttons */}
        {CATEGORY_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => toggleCategory(option.value)}
            className={`px-6 py-2 rounded-full border transition font-medium text-base ${selectedCategories.includes(option.value)
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
          >
            {option.label}
          </button>
        ))}
        {/* Looking For Filter Buttons */}
        {LOOKING_FOR_OPTIONS.filter(opt => opt.value).map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelectedLookingFor(prev => prev.includes(opt.value)
              ? prev.filter(v => v !== opt.value)
              : [...prev, opt.value])}
            className={`px-6 py-2 rounded-full border transition font-medium text-base ${selectedLookingFor.includes(opt.value)
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
          >
            {opt.label}
          </button>
        ))}
        {/* Custom Filter Pills */}
        {customFilters.map(opt => (
          <button
            key={opt}
            onClick={() => setCustomFilters(prev => prev.includes(opt)
              ? prev.filter(v => v !== opt)
              : [...prev, opt])}
            className={`px-6 py-2 rounded-full border transition font-medium text-base ${customFilters.includes(opt)
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
          >
            {opt}
          </button>
        ))}
        {/* Custom Filter Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            const val = customFilter.trim();
            if (!val || customFilters.includes(val) || selectedLookingFor.includes(val) || LOOKING_FOR_OPTIONS.some(o => o.value.toLowerCase() === val.toLowerCase())) return;
            setCustomFilters(prev => [...prev, val]);
            setCustomFilter('');
          }}
          className="flex items-center gap-2"
          style={{ minWidth: 180 }}
        >
          <input
            type="text"
            className="input px-3 py-2 rounded-full border border-gray-300"
            placeholder="Add custom..."
            value={customFilter}
            onChange={e => setCustomFilter(e.target.value)}
            maxLength={32}
          />
          <button
            type="submit"
            className="btn btn-primary px-4 py-2 rounded-full"
            disabled={!customFilter.trim() || customFilters.includes(customFilter.trim())}
          >
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-lg transition-shadow duration-300">
            {/* User Avatar Section */}
            <div className="relative h-40 bg-primary-50">
              <div className="absolute inset-0 flex items-center justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.userName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                  />
                ) : (
                  <User className="w-24 h-24 text-primary-200" />
                )}
              </div>
            </div>

            {/* User Information */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold line-clamp-1">{user.userName}</h3>
                <span className="text-sm font-medium text-primary-600">{user.age} yrs</span>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <Briefcase className="w-5 h-5 mr-2" />
                <span className="text-sm">{user.profession}</span>
              </div>

              {/* Preferences with increased spacing */}
              {user.preferences?.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-gray-700">Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {user.preferences.map((pref, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons with improved styling */}
              <div className="flex gap-4 mt-auto">
                <button 
                  onClick={() => handleWhatsApp(user.userPhoneNumber)}
                  className="flex-1 py-2.5 flex items-center justify-center bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>WhatsApp</span>
                </button>
                <button 
                  onClick={() => handleCall(user.userPhoneNumber)}
                  className="flex-1 py-2.5 flex items-center justify-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  <span>Call</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No friends found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFriendsPage;
