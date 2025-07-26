import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Heart, User } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden shadow-lg">
      <div className="grid grid-cols-4 h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        
        <Link 
          to="/add-listing" 
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            isActive('/add-listing') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
        >
          <PlusSquare className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Add</span>
        </Link>
        
        <Link 
          to="/saved" 
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            isActive('/saved') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
        >
          <Heart className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Saved</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            isActive('/profile') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;