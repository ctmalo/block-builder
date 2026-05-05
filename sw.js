// ── Block Builder Service Worker ──
// Caches the app shell for offline use. Cache is versioned so updates
// bust stale content automatically.

const CACHE_NAME = 'block-builder-v1';

// Files to pre-cache on install
const PRECACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// ── Install: pre-cache app shell ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets reliably; external CDN assets best-effort
      return cache.addAll(['./index.html', './manifest.json', './icon-192.png', './icon-512.png'])
        .then(() => cache.addAll(PRECACHE.filter(u => u.startsWith('http'))).catch(() => {}));
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for API calls, cache-first for app shell ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go network-first for Supabase API calls (live data)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.io')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response('{"error":"offline"}', {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Cache-first for everything else (app shell, fonts, CDN scripts)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
