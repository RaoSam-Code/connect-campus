importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Cache app shell (JS/CSS/HTML)
workbox.routing.registerRoute(
  ({ request }) => ['script', 'style', 'document'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'notes-app-shell',
  })
);

// Cache notes API responses (offline support)
workbox.routing.registerRoute(
  /\/api\/notes/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'notes-api',
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Cache images (icons, avatars)
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'notes-images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 20 }),
    ],
  })
);
