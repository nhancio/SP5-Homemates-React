import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Heart, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const MobileNav = () => {
  const location = useLocation();
  const { isAuthenticated, login } = useAppContext();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-4 h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center ${
            isActive('/') ? 'text-primary-600' : 'text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/add-listing" 
          className={`flex flex-col items-center justify-center ${
            isActive('/add-listing') ? 'text-primary-600' : 'text-gray-600'
          }`}
        >
          <PlusSquare className="w-6 h-6" />
          <span className="text-xs mt-1">Add</span>
        </Link>
        
        <Link 
          to="/saved" 
          className={`flex flex-col items-center justify-center ${
            isActive('/saved') ? 'text-primary-600' : 'text-gray-600'
          }`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Saved</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center ${
            isActive('/profile') ? 'text-primary-600' : 'text-gray-600'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;