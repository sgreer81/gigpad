// Utility script to clear service worker and caches for development
// Usage: Add ?clear-sw to URL or run in console: loadScript('/clear-sw.js')

(async function clearServiceWorker() {
  console.log('🧹 Clearing Service Worker and Caches...');
  
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('Unregistering SW:', registration.scope);
        await registration.unregister();
      }
    }
    
    // Clear all caches
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      console.log('Deleting cache:', cacheName);
      await caches.delete(cacheName);
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Service Worker and caches cleared successfully!');
    console.log('🔄 Reloading page...');
    
    // Reload the page
    window.location.reload(true);
    
  } catch (error) {
    console.error('❌ Error clearing service worker:', error);
  }
})();

// Auto-run if ?clear-sw is in URL
if (window.location.search.includes('clear-sw')) {
  console.log('Auto-clearing service worker due to URL parameter');
}
