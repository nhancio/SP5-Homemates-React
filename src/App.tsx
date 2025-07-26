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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import CardDemoPage from './pages/CardDemoPage';
import ErrorBoundary from './components/ErrorBoundary';

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
      { path: 'card-demo', element: <CardDemoPage /> },
      { path: 'privacy_policy', element: <PrivacyPolicyPage /> },
      { path: 'refund_policy', element: <RefundPolicyPage /> },
      { path: 'TandC', element: <TermsAndConditionsPage /> },
    ]
  }
]);

function App() {
  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(data => {
        const currentVersion = localStorage.getItem('appVersion');
        if (currentVersion && currentVersion !== data.version) {
          localStorage.setItem('appVersion', data.version);
          window.location.reload();
        } else {
          localStorage.setItem('appVersion', data.version);
        }
      });
  }, []);
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;