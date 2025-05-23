import React, { useEffect, useState } from 'react';
import { User, Briefcase, Loader, Phone, MessageCircle } from 'lucide-react';
import { getUsers, UserProfile } from '../services/users';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const FindFriendsPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, isAuthenticated, login } = useAppContext();
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
      if (!isAuthenticated) {
        navigate('/profile');
        return;
      }

      try {
        setIsLoading(true);
        const data = await getUsers();
        console.log('Users data:', data);
        setUsers(data.filter(u => u.id !== currentUser?.id));
      } catch (err) {
        console.error('Error loading users:', err);
        setError(err instanceof Error ? err.message : 'Unable to load users at this time');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [currentUser?.id, isAuthenticated, navigate]);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Find Friends</h1>
        <span className="text-gray-600">{users.length} users found</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg overflow-hidden shadow-property-card hover:shadow-lg transition-shadow duration-300">
            {/* User Avatar Section */}
            <div className="relative h-40 bg-primary-50">
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="w-24 h-24 text-primary-200" />
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
      </div>
    </div>
  );
};

export default FindFriendsPage;
