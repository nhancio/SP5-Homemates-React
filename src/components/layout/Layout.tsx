import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import PreferencesModal from '../modals/PreferencesModal';
import PWAInstallPrompt from '../ui/PWAInstallPrompt';
import { useAppContext } from '../../context/AppContext';
import PageViewTracker from '../PageViewTracker';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Force scroll to top on every route change
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Also ensure the document body scrolls to top
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [pathname]);
  return null;
}

const Layout = () => {
  const { showPreferences, setShowPreferences, isLoading } = useAppContext();
  const location = useLocation();
  
  const handleClosePreferences = () => {
    setShowPreferences(false);
  };
  
  // Show homepage with subtle loading indicator instead of blocking
  // This ensures users can always see content even if auth is slow
  
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <PageViewTracker />
      <Navbar />
      {/* Subtle loading indicator at top if still loading */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
          <div className="h-full bg-gradient-to-r from-primary-600 to-pink-600 animate-pulse" style={{ width: '30%' }}></div>
        </div>
      )}
      <main className="flex-grow pt-16 pb-24 lg:pb-0"> {/* Bottom padding only on small screens */}
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <PWAInstallPrompt />
      {showPreferences && <PreferencesModal onClose={handleClosePreferences} />}
    </div>
  );
};

export default Layout;