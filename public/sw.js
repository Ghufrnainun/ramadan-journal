const STATIC_CACHE_NAME = 'myramadhanku-static-v2';
const RUNTIME_CACHE_NAME = 'myramadhanku-runtime-v2';
const OFFLINE_URL = '/offline.html';
const MAX_RUNTIME_ENTRIES = 40;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.svg',
  '/icon-512.svg',
  OFFLINE_URL,
];

const CACHEABLE_DESTINATIONS = new Set(['script', 'style', 'font', 'image']);

const isCacheableRequest = (request, requestUrl) => {
  if (request.method !== 'GET') return false;
  if (requestUrl.origin !== location.origin) return false;
  if (request.cache === 'no-store') return false;
  return CACHEABLE_DESTINATIONS.has(request.destination);
};

const trimRuntimeCache = async () => {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const keys = await cache.keys();

  if (keys.length <= MAX_RUNTIME_ENTRIES) return;

  const staleEntries = keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES);
  await Promise.all(staleEntries.map((entry) => cache.delete(entry)));
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const validCaches = new Set([STATIC_CACHE_NAME, RUNTIME_CACHE_NAME]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (validCaches.has(key) ? null : caches.delete(key)))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin && event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches
              .open(STATIC_CACHE_NAME)
              .then((cache) => cache.put('/index.html', responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedApp = await caches.match('/index.html');
          return cachedApp || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  if (!isCacheableRequest(event.request, requestUrl)) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);

      if (cached) {
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              if (!response.ok) return;
              const responseClone = response.clone();
              return cache.put(event.request, responseClone).then(trimRuntimeCache);
            })
            .catch(() => undefined)
        );
        return cached;
      }

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const responseClone = response.clone();
          event.waitUntil(
            cache.put(event.request, responseClone).then(trimRuntimeCache)
          );
        }
        return response;
      } catch {
        return cached || caches.match(OFFLINE_URL);
      }
    })
  );
});
