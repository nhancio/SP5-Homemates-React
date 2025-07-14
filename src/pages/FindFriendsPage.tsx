import React, { useEffect, useState } from 'react';
import { User, Briefcase, Loader, Phone } from 'lucide-react';
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
  { label: 'Student', value: 'Student' },
  { label: 'Working Professional', value: 'Working Professional' },
  { label: 'Doctor', value: 'Doctor' },
  { label: 'Engineer', value: 'Engineer' },
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Artist', value: 'Artist' },
  { label: 'Business', value: 'Business' },
  { label: 'Researcher', value: 'Researcher' },
  { label: 'Others', value: 'Others' },
];

const INTEREST_OPTIONS = [
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    const categoryMatch = !selectedCategory || user.profession === selectedCategory;
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
      <div className="mb-8">
        {/* Profession Filter (Single-select) */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <span className="font-semibold text-gray-700 mr-2">Profession:</span>
          {CATEGORY_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedCategory(selectedCategory === option.value ? null : option.value)}
              className={`px-6 py-2 rounded-full border transition font-medium text-base ${selectedCategory === option.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {/* Interests Filter (Multi-select) */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="font-semibold text-gray-700 mr-2">Interests:</span>
          {INTEREST_OPTIONS.map(opt => (
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
          {/* Custom Interest Pills */}
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
          <input
            type="text"
            value={customFilter}
            onChange={e => setCustomFilter(e.target.value)}
            placeholder="Add custom..."
            className="input w-40 text-sm px-3 py-2 border rounded mr-2"
          />
          <button
            type="button"
            onClick={() => {
              if (customFilter.trim() && !customFilters.includes(customFilter.trim())) {
                setCustomFilters([...customFilters, customFilter.trim()]);
                setCustomFilter('');
              }
            }}
            className="btn btn-primary px-4 py-2 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-lg transition-shadow duration-300">
            {/* User Avatar Section */}
            <div className="relative h-40 bg-primary-50">
              <div className="absolute inset-0 flex items-center justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL || '/images/default-avatar.png'}
                    alt={user.userName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                    onError={e => { e.currentTarget.src = '/images/default-avatar.png'; }}
                  />
                ) : (
                  <img
                    src={'/images/default-avatar.png'}
                    alt={user.userName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                  />
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
                  <p className="text-sm font-medium text-gray-700">Interests</p>
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
                  className="flex-1 py-2.5 flex items-center justify-center bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.205C13.416 27.168 14.684 27.5 16 27.5c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.168 0-2.312-.205-3.393-.607l-.242-.086-4.65 1.308 1.242-4.393-.158-.23C7.205 19.312 7 18.168 7 17c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.293-7.293c-.293-.293-.707-.293-1 0l-1.293 1.293c-.293.293-.293.707 0 1l2 2c.293.293.707.293 1 0l1.293-1.293c.293-.293.293-.707 0-1l-2-2z" />
                  </svg>
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
