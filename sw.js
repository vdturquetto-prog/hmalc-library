/**
 * Minimal service worker: network-first for the app shell's code
 * (HTML/CSS/JS) so a deployed fix is never stuck behind a stale cache —
 * only falls back to the cached copy if the network request fails
 * (actually offline). Icons rarely change, so those stay cache-first
 * for faster installs. Apps Script API calls are never cached.
 *
 * IMPORTANT: bump CACHE_NAME (v2 -> v3 -> ...) whenever you want to force
 * every installed copy to drop its old cache immediately, e.g. after a
 * bug like a stale api.js URL got cached before a fix shipped.
 */
const CACHE_NAME = 'hmalc-shell-v2';
const CACHE_FIRST_FILES = ['./icons/icon-192.png', './icons/icon-512.png'];
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

  const isCacheFirst = CACHE_FIRST_FILES.some((f) => event.request.url.endsWith(f.replace('./', '')));

  if (isCacheFirst) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Network-first for HTML/CSS/JS: always get the latest deployed code
  // when online, and only fall back to the cached shell if truly offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
