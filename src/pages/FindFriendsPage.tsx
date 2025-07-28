import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
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

const FindFriendsPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const snapshot = await getDocs(collection(db, 'u'));
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtering logic based on AI filters
  const handleAIFilters = (filters: any) => {
    setActiveFilters(filters);
    filterUsers(filters);
  };

  const filterUsers = (filters: any) => {
    let filtered = users;
    if (filters.city) {
      filtered = filtered.filter(u => (u.city || u.address?.city || '').toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.profession) {
      filtered = filtered.filter(u => (u.profession || '').toLowerCase().includes(filters.profession.toLowerCase()));
    }
    if (filters.gender) {
      filtered = filtered.filter(u => (u.gender || '').toLowerCase().includes(filters.gender.toLowerCase()));
    }
    if (filters.age) {
      const age = Number(filters.age);
      if (!isNaN(age)) {
        filtered = filtered.filter(u => Number(u.age) === age);
      } else if (typeof filters.age === 'string' && filters.age.includes('-')) {
        const [min, max] = filters.age.split('-').map(Number);
        filtered = filtered.filter(u => Number(u.age) >= min && Number(u.age) <= max);
      }
    }
    if (filters.interests) {
      const interests = Array.isArray(filters.interests) ? filters.interests : String(filters.interests).split(',');
      filtered = filtered.filter(u =>
        interests.some((interest: string) => (u.interests || '').toLowerCase().includes(interest.toLowerCase()))
      );
    }
    setFilteredUsers(filtered);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    filterUsers(newFilters);
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setFilteredUsers(users);
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
    <div className="min-h-[80vh] bg-gradient-to-b from-white to-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold mb-2 text-primary-700 text-center">Find Friends</h1>
        <p className="text-lg text-gray-500 mb-8 text-center">Connect with other Homemates users and grow your network!</p>
        <AIQueryBox
          onFiltersExtracted={handleAIFilters}
          placeholder="Find friends, e.g. Female software engineers in Bangalore, 25-30, who like music"
          suggestions={[
            'Female flatmates in Hyderabad',
            'Software engineers in Pune',
            'Friends who like cricket in Mumbai',
            'Male, 25-30, in Chennai',
            'People interested in music in Kolkata',
            'Students in Delhi',
            'Flatmates in Bangalore who like movies',
          ]}
        />
        {Object.keys(activeFilters).length > 0 && renderFilterChips()}
        {loading && <div className="text-center text-lg text-primary-600">Loading...</div>}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredUsers.map((user, idx) => {
            const color = COLORS[idx % COLORS.length];
            const name = user.name || user.userName || 'No Name';
            const email = user.email || user.userEmail;
            const city = user.city || user.address?.city || 'No City';
            const profession = user.profession || '';
            const avatarUrl = user.photoURL || user.avatarUrl;
            const gender = user.gender || '';
            const age = user.age || '';
            const interests = user.interests || '';
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-xl group relative animate-fade-in"
              >
                {/* Avatar */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-primary-100 mb-3 shadow-sm"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-sm ${color}`}>
                    {getInitials(name)}
                  </div>
                )}
                {/* Name */}
                <div className="text-lg font-semibold mb-1 text-center text-gray-900 group-hover:text-primary-700 transition-colors">{name}</div>
                {/* Email */}
                <div className="text-gray-500 text-sm mb-2 text-center break-all">{email}</div>
                {/* City badge */}
                <div className="mb-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100`}>{city}</span>
                </div>
                {/* Profession badge */}
                {profession && (
                  <div className="mb-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{profession}</span>
                  </div>
                )}
                {/* Gender badge */}
                {gender && (
                  <div className="mb-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-100">{gender}</span>
                  </div>
                )}
                {/* Age badge */}
                {age && (
                  <div className="mb-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{age}</span>
                  </div>
                )}
                {/* Interests badge */}
                {interests && (
                  <div className="mb-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">{interests}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {(!loading && filteredUsers.length === 0) && <div className="text-center text-gray-500 mt-8">No users found.</div>}
      </div>
    </div>
  );
};

export default FindFriendsPage;