import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Heart, User, Home, Building2, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, login, loginError, clearLoginError } = useAppContext();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogin = async () => {
    clearLoginError(); // Clear any previous errors
    await login();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-nav">
      <div className="container py-3">
        <div className="flex items-center justify-between">
            {/* Left side: Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/images/homemates-logo.jpeg"
                alt="Homemates Logo" 
                className="h-8 w-8"
              />
              <span className="text-lg md:text-xl font-bold text-primary-600">Homemates</span>
            </Link>
          </div>

          {/* Right side: Login/Nav Links */}
          <div className="flex items-center">
            {/* Mobile Login Button */}
            {!isAuthenticated && (
              <div className="md:hidden relative">
                <button 
                  onClick={handleLogin}
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 min-h-[44px] shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Login</span>
                </button>
                {loginError && (
                  <div className="absolute top-full left-0 right-0 mt-1 px-2 z-50">
                    <p className="text-red-600 text-xs font-bold bg-red-100 border border-red-200 rounded px-2 py-1 w-full" aria-live="polite">
                      {loginError}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <Link 
                to="/" 
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/') 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              
              <div className="relative">
                <Link 
                  to="/add-listing" 
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                    isActive('/add-listing') 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Post</span>
                </Link>
                {/* FREE Tag */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                  FREE
                </div>
              </div>
              
              <Link 
                to="/saved" 
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/saved') 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>Saved</span>
              </Link>
              
              {isAuthenticated ? (
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                    isActive('/profile') 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              ) : (
                <div className="relative">
                  <button 
                    onClick={handleLogin}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold min-h-[44px] shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                  {loginError && (
                    <div className="absolute top-full left-0 right-0 mt-1 px-2 z-50">
                      <p className="text-red-600 text-xs font-bold bg-red-100 border border-red-200 rounded px-2 py-1 w-full" aria-live="polite">
                        {loginError}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;