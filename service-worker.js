self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('edith-cache').then((cache) =>
      cache.addAll([
        './',
        './index.html',
        './style.css',
        './main.js',
        './manifest.json'
      ])
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});