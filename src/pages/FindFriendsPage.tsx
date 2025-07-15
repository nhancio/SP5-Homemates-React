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

// Fun facts/icebreakers
const ICEBREAKERS = [
  "What's your favorite midnight snack?",
  "If you could travel anywhere, where would you go?",
  "What's your go-to comfort movie?",
  "What's a hobby you wish you had more time for?",
  "If you could have any superpower, what would it be?",
  "What's your favorite way to unwind after a long day?",
  "What's the best meal you've ever had?",
  "What's a fun fact about you most people don't know?",
  "If you could instantly master a skill, what would it be?",
  "What's your favorite thing about living with friends?"
];

function getRandomIcebreaker() {
  return ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
}

// Helper: Randomly assign online status and badges for demo
function getRandomOnlineStatus(id: string) {
  // 70% chance online
  return (parseInt(id.replace(/\D/g, ''), 10) % 10) < 7;
}
const BADGES = ['New', 'Verified', 'Super Friendly'];
function getRandomBadge(id: string) {
  const n = parseInt(id.replace(/\D/g, ''), 10);
  if (n % 7 === 0) return BADGES[0];
  if (n % 5 === 0) return BADGES[1];
  if (n % 3 === 0) return BADGES[2];
  return null;
}

// Helper: Get initials from name
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

// Animated background component
function AnimatedBubblesBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary-100 opacity-30 animate-bubble"
          style={{
            width: `${16 + Math.random() * 32}px`,
            height: `${16 + Math.random() * 32}px`,
            left: `${Math.random() * 100}%`,
            bottom: `-${Math.random() * 100}px`,
            animationDuration: `${6 + Math.random() * 6}s`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// Confetti/emoji burst component
function EmojiBurst({ show }: { show: boolean }) {
  if (!show) return null;
  const emojis = ['🎉', '👋', '😃', '✨', '🥳', '💫'];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
      {emojis.map((emoji, i) => (
        <span
          key={i}
          className="text-4xl animate-emoji-burst"
          style={{ left: `${20 + i * 12}%`, top: `${30 + i * 8}%`, position: 'absolute' }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// Profile preview modal
function ProfileModal({ user, open, onClose }: { user: UserProfile | null, open: boolean, onClose: () => void }) {
  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <div className="flex flex-col items-center">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.userName} className="w-28 h-28 rounded-full object-cover border-4 border-primary-100 shadow mb-4" />
          ) : user.userName ? (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-primary-200 text-primary-800 text-4xl font-bold border-4 border-primary-100 shadow mb-4">
              {getInitials(user.userName)}
            </div>
          ) : (
            <img src="/images/default-avatar.png" alt="Default avatar" className="w-28 h-28 rounded-full object-cover border-4 border-primary-100 shadow mb-4" />
          )}
          <h2 className="text-2xl font-bold text-primary-700 mb-1">{user.userName}</h2>
          <div className="text-gray-600 mb-2">{user.profession}</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {user.preferences.map(pref => (
              <span key={pref} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">{pref}</span>
            ))}
          </div>
          <button onClick={() => alert('😊 Compliment sent!')} className="btn btn-primary px-6 py-2 mt-2">Send Compliment</button>
        </div>
      </div>
    </div>
  );
}

// WhatsApp SVG icon
const WhatsAppIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 mr-1 inline-block align-middle" />
);

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

  // Pick a random icebreaker on mount
  const [icebreaker, setIcebreaker] = useState('');
  const [modalUser, setModalUser] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [burstUserId, setBurstUserId] = useState<string | null>(null);
  useEffect(() => {
    setIcebreaker(getRandomIcebreaker());
  }, []);
  const openProfileModal = (user: UserProfile) => {
    setModalUser(user);
    setModalOpen(true);
  };
  const closeProfileModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalUser(null), 300);
  };

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

  // Compute top connectors (users with most interests)
  const topConnectors = [...users]
    .sort((a, b) => (b.preferences?.length || 0) - (a.preferences?.length || 0))
    .slice(0, 3);

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

  // Fun empty state
  if (filteredUsers.length === 0) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center relative">
        <AnimatedBubblesBackground />
        <div className="w-48 h-48 mb-4 opacity-90 flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
            <circle cx="80" cy="80" r="80" fill="#F3F4F6"/>
            <ellipse cx="80" cy="110" rx="40" ry="10" fill="#E5E7EB"/>
            <rect x="50" y="60" width="60" height="30" rx="15" fill="#D1D5DB"/>
            <circle cx="70" cy="75" r="6" fill="#9CA3AF"/>
            <circle cx="90" cy="75" r="6" fill="#9CA3AF"/>
            <rect x="75" y="85" width="10" height="4" rx="2" fill="#9CA3AF"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-primary-700 mb-2">No matches yet!</h2>
        <p className="text-gray-600 mb-2">Try changing your filters or invite your friends to join Homemates!</p>
      </div>
    );
  }

  // Add bubble animation to global styles (if not present)
  // .animate-bubble { animation: bubbleUp linear infinite; }
  // @keyframes bubbleUp { 0% { transform: translateY(0); } 100% { transform: translateY(-120vh); } }

  return (
    <div className="container py-8 relative">
      <AnimatedBubblesBackground />
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-3xl font-extrabold mb-1 text-primary-700">Meet Your Next Flatmate or Friend! 🎉</h1>
        <p className="text-lg text-gray-600">Connect with like-minded homemates, join activities, and make your stay memorable.</p>
        <span className="block text-primary-600 font-semibold mt-2">{filteredUsers.length} users found</span>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="inline-block px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-base font-semibold shadow-sm border border-primary-100 animate-fade-in">💡 Icebreaker: {icebreaker}</span>
        </div>
        {/* Top Connectors Section */}
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-xl font-bold text-primary-700 mb-2">Top Connectors</h2>
          <div className="flex gap-6 justify-center">
            {topConnectors.map(tc => (
              <div key={tc.id} className="flex flex-col items-center bg-primary-50 rounded-lg px-4 py-3 shadow border border-primary-100 min-w-[120px]">
                {tc.photoURL ? (
                  <img src={tc.photoURL} alt={tc.userName} className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 mb-2" />
                ) : tc.userName ? (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-200 text-primary-800 text-xl font-bold border-2 border-primary-200 mb-2">
                    {getInitials(tc.userName)}
                  </div>
                ) : (
                  <img src="/images/default-avatar.png" alt="Default avatar" className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 mb-2" />
                )}
                <span className="font-semibold text-primary-800 text-sm mb-1">{tc.userName}</span>
                <span className="text-xs text-primary-600">{tc.preferences.length} interests</span>
              </div>
            ))}
          </div>
        </div>
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
        {filteredUsers.map((user, idx) => {
          const isOnline = getRandomOnlineStatus(user.id);
          const badge = getRandomBadge(user.id);
          const handleWave = (userId: string) => {
            setBurstUserId(userId);
            setTimeout(() => setBurstUserId(null), 1200);
            alert('👋 You waved!');
          };
          return (
            <div
              key={user.id}
              className={`bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-xl transition-shadow duration-300 relative group border border-primary-100 hover:border-primary-400 animate-fade-in-up cursor-pointer`}
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
              onClick={() => openProfileModal(user)}
            >
              <EmojiBurst show={burstUserId === user.id} />
              {/* User Avatar Section */}
              <div className="relative h-40 bg-primary-50 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.userName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.currentTarget.src = '/images/default-avatar.png'; }}
                    />
                  ) : user.userName ? (
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary-200 text-primary-800 text-3xl font-bold border-4 border-white shadow group-hover:scale-105 transition-transform duration-300">
                      {getInitials(user.userName)}
                    </div>
                  ) : (
                    <img
                      src="/images/default-avatar.png"
                      alt="Default avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {/* Online status dot */}
                  <span className={`absolute bottom-4 right-8 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={isOnline ? 'Online' : 'Offline'} />
                  {/* Fun badge */}
                  {badge && (
                    <span className="absolute top-4 left-8 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold shadow">{badge}</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {user.userName}
                  {/* Badge for similar interests */}
                  {user.preferences.some(p => selectedLookingFor.includes(p)) && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Similar Interests</span>
                  )}
                </h3>
                <div className="text-sm text-gray-500 mb-2">{user.profession}</div>
                {/* Interests as pills */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {user.preferences.map(pref => (
                    <span key={pref} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">{pref}</span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-sm btn-primary flex-1 flex items-center justify-center gap-1" onClick={e => { e.stopPropagation(); handleCall(user.userPhoneNumber); }}>
                    <Phone className="w-5 h-5 mr-1" /> Call
                  </button>
                  <button className="btn btn-sm btn-success flex-1 flex items-center justify-center gap-1" onClick={e => { e.stopPropagation(); handleWhatsApp(user.userPhoneNumber); }}>
                    <WhatsAppIcon /> WhatsApp
                  </button>
                  <button className="btn btn-sm btn-outline flex-1" onClick={e => { e.stopPropagation(); handleWave(user.id); }}>Wave 👋</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ProfileModal user={modalUser} open={modalOpen} onClose={closeProfileModal} />
    </div>
  );
};

export default FindFriendsPage;
