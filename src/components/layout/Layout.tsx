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
  
  // Show loading spinner while context is initializing
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <PageViewTracker />
      <Navbar />
      <main className="flex-grow pt-16 pb-24 md:pb-0"> {/* Add bottom padding for mobile nav */}
        <Outlet />
      </main>
      {location.pathname !== '/' && <Footer />}
      <MobileNav />
      <PWAInstallPrompt />
      {showPreferences && <PreferencesModal onClose={handleClosePreferences} />}
    </div>
  );
};

export default Layout;