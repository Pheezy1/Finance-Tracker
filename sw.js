const CACHE_NAME = 'finance-tracker-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json'
];

// Installs design resources right inside the phone's hardware cache memory
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Intercepts smartphone networks to load layout structures instantly without network latency
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
