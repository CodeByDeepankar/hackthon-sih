/* PWA Service Worker
  - Avoids caching Next.js dynamic dev chunks (/_next/*) that caused chunk load errors
  - Network-first for navigation & API; cache-first for immutable hashed assets
*/
const VERSION = 'v2';
const APP_SHELL_CACHE = `glp-shell-${VERSION}`;
const STATIC_CACHE = `glp-static-${VERSION}`;
const CORE_ASSETS = [ '/', '/manifest.json', '/logo.png', '/offline.html' ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => ![APP_SHELL_CACHE, STATIC_CACHE].includes(k)).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass everything under /_next during development to prevent stale chunk issues
  if (url.pathname.startsWith('/_next/') && url.hostname === self.location.hostname) {
    // For production we could cache immutable hashed files. For simplicity, let network handle.
    return; // allow default fetch
  }

  // API: network-first
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/quiz') || url.pathname.includes('/streak')) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        } catch (err) {
          const cached = await caches.match(request);
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }

  // Navigation requests: keep simple to avoid false offline during OAuth/login redirects
  if (request.mode === 'navigate') {
    // Allow auth-related routes to bypass entirely (Clerk, OAuth callbacks)
    if (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up')) {
      return; // default browser fetch
    }
    event.respondWith((async () => {
      try {
        const res = await fetch(request, { cache: 'no-store' });
        // Optionally cache only successful HTML responses
        if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
          const cache = await caches.open(APP_SHELL_CACHE);
          cache.put(request, res.clone());
        }
        return res;
      } catch (e) {
        // Provide diagnostic logging (visible in SW console)
        console.warn('[SW] Navigation fetch failed, serving offline fallback:', url.href, e);
        const cached = await caches.match(request);
        return cached || caches.match('/offline.html');
      }
    })());
    return;
  }

  // Static assets (images, css) – cache-first
  if (['image', 'style', 'font'].includes(request.destination) || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch (err) {
          return cached; // may be undefined
        }
      })()
    );
    return;
  }
});
