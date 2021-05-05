const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "budget-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/index.js",
    "/style.css",
    "/icons/icon-512x512.png",
    "/icons/icon-192x192.png"
];
// Going to create the cache
self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Going to remove old caches
self.addEventListener("activate", function(event) {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              console.log("Removing old cache data", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  

//fetch the data
self.addEventListener("fetch", function(event) {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(event.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }

    event.respondWith(
        caches.open(STATIC_CACHE).then(cache => {
          return cache.match(event.request).then(response => {
            return response || fetch(event.request);
          });
        })
      );
    });