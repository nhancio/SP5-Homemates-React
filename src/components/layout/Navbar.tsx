import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusSquare, Heart, User, Home, Building } from 'lucide-react';
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
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
                >
                  <User className="w-4 h-4" />
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
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link 
                to="/" 
                className={`flex items-center space-x-2 transition-colors ${
                  isActive('/') ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              {/* <Link
                to="/rent" 
                className={`flex items-center space-x-2 transition-colors ${
                  isActive('/rent') ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Building className="w-5 h-5" />
                <span className="font-medium">Shared Homes</span>
              </Link> */}
              <Link 
                to="/add-listing" 
                className={`flex items-center space-x-2 transition-colors ${
                  isActive('/add-listing') ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <PlusSquare className="w-5 h-5" />
                <span className="font-medium">Post</span>
              </Link>
              <Link 
                to="/saved" 
                className={`flex items-center space-x-2 transition-colors ${
                  isActive('/saved') ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Saved</span>
              </Link>
              {isAuthenticated ? (
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 transition-colors ${
                    isActive('/profile') ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
              ) : (
                <div className="relative">
                  <button 
                    onClick={handleLogin}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium min-h-[44px]"
                  >
                    <User className="w-5 h-5" />
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