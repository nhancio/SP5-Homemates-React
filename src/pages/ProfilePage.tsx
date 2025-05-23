import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Award, Settings, LogOut, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ProfilePage = () => {
  const { user, isAuthenticated, login, logout } = useAppContext();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'My Profile | Homemates';
  }, []);

  // Simulate a user if none is authenticated
  const profileUser = user || {
    id: 'mock-user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    isPremium: false
  };

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUpgradePopup(true);
    setTimeout(() => setShowUpgradePopup(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view your profile and saved properties
            </p>
            <button 
              onClick={() => login()}
              className="flex items-center justify-center w-full btn btn-primary"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="container">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image - Reduced height from h-48 to h-32 */}
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start -mt-16 mb-4 md:mb-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white p-2">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-16 h-16 text-primary-600" />
                      </div>
                    )}
                  </div>
                  {profileUser.isPremium && (
                    <div className="absolute -right-2 -bottom-2 bg-accent-500 text-white p-1 rounded-full">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* User Info */}
              <div className="md:ml-6 text-center md:text-left flex-grow">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                  <button 
                    onClick={logout}
                    className="btn btn-primary mt-4 md:mt-0 px-12 text-lg font-medium"
                  >
                    Logout
                  </button>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="flex items-center justify-center md:justify-start text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {profileUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Membership Status */}
        {!profileUser.isPremium && (
          <div className="mt-8 bg-gradient-to-r from-accent-500 to-amber-500 text-white rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
                <p className="mb-4 md:mb-0">
                  Get exclusive access to premium listings, priority support, and more!
                </p>
              </div>
              <button
                onClick={handleUpgradeClick}
                className="bg-white text-accent-600 hover:bg-gray-100 px-6 py-2 rounded-md font-medium transition"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
        
        {showUpgradePopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-4 relative">
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
              <p className="text-gray-600">
                We are curating amazing experiences for you, please stay tuned!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;