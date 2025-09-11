/* PWA Service Worker
  - Avoids caching Next.js dynamic dev chunks (/_next/*) that caused chunk load errors
  - Network-first for navigation & API; cache-first for immutable hashed assets
*/
const VERSION = 'v7';
const APP_SHELL_CACHE = `glp-shell-${VERSION}`;
const STATIC_CACHE = `glp-static-${VERSION}`;
const DATA_CACHE = `glp-data-${VERSION}`;
const CORE_ASSETS = [ 
  '/', 
  '/manifest.json', 
  '/logo.png', 
  '/offline.html',
  '/favicon.ico'
];

// IndexedDB helpers for storing JSON payloads (subjects, quizzes, streak etc.)
const DB_NAME = 'glp-offline';
const DB_VERSION = 1;
const STORE_JSON = 'json';

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_JSON)) db.createObjectStore(STORE_JSON);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key, value) {
  try {
    const db = await idbOpen();
    const tx = db.transaction(STORE_JSON, 'readwrite');
    tx.objectStore(STORE_JSON).put(value, key);
    return tx.complete;
  } catch {}
}

async function idbGet(key) {
  try {
    const db = await idbOpen();
    const tx = db.transaction(STORE_JSON, 'readonly');
    return await new Promise((res, rej) => {
      const r = tx.objectStore(STORE_JSON).get(key);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  } catch { return null; }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.addAll(CORE_ASSETS);
      // Pre-cache key app routes for better offline experience
      try {
        await cache.add('/student');
        await cache.add('/teacher');
        await cache.add('/subjects');
        console.log('[SW] Pre-cached app routes');
      } catch (e) {
        console.log('[SW] Could not pre-cache routes (server may be down)');
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
  await Promise.all(keys.filter(k => ![APP_SHELL_CACHE, STATIC_CACHE, DATA_CACHE].includes(k)).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Handle Next.js chunks - improved error handling and fallbacks
  if (url.pathname.startsWith('/_next/') && url.hostname === self.location.hostname) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          // Cache successful chunks for offline use
          if (res.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, res.clone());
          }
          return res;
        } catch (err) {
          console.log('[SW] Chunk fetch failed:', url.pathname);
          // Try cached version first
          const cached = await caches.match(request);
          if (cached) {
            console.log('[SW] Serving cached chunk:', url.pathname);
            return cached;
          }
          
          // For JS chunks, return a more robust fallback
          if (url.pathname.endsWith('.js')) {
            console.log('[SW] Creating JS fallback for:', url.pathname);
            const fallbackJS = `
              console.warn('Chunk unavailable offline: ${url.pathname}');
              // Export empty module to prevent import errors
              if (typeof module !== 'undefined' && module.exports) {
                module.exports = {};
              }
              if (typeof window !== 'undefined') {
                window.__CHUNK_LOAD_ERROR__ = true;
              }
            `;
            return new Response(fallbackJS, {
              headers: { 
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-cache'
              }
            });
          }
          
          // For CSS chunks
          if (url.pathname.endsWith('.css')) {
            console.log('[SW] Creating CSS fallback for:', url.pathname);
            return new Response('/* Offline: chunk styles unavailable */', {
              headers: { 
                'Content-Type': 'text/css',
                'Cache-Control': 'no-cache'
              }
            });
          }
          
          // For other assets, throw to trigger normal error handling
          throw err;
        }
      })()
    );
    return;
  }

  // API & data endpoints: network-first with fallback to cache / IndexedDB
  const isData = url.pathname.startsWith('/api/') || url.pathname.includes('/quiz') || url.pathname.includes('/streak') || url.pathname.startsWith('/subjects') || url.pathname.startsWith('/leaderboard');
  if (isData) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const clone = res.clone();
          const contentType = res.headers.get('content-type') || '';
          // Cache JSON separately and store payload in IndexedDB
          if (contentType.includes('application/json')) {
            try {
              const data = await clone.clone().json();
              idbPut(url.pathname + url.search, { data, ts: Date.now() });
            } catch {}
          }
          caches.open(DATA_CACHE).then(c => c.put(request, clone));
          return res;
        } catch (err) {
          // Try cache
          const cached = await caches.match(request) || await caches.match(request, { cacheName: DATA_CACHE });
          if (cached) return cached;
          // Try IndexedDB JSON -> build synthetic response
          const stored = await idbGet(url.pathname + url.search);
          if (stored) {
            return new Response(JSON.stringify(stored.data), { headers: { 'Content-Type': 'application/json', 'X-Offline': '1' } });
          }
          throw err;
        }
      })()
    );
    return;
  }

  // Navigation requests: serve cached pages when offline
  if (request.mode === 'navigate') {
    // Allow auth-related routes to bypass entirely (Clerk, OAuth callbacks)
    if (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up') || url.pathname.includes('oauth')) {
      return; // default browser fetch
    }
    event.respondWith((async () => {
      try {
        const res = await fetch(request, { cache: 'no-store' });
        // Cache successful HTML responses for offline access
        if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
          const cache = await caches.open(APP_SHELL_CACHE);
          cache.put(request, res.clone());
        }
        return res;
      } catch (e) {
        console.warn('[SW] Navigation fetch failed, checking cache:', url.href);
        
        // First try: exact page match
        const exactMatch = await caches.match(request);
        if (exactMatch) {
          console.log('[SW] Serving cached page:', url.pathname);
          return exactMatch;
        }
        
        // Second try: try without query params for dynamic routes
        const urlWithoutQuery = new URL(url.pathname, url.origin);
        const pageMatch = await caches.match(urlWithoutQuery.href);
        if (pageMatch) {
          console.log('[SW] Serving cached page (no query):', url.pathname);
          return pageMatch;
        }
        
        // Third try: for app routes like /student, /teacher, try to serve the main shell
        if (url.pathname !== '/' && !url.pathname.startsWith('/api/')) {
          const shell = await caches.match('/');
          if (shell) {
            console.log('[SW] Serving app shell for:', url.pathname);
            return shell;
          }
        }
        
        // Last resort: offline page
        console.log('[SW] Serving offline page for:', url.pathname);
        return caches.match('/offline.html');
      }
    })());
    return;
  }

  // Static assets (images, css, js, fonts) – cache-first
  if (['image', 'style', 'font', 'script'].includes(request.destination) || /\.(png|jpg|jpeg|gif|webp|svg|css|js|woff2?|ico)$/.test(url.pathname)) {
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
          // Return cached version or create fallback for common assets
          if (cached) return cached;
          // Fallback for missing images
          if (['image'].includes(request.destination) || /\.(png|jpg|jpeg|gif|webp|svg|ico)$/.test(url.pathname)) {
            return new Response(
              `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#ccc"><rect width="64" height="64" fill="#f0f0f0"/><text x="32" y="32" text-anchor="middle" dominant-baseline="middle" font-size="12">📚</text></svg>`,
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return cached;
        }
      })()
    );
    return;
  }
});

// Client message handler (optional future enhancements)
self.addEventListener('message', (event) => {
  if (event.data === 'clear-offline-cache') {
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('glp-')).map(k => caches.delete(k))));
  }
});
