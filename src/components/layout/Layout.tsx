import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import PreferencesModal from '../modals/PreferencesModal';
import PWAInstallPrompt from '../ui/PWAInstallPrompt';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const { showPreferences } = useAppContext();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <PWAInstallPrompt />
      {showPreferences && <PreferencesModal />}
    </div>
  );
};

export default Layout;