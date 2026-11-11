/* Wazi service worker — offline cache for the demo (low-bandwidth support) */
var CACHE = 'wazi-v6';
var ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/i18n.js',
  './js/data.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        return res;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
