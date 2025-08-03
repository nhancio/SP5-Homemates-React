import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BuyPropertiesPage from './pages/BuyPropertiesPage';
import RentPropertiesPage from './pages/RentPropertiesPage';
import HomeServicesPage from './pages/HomeServicesPage';
import ProfilePage from './pages/ProfilePage';
import AddListingPage from './pages/AddListingPage';
import EditListingPage from './pages/EditListingPage';
import SavedPage from './pages/SavedPage';
import FindFriendsPage from './pages/FindFriendsPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import PaymentPage from './pages/PaymentPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import CardDemoPage from './pages/CardDemoPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AppContextProvider } from './context/AppContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'buy',
        children: [
          { index: true, element: <BuyPropertiesPage /> },
          { path: ':propertyId', element: <PropertyDetailsPage /> }
        ]
      },
      {
        path: 'rent',
        children: [
          { index: true, element: <RentPropertiesPage /> },
          { path: ':propertyId', element: <PropertyDetailsPage /> }
        ]
      },
      { path: 'services', element: <HomeServicesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'add-listing', element: <AddListingPage /> },
      { path: 'edit-listing/:listingType/:listingId', element: <EditListingPage /> },
      { path: 'saved', element: <SavedPage /> },
      { path: 'users', element: <FindFriendsPage /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'card-demo', element: <CardDemoPage /> },
      { path: 'privacy_policy', element: <PrivacyPolicyPage /> },
      { path: 'refund_policy', element: <RefundPolicyPage /> },
      { path: 'TandC', element: <TermsAndConditionsPage /> },
    ]
  }
]);

function App() {
  useEffect(() => {
    // Enhanced cache-busting mechanism
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        const data = await response.json();
        
        const currentVersion = localStorage.getItem('appVersion');
        const currentBuildId = localStorage.getItem('appBuildId');
        
        // Check if version or build ID has changed
        if (currentVersion && (currentVersion !== data.version || currentBuildId !== data.buildId)) {
          console.log('New version detected, reloading...');
          localStorage.setItem('appVersion', data.version);
          localStorage.setItem('appBuildId', data.buildId);
          localStorage.setItem('lastUpdateCheck', Date.now().toString());
          window.location.reload();
        } else {
          localStorage.setItem('appVersion', data.version);
          localStorage.setItem('appBuildId', data.buildId);
          localStorage.setItem('lastUpdateCheck', Date.now().toString());
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // Check for updates on app start
    checkForUpdates();

    // Set up periodic update checks (every 5 minutes)
    const updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(updateInterval);
  }, []);

  return (
    <AppContextProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AppContextProvider>
  );
}

export default App;