import React, { useEffect, useState, useRef } from 'react';
import { User as UserIcon, Briefcase, Loader, Phone, Star, MapPin, DollarSign, Heart } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { findUserMatches, getCompatibilityInsights, MatchScore, UserProfile, mockUsers } from '../services/matching';
import { 
  // @ts-ignore
  calculatePreferenceMatch, 
  calculateLocationMatch, 
  calculateBudgetMatch, 
  calculateLifestyleMatch 
} from '../services/matching';
import { useCallback } from 'react';

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

// Icebreaker cycling logic (must be outside the component)
function useCyclingIcebreaker(intervalMs = 5000) {
  const [icebreakerIndex, setIcebreakerIndex] = useState(() => Math.floor(Math.random() * ICEBREAKERS.length));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIcebreakerIndex(prev => (prev + 1) % ICEBREAKERS.length);
    }, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs]);

  return ICEBREAKERS[icebreakerIndex];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2" onClick={onClose}>
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 text-2xl bg-white bg-opacity-80 rounded-full w-10 h-10 flex items-center justify-center transition" onClick={onClose}>&times;</button>
        <div className="flex flex-col items-center p-6 md:p-8">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center w-full mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-1 mb-4 shadow-lg">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.userName} className="w-full h-full rounded-full object-cover border-4 border-white" />
              ) : user.userName ? (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-white text-rose-600 text-5xl font-extrabold border-4 border-white">
                  {getInitials(user.userName)}
                </div>
              ) : (
                <img src="/images/default-avatar.png" alt="Default avatar" className="w-full h-full rounded-full object-cover border-4 border-white" />
              )}
            </div>
            <h2 className="text-3xl font-extrabold text-rose-600 mb-1 text-center">{user.userName}</h2>
            <div className="text-rose-500 text-lg font-semibold mb-4 text-center flex items-center gap-2"><Briefcase className="w-5 h-5" />{user.profession}</div>
          </div>
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-rose-100 to-pink-50 my-2" />
          {/* Basic Info Section */}
          <div className="w-full max-w-md text-left mb-6">
            <div className="font-semibold text-rose-700 mb-3 text-base flex items-center gap-2"><UserIcon className="w-5 h-5" />Basic Info</div>
            <ul className="flex flex-col gap-3">
              {user.city && (
                <li className="flex items-center gap-2 text-rose-900 text-base">
                  <MapPin className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="font-semibold min-w-[80px] text-rose-900">Location:</span>
                  <span className="text-gray-700 text-base text-left">{user.city}{user.locality ? `, ${user.locality}` : ''}</span>
                </li>
              )}
              {user.age && (
                <li className="flex items-center gap-2 text-rose-900 text-base">
                  <Star className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="font-semibold min-w-[80px] text-rose-900">Age:</span>
                  <span className="text-gray-700 text-base text-left">{user.age}</span>
                </li>
              )}
              {user.gender && (
                <li className="flex items-center gap-2 text-rose-900 text-base">
                  <Heart className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="font-semibold min-w-[80px] text-rose-900">Gender:</span>
                  <span className="text-gray-700 text-base text-left">{user.gender}</span>
                </li>
              )}
              {user.userPhoneNumber && (
                <li className="flex items-center gap-2 text-rose-900 text-base">
                  <Phone className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="font-semibold min-w-[80px] text-rose-900">Phone:</span>
                  <span className="text-gray-700 text-base text-left">+91 {user.userPhoneNumber}</span>
                </li>
              )}
            </ul>
          </div>
          {/* Preferences Section */}
          <div className="w-full max-w-md text-left mb-8">
            <div className="font-semibold text-rose-700 mb-3 text-base flex items-center gap-2"><UserIcon className="w-5 h-5" />Preferences</div>
            <ul className="flex flex-col gap-2">
              {user.preferences.length > 0 ? user.preferences.map(pref => (
                <li key={pref} className="flex items-center gap-2 text-rose-800 bg-rose-50 rounded px-3 py-1 text-sm font-medium border border-rose-100">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span> {pref}
                </li>
              )) : <li className="text-gray-400">No preferences listed</li>}
            </ul>
          </div>
          <button
            onClick={() => {
              const compliment = "Hey! I think you're awesome. 😊";
              const whatsappNumber = user.userPhoneNumber ? '91' + user.userPhoneNumber.replace(/\D/g, '') : '';
              if (whatsappNumber) {
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(compliment)}`;
                window.open(whatsappUrl, '_blank');
              } else {
                alert('Phone number not available');
              }
            }}
            className="mt-2 px-10 py-4 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow hover:from-rose-600 hover:to-pink-600 transition self-center w-full max-w-md"
          >
            Send Compliment
          </button>
        </div>
      </div>
    </div>
  );
}

// Add CompatibilityModal component
function CompatibilityModal({ user, open, onClose, insights }: { user: UserProfile | null, open: boolean, onClose: () => void, insights: any }) {
  if (!open || !user || !insights) return null;
  const score = insights.overallScore;
  const highMatch = score >= 70;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative border-2 border-fuchsia-200" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-fuchsia-400 hover:text-fuchsia-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold text-fuchsia-700 mb-2 text-center">Compatibility Breakdown</h2>
        <div className="flex flex-col items-center mb-6">
          {/* Score ring */}
          <div className="relative w-24 h-24 mb-2">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F3E8FF" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={highMatch ? '#D946EF' : '#F59E42'}
                strokeWidth="10"
                strokeDasharray={282.6}
                strokeDashoffset={282.6 - (score / 100) * 282.6}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
              <text x="50" y="56" textAnchor="middle" fontSize="2em" fill={highMatch ? '#D946EF' : '#F59E42'} fontWeight="bold">{score}%</text>
            </svg>
          </div>
          <p className="text-gray-600 text-center mb-2">
            {highMatch ? '🎉 Great match! You have a lot in common.' : '🤔 There are some differences, but you might still get along!'}
          </p>
        </div>
        {/* Factor breakdown */}
        <div className="mb-6">
          <table className="w-full text-sm mb-2">
            <tbody>
              <tr><td className="font-semibold text-fuchsia-700">Preferences</td><td className="text-right">{insights.breakdown?.preferenceMatch ?? '-' }%</td></tr>
              <tr><td className="font-semibold text-fuchsia-700">Location</td><td className="text-right">{insights.breakdown?.locationMatch ?? '-' }%</td></tr>
              <tr><td className="font-semibold text-fuchsia-700">Budget</td><td className="text-right">{insights.breakdown?.budgetMatch ?? '-' }%</td></tr>
              <tr><td className="font-semibold text-fuchsia-700">Lifestyle</td><td className="text-right">{insights.breakdown?.lifestyleMatch ?? '-' }%</td></tr>
              <tr><td className="font-semibold text-fuchsia-700">Compatibility</td><td className="text-right">{insights.breakdown?.compatibilityScore ?? '-' }%</td></tr>
            </tbody>
          </table>
        </div>
        {/* Shared Interests */}
        {insights.sharedPreferences && insights.sharedPreferences.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-fuchsia-700 mb-2">Shared Interests</h3>
            <div className="flex flex-wrap gap-2">
              {insights.sharedPreferences.map((pref: string) => (
                <span key={pref} className="px-2 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs font-semibold border border-fuchsia-200">{pref}</span>
              ))}
            </div>
          </div>
        )}
        {/* Strengths */}
        {insights.strengths.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-700 mb-3">✨ Strengths</h3>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              {insights.strengths.map((strength: string, idx: number) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Areas for Improvement */}
        {insights.areas.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-orange-700 mb-3">⚠️ Areas</h3>
            <ul className="list-disc list-inside space-y-1 text-orange-700">
              {insights.areas.map((area: string, idx: number) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">💡 Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              {insights.recommendations.map((rec: string, idx: number) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
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
  // Always call hooks at the top level, before any returns
  const cyclingIcebreaker = useCyclingIcebreaker(5000);
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

  // Map currentUser (AppContext User) to UserProfile shape for mock testing
  // This is used everywhere a UserProfile is needed for mockUsers
  const currentUserProfile: UserProfile | null = currentUser
    ? {
        id: currentUser.id,
        userEmail: currentUser.email || '',
        userName: currentUser.name || '',
        userPhoneNumber: '',
        age: 25, // default/mock value
        gender: 'Other', // default/mock value
        profession: 'Engineer', // default/mock value
        preferences: currentUser.preferences || [],
        photoURL: currentUser.photoURL,
        online: true,
        lastActive: Date.now(),
        city: 'Bangalore', // default/mock value
        locality: 'Indiranagar', // default/mock value
      }
    : null;

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9;
  const totalPages = Math.ceil(filteredMatchScores.length / cardsPerPage);
  const paginatedMatchScores = filteredMatchScores.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  const openProfileModal = (user: UserProfile) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setSelectedUser(null);
    setShowProfileModal(false);
  };

  const openCompatibilityModal = (user: UserProfile) => {
    if (!currentUserProfile) {
      console.warn('No currentUserProfile, cannot open compatibility modal');
      return;
    }
    console.log('Current user (compatibility):', currentUserProfile);
    const match = matchScores.find(m => m.user.id === user.id);
    const insights = getCompatibilityInsights(currentUserProfile, user);
    const compatibilityData = {
      ...insights,
      breakdown: match?.breakdown,
      sharedPreferences: match?.sharedPreferences,
    };
    setCompatibilityInsights(compatibilityData);
    setSelectedUser(user);
    setShowCompatibilityModal(true);
  };

  const closeCompatibilityModal = () => {
    setCompatibilityInsights(null);
    setSelectedUser(null);
    setShowCompatibilityModal(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!currentUserProfile) {
      console.warn('No currentUserProfile, skipping matching logic');
      return;
    }

    // For local testing: use mockUsers instead of fetching from Firebase
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use mockUsers for local testing
        // const matches = await findUserMatches(currentUser, 50); // <-- original Firebase
        const matches = mockUsers
          .filter(u => u.id !== currentUserProfile.id)
          .map(user => {
            // Use the real scoring logic for each breakdown
            const prefMatch = calculatePreferenceMatch(currentUserProfile, user);
            const locMatch = calculateLocationMatch(currentUserProfile, user);
            const budMatch = calculateBudgetMatch(currentUserProfile, user);
            const lifeMatch = calculateLifestyleMatch(currentUserProfile, user);
            const insights = getCompatibilityInsights(currentUserProfile, user);
            return {
              user,
              score: insights.overallScore,
              breakdown: {
                preferenceMatch: Math.round(prefMatch.score),
                locationMatch: Math.round(locMatch),
                budgetMatch: Math.round(budMatch),
                lifestyleMatch: Math.round(lifeMatch.score),
                compatibilityScore: insights.overallScore,
              },
              sharedPreferences: prefMatch.sharedPreferences,
              compatibilityFactors: insights.strengths,
            };
          });
        setMatchScores(matches);
        setUsers(matches.map(match => match.user));
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [currentUserProfile, isAuthenticated, navigate]);

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
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-3xl font-extrabold mb-1 text-primary-700">Smart Matching Algorithm 🎯</h1>
        <p className="text-lg text-gray-600">Find your perfect flatmate using our advanced preference matching system.</p>
        <span className="block text-primary-600 font-semibold mt-2">{filteredMatchScores.length} matches found</span>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="inline-block px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-base font-semibold">💡 Icebreaker: {cyclingIcebreaker}</span>
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
        {paginatedMatchScores.map((match, idx) => {
          const user = match.user;
          const isOnline = user.online && user.lastActive && (Date.now() - user.lastActive < 2 * 60 * 1000);
          
          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl overflow-hidden shadow transition-shadow duration-300 relative group border border-rose-200 hover:border-rose-400 cursor-pointer p-0"
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both', minHeight: 340 }}
            >
              {/* Match Score Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-1 rounded-full text-base font-bold border-2 border-white shadow">
                  {match.score}% Match
                </div>
              </div>
            {/* User Avatar Section */}
              <div className="relative h-32 flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.userName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.currentTarget.src = '/images/default-avatar.png'; }}
                  />
                ) : user.userName ? (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-500 text-white text-3xl font-bold border-4 border-white shadow group-hover:scale-105 transition-transform duration-300">
                    {getInitials(user.userName)}
                  </div>
                ) : (
                  <img
                    src="/images/default-avatar.png"
                    alt="Default avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                  {/* Online status dot */}
                  <span
                  className={`absolute bottom-4 right-8 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
              </div>
              {/* User Info Section */}
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  {user.userName}
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full ml-2">{user.profession}</span>
                </h3>
                    {user.city && (
                  <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                    {user.city}{user.locality ? `, ${user.locality}` : ''}
                  </div>
                )}
                <div className="flex items-center text-gray-600 text-sm">
                  <Phone className="w-4 h-4 mr-1" />
                  {user.userPhoneNumber ? `+91 ${user.userPhoneNumber}` : 'N/A'}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Star className="w-4 h-4 mr-1" />
                  {user.age} years
                  </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Heart className="w-4 h-4 mr-1" />
                  {user.gender}
                  </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.preferences.length > 0 ? user.preferences.map(pref => (
                    <span key={pref} className="px-2 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold border border-rose-200">{pref}</span>
                  )) : <span className="text-xs text-gray-400">No preferences</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openProfileModal(user)}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-rose-600 hover:to-pink-600 transition-colors duration-200"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => openCompatibilityModal(user)}
                    className="flex-1 bg-white border border-rose-500 text-rose-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors duration-200"
                  >
                    Compatibility
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-white shadow border border-primary-100">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'}`}
            >
              Previous
            </button>
            <span className="text-gray-700 text-base font-medium">
              Page <span className="text-primary-600 font-bold">{currentPage}</span> of <span className="text-primary-600 font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProfileModal user={selectedUser} open={showProfileModal} onClose={closeProfileModal} />
      <CompatibilityModal user={selectedUser} open={showCompatibilityModal} onClose={closeCompatibilityModal} insights={compatibilityInsights} />
      <EmojiBurst show={showProfileModal || showCompatibilityModal} />
    </div>
  );
};

export default FindFriendsPage;