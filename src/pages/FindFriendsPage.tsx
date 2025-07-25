import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

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
      } catch (err) {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-white to-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold mb-2 text-primary-700 text-center">Find Friends</h1>
        <p className="text-lg text-gray-500 mb-8 text-center">Connect with other Homemates users and grow your network!</p>
        {loading && <div className="text-center text-lg text-primary-600">Loading...</div>}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {users.map((user, idx) => {
            const color = COLORS[idx % COLORS.length];
            const name = user.name || user.userName || 'No Name';
            const email = user.email || user.userEmail;
            const city = user.city || user.address?.city || 'No City';
            const profession = user.profession || '';
            const avatarUrl = user.photoURL || user.avatarUrl;
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-xl group relative"
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
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{profession}</span>
                  </div>
                )}
                {/* Add more info here if needed */}
              </div>
            );
          })}
        </div>
        {(!loading && users.length === 0) && <div className="text-center text-gray-500 mt-8">No users found.</div>}
      </div>
    </div>
  );
};

export default FindFriendsPage;