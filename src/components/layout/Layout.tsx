import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import PreferencesModal from '../modals/PreferencesModal';
import PWAInstallPrompt from '../ui/PWAInstallPrompt';
import { useAppContext } from '../../context/AppContext';
import PageViewTracker from '../PageViewTracker';

const Layout = () => {
  const { showPreferences } = useAppContext();
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <PageViewTracker />
      <Navbar />
      <main className="flex-grow pt-16"> {/* Add top padding to account for fixed navbar */}
        <Outlet />
      </main>
      {location.pathname !== '/' && <Footer />}
      <MobileNav />
      <PWAInstallPrompt />
      {showPreferences && <PreferencesModal />}
    </div>
  );
};

export default Layout;