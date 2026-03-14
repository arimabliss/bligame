/**
 * OPEN WORLD — Service Worker
 * Handles offline caching and PWA installation support.
 */

const CACHE_NAME    = 'openworld-v1.0.0';
const RUNTIME_CACHE = 'openworld-runtime-v1';

/* ── Assets to pre-cache on install ─────────────────────────── */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  /* MapLibre GL (served from CDN, cached at runtime) */
];

/* ── Install event: pre-cache core assets ────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate event: clear old caches ───────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map(key  => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

/* ── Fetch event: network-first strategy ─────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Skip non-GET and cross-origin tile/API requests (let them go to network) */
  if (event.request.method !== 'GET') return;

  /* Strategy: stale-while-revalidate for CDN assets */
  if (
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
    return;
  }

  /* Strategy: network-first for map tiles and API */
  if (
    url.hostname.includes('maptiler.com') ||
    url.hostname.includes('nominatim.openstreetmap.org') ||
    url.hostname.includes('openstreetmap.org')
  ) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  /* Strategy: cache-first for app shell */
  event.respondWith(cacheFirst(event.request, CACHE_NAME));
});

/* ── Cache Strategies ────────────────────────────────────────── */

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — content not cached', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

/* ── Push Notifications (placeholder) ───────────────────────── */
self.addEventListener('push', event => {
  const data  = event.data?.json() ?? {};
  const title = data.title || 'OPEN WORLD';
  const opts  = {
    body: data.body || 'New event in your world',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});
