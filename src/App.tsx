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
import ForLandlordsPage from './pages/ForLandlordsPage';
import AboutUsPage from './pages/AboutUsPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AppContextProvider } from './context/AppContext';
import { checkForUpdates } from './utils/cacheUtils';

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
      { path: 'for-landlords', element: <ForLandlordsPage /> },
      { path: 'about-us', element: <AboutUsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'add-listing', element: <AddListingPage /> },
      { path: 'edit-listing/:listingType/:listingId', element: <EditListingPage /> },
      { path: 'saved', element: <SavedPage /> },
      { path: 'users', element: <FindFriendsPage /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'card-demo', element: <CardDemoPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'refund-policy', element: <RefundPolicyPage /> },
      { path: 'terms-and-conditions', element: <TermsAndConditionsPage /> },
    ]
  }
]);

function App() {
  useEffect(() => {
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