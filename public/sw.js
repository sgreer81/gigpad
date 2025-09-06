// Service Worker for Live Guitar Performance App
const CACHE_NAME = 'guitar-performer-v2'; // Increment version to force cache update
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/songs/songs.json',
  '/data/setlists/setlists.json',
  '/data/loops/loops.json'
];

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  if (isDevelopment) {
    console.log('Development mode - skipping aggressive caching');
    self.skipWaiting();
    return;
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // In development mode, always fetch from network for JS/CSS/HTML
  if (isDevelopment) {
    const url = new URL(event.request.url);
    const isAsset = url.pathname.endsWith('.js') || 
                   url.pathname.endsWith('.css') || 
                   url.pathname.endsWith('.html') ||
                   url.pathname === '/';
    
    if (isAsset) {
      console.log('Development mode - bypassing cache for:', event.request.url);
      event.respondWith(fetch(event.request));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // In development, always check network first for data files
        if (isDevelopment && event.request.url.includes('/data/')) {
          console.log('Development mode - fetching fresh data:', event.request.url);
          return fetch(event.request).catch(() => cachedResponse);
        }

        if (cachedResponse) {
          console.log('Serving from cache:', event.request.url);
          return cachedResponse;
        }

        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Don't cache in development mode
            if (isDevelopment) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            
            // Return a custom offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for future features
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Future: sync setlist changes, song updates, etc.
      Promise.resolve()
    );
  }
});

// Push notifications for future features
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Guitar Performer', options)
  );
});
