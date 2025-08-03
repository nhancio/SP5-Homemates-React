// Cache management utilities
export const clearAppCache = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear service worker cache if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
  
  // Force reload
  window.location.reload();
};

export const forceUpdate = () => {
  // Clear version cache
  localStorage.removeItem('appVersion');
  localStorage.removeItem('appBuildId');
  localStorage.removeItem('lastUpdateCheck');
  
  // Reload the page
  window.location.reload();
};

export const checkForUpdates = async () => {
  try {
    const response = await fetch('/version.json?t=' + Date.now());
    const data = await response.json();
    
    const currentVersion = localStorage.getItem('appVersion');
    const currentBuildId = localStorage.getItem('appBuildId');
    
    if (currentVersion && (currentVersion !== data.version || currentBuildId !== data.buildId)) {
      console.log('New version detected, reloading...');
      localStorage.setItem('appVersion', data.version);
      localStorage.setItem('appBuildId', data.buildId);
      localStorage.setItem('lastUpdateCheck', Date.now().toString());
      window.location.reload();
      return true;
    } else {
      localStorage.setItem('appVersion', data.version);
      localStorage.setItem('appBuildId', data.buildId);
      localStorage.setItem('lastUpdateCheck', Date.now().toString());
      return false;
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return false;
  }
}; 