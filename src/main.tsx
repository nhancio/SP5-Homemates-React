import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppContextProvider } from './context/AppContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Add global test function for debugging
declare global {
  interface Window {
    testMarkets: () => Promise<any>
  }
}


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

window.addEventListener('error', function (e) {
  console.error('Global error:', e.error || e.message);
});
window.addEventListener('unhandledrejection', function (e) {
  console.error('Unhandled promise rejection:', e.reason);
});

createRoot(rootElement).render(
  <StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </StrictMode>
);