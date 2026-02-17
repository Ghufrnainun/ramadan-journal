// Bump cache version to ensure clients pick up the latest frontend bundle.
const STATIC_CACHE_NAME = 'myramadhanku-static-v3';
const RUNTIME_CACHE_NAME = 'myramadhanku-runtime-v3';
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

// --- Push Notification via Service Worker ---
// Map of scheduled timer IDs keyed by reminder id to avoid duplicates.
const scheduledTimers = new Map();

self.addEventListener('message', (event) => {
  const { type, reminders } = event.data || {};

  if (type === 'SCHEDULE_REMINDERS' && Array.isArray(reminders)) {
    // Clear previous timers
    for (const timerId of scheduledTimers.values()) {
      clearTimeout(timerId);
    }
    scheduledTimers.clear();

    reminders.forEach((reminder) => {
      const delayMs = reminder.minutesLeft * 60 * 1000;
      if (delayMs < 0 || delayMs > 65 * 60 * 1000) return; // only schedule within ~65 min

      const timerId = setTimeout(() => {
        self.registration.showNotification('MyRamadhanku', {
          body: reminder.body,
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          tag: `reminder-${reminder.id}`,
          renotify: true,
          data: { url: '/' },
        });
        scheduledTimers.delete(reminder.id);
      }, delayMs);

      scheduledTimers.set(reminder.id, timerId);
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
// --- End Push Notification ---

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
