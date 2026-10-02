// Simple Offline Cache Service Worker for Büyüteç Bütçe PWA
const CACHE_NAME = 'buyutec-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle standard requests; cache fallback when offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
