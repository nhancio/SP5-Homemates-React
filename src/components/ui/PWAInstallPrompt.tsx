import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[4.5rem] w-[90%] max-w-sm mx-auto bg-white rounded-lg shadow-lg p-3 z-50 flex items-center">
      <Download className="w-4 h-4 text-primary-600 mr-2" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold">Install Homemates App</h3>
        <p className="text-xs text-gray-600">For a better experience</p>
      </div>
      <button
        onClick={handleInstall}
        className="btn btn-primary btn-sm whitespace-nowrap ml-2"
      >
        Install
      </button>
      <button 
        onClick={() => setShowPrompt(false)}
        className="ml-1 p-1 text-gray-500 hover:text-gray-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
