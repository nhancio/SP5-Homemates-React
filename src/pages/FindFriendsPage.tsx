import React, { useEffect, useState } from 'react';
import { User, Briefcase, Loader, Phone, Star, MapPin, DollarSign, Heart } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { findUserMatches, getCompatibilityInsights, MatchScore, UserProfile } from '../services/matching';

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
  online?: boolean;
  lastActive?: number;
  city?: string;
  locality?: string;
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
  const { user: currentUser, isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [compatibilityInsights, setCompatibilityInsights] = useState<any>(null);

  const openProfileModal = (user: UserProfile) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setSelectedUser(null);
    setShowProfileModal(false);
  };

  const openCompatibilityModal = (user: UserProfile) => {
    if (currentUser) {
      const insights = getCompatibilityInsights(currentUser, user);
      setCompatibilityInsights(insights);
      setSelectedUser(user);
      setShowCompatibilityModal(true);
    }
  };

  const closeCompatibilityModal = () => {
    setCompatibilityInsights(null);
    setSelectedUser(null);
    setShowCompatibilityModal(false);
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
    if (!isAuthenticated) {
      navigate('/');
        return;
      }

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (currentUser) {
          // Use the new matching algorithm
          const matches = await findUserMatches(currentUser, 50);
          setMatchScores(matches);
          setUsers(matches.map(match => match.user));
        }
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [currentUser?.id, isAuthenticated, navigate]);

  // Filter users by selected categories and preferences
  const allLookingFor = [...selectedLookingFor, ...customFilters];
  const filteredMatchScores = matchScores.filter(match => {
    const user = match.user;
    const categoryMatch = !selectedCategory || user.profession === selectedCategory;
    if (allLookingFor.length === 0) return categoryMatch;
    
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
  if (filteredMatchScores.length === 0) {
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

  return (
    <div className="container py-8 relative">
      <AnimatedBubblesBackground />
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-3xl font-extrabold mb-1 text-primary-700">Smart Matching Algorithm 🎯</h1>
        <p className="text-lg text-gray-600">Find your perfect flatmate using our advanced preference matching system.</p>
        <span className="block text-primary-600 font-semibold mt-2">{filteredMatchScores.length} matches found</span>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="inline-block px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-base font-semibold shadow-sm border border-primary-100 animate-fade-in">💡 Icebreaker: {getRandomIcebreaker()}</span>
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

      {/* Filters Section */}
      <div className="mb-8">
        {/* Profession Filter */}
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
        
        {/* Interests Filter */}
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

      {/* Enhanced User Cards with Match Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatchScores.map((match, idx) => {
          const user = match.user;
          const isOnline = user.online && user.lastActive && (Date.now() - user.lastActive < 2 * 60 * 1000);
          
          return (
            <div
              key={user.id}
              className={`bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-xl transition-shadow duration-300 relative group border border-primary-100 hover:border-primary-400 animate-fade-in-up cursor-pointer`}
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
            >
              {/* Match Score Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {match.score}% Match
                </div>
              </div>

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
                  <span
                    className={`absolute bottom-4 right-8 w-4 h-4 rounded-full border-2 border-white ${
                      isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* User Info Section */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{user.userName}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {user.profession}
                    </div>
                    {user.city && (
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.city}{user.locality && `, ${user.locality}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Breakdown */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Preferences</span>
                    <span className="font-semibold">{match.breakdown.preferenceMatch}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${match.breakdown.preferenceMatch}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Location</span>
                    <span className="font-semibold">{match.breakdown.locationMatch}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${match.breakdown.locationMatch}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Lifestyle</span>
                    <span className="font-semibold">{match.breakdown.lifestyleMatch}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${match.breakdown.lifestyleMatch}%` }}
                    />
                  </div>
                </div>

                {/* Shared Preferences */}
                {match.sharedPreferences.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Shared interests:</p>
                    <div className="flex flex-wrap gap-1">
                      {match.sharedPreferences.slice(0, 3).map(pref => (
                        <span key={pref} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                          {pref}
                        </span>
                      ))}
                      {match.sharedPreferences.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{match.sharedPreferences.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCompatibilityModal(user);
                    }}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Compatibility
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProfileModal(user);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                </div>

                {/* Contact Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(user.userPhoneNumber);
                    }}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-1"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsApp(user.userPhoneNumber);
                    }}
                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-1"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Profile Modal */}
      {showProfileModal && selectedUser && (
        <ProfileModal user={selectedUser} open={showProfileModal} onClose={closeProfileModal} />
      )}

      {/* Compatibility Insights Modal */}
      {showCompatibilityModal && selectedUser && compatibilityInsights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeCompatibilityModal}>
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={closeCompatibilityModal}>&times;</button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary-700 mb-2">Compatibility Analysis</h2>
              <div className="text-4xl font-bold text-primary-600 mb-2">{compatibilityInsights.overallScore}%</div>
              <p className="text-gray-600">Overall Match Score</p>
            </div>

            {/* Strengths */}
            {compatibilityInsights.strengths.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-700 mb-3">✨ Strengths</h3>
                <div className="space-y-2">
                  {compatibilityInsights.strengths.map((strength: string, idx: number) => (
                    <div key={idx} className="flex items-center text-sm text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {compatibilityInsights.areas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-orange-700 mb-3">⚠️ Areas</h3>
                <div className="space-y-2">
                  {compatibilityInsights.areas.map((area: string, idx: number) => (
                    <div key={idx} className="flex items-center text-sm text-orange-600">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {compatibilityInsights.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">💡 Recommendations</h3>
                <div className="space-y-2">
                  {compatibilityInsights.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-center text-sm text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {rec}
                    </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex gap-3">
                <button 
                onClick={closeCompatibilityModal}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                Close
                </button>
                <button 
                onClick={() => {
                  closeCompatibilityModal();
                  openProfileModal(selectedUser);
                }}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                View Full Profile
                </button>
            </div>
          </div>
          </div>
        )}
    </div>
  );
};

export default FindFriendsPage;
