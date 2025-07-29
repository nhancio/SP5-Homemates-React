import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { Phone, MessageCircle, MapPin, User, Briefcase, Heart, Filter, CheckCircle, Circle } from 'lucide-react';
import AIQueryBox from '../components/ai/AIQueryBox';
import ChatModal from '../components/modals/ChatModal';
import { getConversations, markConversationAsRead, ChatConversation, subscribeToConversations, requestNotificationPermission } from '../services/chat';

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
  const { user } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showChatSidebar, setShowChatSidebar] = useState(false); // Start hidden on mobile

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user's gender for filtering
        const currentUserGender = user?.gender || '';
        
        // Fetch all users first
        const snapshot = await getDocs(collection(db, 'u'));
        let usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        // Apply gender-based filtering
        if (currentUserGender) {
          usersData = usersData.filter(u => {
            const userGender = (u as any).gender || '';
            // Males can only see males, females can only see females
            return userGender.toLowerCase() === currentUserGender.toLowerCase();
          });
        }
        
        // Filter out current user
        usersData = usersData.filter(u => u.id !== user?.id);
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

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
    if (filters.locality) {
      filtered = filtered.filter(u => (u.locality || u.address?.locality || '').toLowerCase().includes(filters.locality.toLowerCase()));
    }
    if (filters.profession) {
      filtered = filtered.filter(u => (u.profession || '').toLowerCase().includes(filters.profession.toLowerCase()));
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
    if (filters.preferences) {
      const preferences = Array.isArray(filters.preferences) ? filters.preferences : String(filters.preferences).split(',');
      filtered = filtered.filter(u =>
        preferences.some((pref: string) => (u.preferences || '').toLowerCase().includes(pref.toLowerCase()))
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

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('Phone number not available');
    }
  };

  const handleWhatsApp = (phoneNumber: string, userName: string) => {
    if (phoneNumber) {
      const message = `Hey ${userName}! I found you on Homemates and would like to connect.`;
      const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      alert('Phone number not available');
    }
  };

  const handleChat = (userData: any) => {
    setSelectedUser(userData);
    setChatModalOpen(true);
  };

  // Function to refresh conversations immediately
  const refreshConversations = async () => {
    try {
      // Completely rebuild conversations from messages to remove all duplicates
      const allMessages = JSON.parse(localStorage.getItem('homemates_chat_messages') || '[]');
      const userId = user?.id;
      
      if (userId && allMessages.length > 0) {
        // Group messages by conversation
        const conversationMap = new Map();
        
        allMessages.forEach((msg: any) => {
          if (msg.senderId === userId || msg.recipientId === userId) {
            const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
            const conversationId = [userId, otherUserId].sort().join('_');
            
            if (!conversationMap.has(conversationId)) {
              conversationMap.set(conversationId, {
                id: conversationId,
                participants: [userId, otherUserId].sort(),
                lastMessage: msg.text,
                lastMessageTime: new Date(msg.timestamp),
                lastMessageSenderId: msg.senderId,
                unreadCount: msg.senderId === userId ? 0 : 1,
                isRead: msg.senderId === userId,
              });
            } else {
              const existing = conversationMap.get(conversationId);
              if (new Date(msg.timestamp) > existing.lastMessageTime) {
                existing.lastMessage = msg.text;
                existing.lastMessageTime = new Date(msg.timestamp);
                existing.lastMessageSenderId = msg.senderId;
                existing.unreadCount = msg.senderId === userId ? 0 : 1;
                existing.isRead = msg.senderId === userId;
              }
            }
          }
        });
        
        // Save unique conversations back to localStorage
        const uniqueConversations = Array.from(conversationMap.values());
        localStorage.setItem('homemates_chat_conversations', JSON.stringify(uniqueConversations));
      }
      
      const conversations = await getConversations(user?.id || '');
      setRecentChats(conversations);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  // Close chat modal
  const handleCloseChat = () => {
    setChatModalOpen(false);
    setSelectedUser(null);
    // Real-time subscription will automatically update conversations
  };



  // Real conversations - starts empty and gets populated as users chat
  const [recentChats, setRecentChats] = useState<ChatConversation[]>([]);

  // Load conversations and subscribe to real-time updates when component mounts
  useEffect(() => {
    if (user) {
      const loadConversations = async () => {
        try {
          const conversations = await getConversations(user.id || '');
          setRecentChats(conversations);
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      };
      loadConversations();

      // Subscribe to real-time conversation updates with automatic deduplication (like WhatsApp)
      const unsubscribe = subscribeToConversations(user.id || '', (updatedConversations) => {
        // Remove duplicates automatically
        const uniqueConversations = updatedConversations.reduce((acc: any[], conv: any) => {
          const existingIndex = acc.findIndex(existing => existing.id === conv.id);
          if (existingIndex >= 0) {
            // Keep the most recent one
            if (new Date(conv.lastMessageTime) > new Date(acc[existingIndex].lastMessageTime)) {
              acc[existingIndex] = conv;
            }
          } else {
            acc.push(conv);
          }
          return acc;
        }, []);
        
        setRecentChats(uniqueConversations);
      });

      // Request notification permission
      requestNotificationPermission();

      // Cleanup subscription when component unmounts
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const handleChatSelect = async (conversation: ChatConversation) => {
    // Find the other participant (not current user)
    const otherParticipantId = conversation.participants.find(id => id !== user?.id);
    
    if (otherParticipantId) {
      // Find the user data for the other participant
      const otherUser = filteredUsers.find(u => u.id === otherParticipantId);
      
      if (otherUser) {
        setSelectedUser(otherUser);
        setChatModalOpen(true);
        
        // Mark conversation as read
        if (conversation.unreadCount > 0) {
          // Create conversation ID from participants
          const conversationId = conversation.participants.sort().join('_');
          await markConversationAsRead(conversationId);
          const updatedChats = recentChats.map(c => 
            c.id === conversation.id ? { ...c, unreadCount: 0, isRead: true } : c
          );
          setRecentChats(updatedChats);
        }
      }
    }
  };

  const filteredChats = recentChats.filter(chat => {
    if (chatFilter === 'unread') return chat.unreadCount > 0;
    if (chatFilter === 'read') return chat.unreadCount === 0;
    return true; // 'all'
  });

  const formatTime = (date: Date) => {
    try {
      // Ensure date is a Date object
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diffInMs = now.getTime() - dateObj.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      const diffInHours = diffInMinutes / 60;
      const diffInDays = diffInHours / 24;
      
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInDays < 7) {
        return `${Math.floor(diffInDays)}d ago`;
      } else {
        return dateObj.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Just now';
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
        
        <div className="flex gap-8 relative">
          {/* Main Content */}
          <div className="flex-1 lg:pr-4">
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
            // Simulate realistic online status (most users are offline by default)
            const isOnline = user.isOnline || false; // Most users are offline
            

            
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
                    <button
                      onClick={() => handleChat(user)}
                      className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-pink-200 relative"
                      title="In-App Chat"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {isOnline && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </button>
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
        
        {/* Mobile Backdrop */}
        {showChatSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowChatSidebar(false)}
          />
        )}

        {/* Mobile Toggle Button - Only on Mobile */}
        <button
          onClick={() => setShowChatSidebar(!showChatSidebar)}
          className="lg:hidden fixed top-4 right-4 z-50 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Recent Chats Sidebar - Responsive */}
        <div className={`fixed top-0 right-0 h-full bg-white shadow-xl border border-gray-200 p-6 transition-transform duration-300 ease-in-out z-40 ${
          showChatSidebar ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 lg:fixed lg:right-4 lg:top-20 lg:w-80 lg:h-[calc(100vh-120px)] lg:rounded-2xl lg:shadow-xl lg:overflow-hidden`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Chats</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChatSidebar(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setChatFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chatFilter === 'all'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setChatFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chatFilter === 'unread'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setChatFilter('read')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chatFilter === 'read'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>
          
          {/* Chat List */}
          <div className="space-y-3 h-[calc(100%-120px)] overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start chatting to see conversations here</p>
              </div>
            ) : (
              filteredChats.map((conversation) => {
                // Find the other participant (not current user)
                const otherParticipantId = conversation.participants.find(id => id !== user?.id);
                const otherUser = filteredUsers.find(u => u.id === otherParticipantId);
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleChatSelect(conversation)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 border ${
                      selectedUser?.id === otherUser?.id ? 'bg-primary-50 border-primary-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {otherUser?.photoURL && otherUser.photoURL !== '/images/default-avatar.png' ? (
                          <img
                            src={otherUser.photoURL}
                            alt={otherUser.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold text-sm">{getInitials(otherUser?.name || 'U')}</span>
                          </div>
                        )}
                        {otherUser?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{otherUser?.name || 'Unknown User'}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Show read status based on who sent the last message */}
                            {(() => {
                              // Check if the last message was sent by the current user
                              const lastMessageFromCurrentUser = conversation.lastMessageSenderId === user?.id;
                              
                              return lastMessageFromCurrentUser ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : conversation.unreadCount > 0 ? (
                                <Circle className="w-3 h-3 text-gray-400" />
                              ) : (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              );
                            })()}
                            <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(conversation.lastMessageTime)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-600 truncate flex-1 mr-2">{conversation.lastMessage}</p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center flex-shrink-0">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      {selectedUser && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={handleCloseChat}
          recipient={{
            id: selectedUser.id,
            name: selectedUser.name || selectedUser.userName || 'Unknown User',
            photoURL: selectedUser.photoURL || selectedUser.avatarUrl,
            isOnline: selectedUser.isOnline || false,
          }}
          currentUser={{
            id: user?.id || '',
            name: user?.name || '',
          }}
          onMessageSent={refreshConversations}
        />
      )}
    </div>
  );
};

export default FindFriendsPage;