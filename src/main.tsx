import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
    <App />
  </StrictMode>
);