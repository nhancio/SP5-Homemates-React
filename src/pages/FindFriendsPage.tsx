import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { Phone, MapPin, User, Briefcase, Heart } from 'lucide-react';
import AIQueryBox from '../components/ai/AIQueryBox';

// Helper to get initials from name
function getInitials(name?: string) {
  if (!name || typeof name !== 'string' || !name.trim()) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

const COLORS = [
  'bg-pink-100 text-pink-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
];

interface User {
  id: string;
  name?: string;
  userName?: string;
  age?: number;
  profession?: string;
  city?: string;
  locality?: string;
  preferences?: string[];
  userPhoneNumber?: string;
  phone?: string;
  photoURL?: string;
  avatarUrl?: string;
  gender?: string;
  address?: {
    city?: string;
    locality?: string;
  };
}

interface Filters {
  city?: string;
  locality?: string;
  profession?: string;
  age?: string;
  preferences?: string;
}

const FindFriendsPage = () => {
  const { user } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [activeFilters, setActiveFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user's gender for filtering
        const currentUserGender = user?.gender || '';
        
        // Fetch all users first
        const snapshot = await getDocs(collection(db, 'u'));
        let usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
        
        // Apply gender-based filtering
        if (currentUserGender) {
          usersData = usersData.filter(u => {
            const userGender = u.gender || '';
            // Males can only see males, females can only see females
            return userGender.toLowerCase() === currentUserGender.toLowerCase();
          });
        }
        
        // Filter out current user
        usersData = usersData.filter(u => u.id !== user?.id);
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  // Filtering logic based on AI filters
  const handleAIFilters = (filters: Filters) => {
    setActiveFilters(filters);
    filterUsers(filters);
  };

  const filterUsers = (filters: Filters) => {
    let filtered = users;
    
    if (filters.city) {
      filtered = filtered.filter(u => (u.city || u.address?.city || '').toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.locality) {
      filtered = filtered.filter(u => (u.locality || u.address?.locality || '').toLowerCase().includes(filters.locality!.toLowerCase()));
    }
    if (filters.profession) {
      filtered = filtered.filter(u => (u.profession || '').toLowerCase().includes(filters.profession!.toLowerCase()));
    }
    if (filters.age) {
      const age = Number(filters.age);
      if (!isNaN(age)) {
        filtered = filtered.filter(u => {
          const userAge = Number(u.age);
          return !isNaN(userAge) && userAge === age;
        });
      }
    }
    if (filters.preferences) {
      filtered = filtered.filter(u => {
        const userPrefs = u.preferences || [];
        return userPrefs.some((pref: string) => 
          pref.toLowerCase().includes(filters.preferences!.toLowerCase())
        );
      });
    }
    
    setFilteredUsers(filtered);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key as keyof Filters];
    setActiveFilters(newFilters);
    filterUsers(newFilters);
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setFilteredUsers(users);
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_blank');
    } else {
      alert('Phone number not available');
    }
  };

  const handleWhatsApp = (phoneNumber: string, userName: string) => {
    if (phoneNumber) {
      const currentUserName = user?.name || 'a Homemates user';
      const message = `Hi ${userName}! I'm ${currentUserName} from the Homemates app. I found your profile and would love to connect with you!`;
      const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      alert('Phone number not available');
    }
  };

  const renderFilterChips = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-6 justify-center items-center animate-fade-in">
        {Object.entries(activeFilters).map(([key, value]) => (
          <span key={key} className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200 transition-all duration-300 animate-fade-in">
            {key}: <span className="ml-1 font-bold">{String(value)}</span>
            <button
              className="ml-2 text-primary-400 hover:text-primary-700 focus:outline-none"
              onClick={() => handleRemoveFilter(key)}
              aria-label={`Remove filter ${key}`}
              type="button"
            >
              ×
            </button>
          </span>
        ))}
        <button
          className="ml-4 px-3 py-1 rounded-full bg-gray-200 hover:bg-primary-100 text-gray-700 hover:text-primary-700 border border-gray-300 text-xs font-medium transition"
          onClick={handleClearAllFilters}
          type="button"
        >
          Clear All
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 text-center">Find Friends</h1>
        <p className="text-lg text-gray-600 mb-4 text-center">
          Connect with other Homemates users and grow your network!
        </p>
        {user?.gender && (
          <div className="flex justify-center mb-8">
            <p className="text-sm font-medium text-primary-700 bg-primary-50 px-6 py-3 rounded-full inline-block">
              Showing only {user.gender} users
            </p>
          </div>
        )}
        
        <AIQueryBox
          onFiltersExtracted={handleAIFilters}
          placeholder="Find friends, e.g. Software engineers in Bangalore, 25-30, who like music"
          suggestions={[
            'Software engineers in Pune',
            'People who like cricket in Mumbai',
            'Age 25-30 in Chennai',
            'People interested in music in Kolkata',
            'Students in Delhi',
            'People who like movies in Bangalore',
          ]}
        />
        
        {Object.keys(activeFilters).length > 0 && renderFilterChips()}
        
        {loading && <div className="text-center text-lg text-primary-600">Loading...</div>}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.map((user, idx) => {
            const color = COLORS[idx % COLORS.length];
            const name = user.name || user.userName || 'No Name';
            const city = user.city || user.address?.city || 'No City';
            const locality = user.locality || user.address?.locality || '';
            const profession = user.profession || '';
            const avatarUrl = user.photoURL || user.avatarUrl;
            const age = user.age || '';
            const preferences = user.preferences || [];
            const phoneNumber = user.userPhoneNumber || user.phone || '';
            
            return (
              <div
                key={user.id}
                className="bg-gradient-to-br from-white via-white to-gray-50/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100/80 p-6 flex flex-col items-center transition-all duration-500 hover:scale-105 hover:shadow-3xl group relative animate-fade-in hover:border-pink-200 hover:bg-gradient-to-br hover:from-white hover:via-pink-50/50 hover:to-white transform hover:-translate-y-2"
              >
                {/* Avatar */}
                {avatarUrl && avatarUrl !== '/images/default-avatar.png' ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-3 border-pink-200 mb-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ${color} border-3 border-white`}>
                    {getInitials(name)}
                  </div>
                )}
                
                {/* Name */}
                <div className="text-xl font-bold mb-4 text-center text-gray-900 group-hover:text-primary-700 transition-colors">
                  {name}
                </div>
                
                {/* Age */}
                <div className="mb-3 flex items-center gap-2 text-gray-700 w-full">
                  <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold truncate">{age ? `${age} years` : 'Age not set'}</span>
                </div>
                
                {/* Profession */}
                <div className="mb-3 flex items-center gap-2 text-gray-700 w-full">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <Briefcase className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold truncate">{profession || 'Profession not set'}</span>
                </div>
                
                {/* City */}
                <div className="mb-3 flex items-center gap-2 text-gray-700 w-full">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold truncate">{city !== 'No City' ? city : 'City not set'}</span>
                </div>
                
                {/* Locality */}
                <div className="mb-3 flex items-center gap-2 text-gray-700 w-full">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold truncate">{locality || 'Locality not set'}</span>
                </div>
                
                {/* Preferences */}
                {preferences && Array.isArray(preferences) && preferences.length > 0 && (
                  <div className="mb-4 w-full">
                    <div className="flex items-center gap-2 mb-2 text-gray-700">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <Heart className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold">Preferences</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-start">
                      {preferences.map((pref, index) => (
                        <span key={index} className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 border border-pink-200 shadow-sm hover:shadow-md transition-all duration-200">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Communication Buttons */}
                <div className="flex gap-3 mt-5 w-full justify-center flex-wrap">
                  {phoneNumber && (
                    <>
                      <button
                        onClick={() => handleCall(phoneNumber)}
                        className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-green-200"
                        title="Call"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleWhatsApp(phoneNumber, name)}
                        className="w-12 h-12 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-[#25D366]"
                        title="WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {(!loading && filteredUsers.length === 0) && (
          <div className="text-center text-gray-500 mt-8">
            {user?.gender ? `No ${user.gender} users found matching your criteria.` : 'No users found matching your criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFriendsPage;