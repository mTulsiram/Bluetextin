/* Service Worker - Enables offline support */

const CACHE_NAME = 'bluetext-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/config.css',
  '/assets/css/reset.css',
  '/assets/css/header.css',
  '/assets/css/footer.css',
  '/assets/css/layout.css',
  '/assets/js/config.js',
  '/assets/js/theme.js',
  '/assets/js/auth.js',
  '/assets/js/nav.js',
  '/assets/js/app.js',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // It's OK if some resources fail to cache
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((response) => {
          return response || new Response('Offline - resource not cached', { status: 503 });
        });
      })
  );
});
