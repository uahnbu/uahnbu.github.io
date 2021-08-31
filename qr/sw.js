const STATIC_CACHE_NAME = 'v1';

const filesToCache = [
  'index.html',
  'scripts/index.js',
  'scripts/qcode-decoder.min.js',
  'scripts/qr-scanner-worker.min.js',
  'scripts/qr-scanner.min.js',
  'styles/fontawesome-solid.min.css',
  'styles/fontawesome.min.css',
  'styles/style.css',
  'webfonts/fa-solid-900.woff2'
];

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('Found', event.request.url, 'in cache');
        return response;
      }
      return fetch(event.request).then(response => {
        return caches.open(STATIC_CACHE_NAME).then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    })
  );
});

// Activate the SW
self.addEventListener('activate', event => {
  console.log('Activating new service worker...');
  const cacheAllowed = [STATIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheAllowed.indexOf(cacheName) === -1) {
          return caches.delete(cacheName);
        }
      })
    ))       
  );
});