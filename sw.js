/**
 * Minimal service worker: cache-first for the app shell so it installs
 * and opens instantly (even offline); everything else (the Apps Script
 * API) goes straight to the network — writes need connectivity anyway,
 * and stale inventory data is more confusing than a clear "you're offline"
 * failure for this small a user base.
 */
const CACHE_NAME = 'hmalc-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/api.js',
  './js/router.js',
  './js/state.js',
  './js/views/login.js',
  './js/views/browse.js',
  './js/views/itemDetail.js',
  './js/views/myRequests.js',
  './js/views/profile.js',
  './js/views/adminItems.js',
  './js/views/adminCirculation.js',
  './js/views/adminRequests.js',
  './js/views/adminStaff.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache calls to the Apps Script backend — always hit the network.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
