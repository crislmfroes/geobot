//This is the "Offline page" service worker

//adicionar ao cache todos os arquivos estáticos

var homeURL = '/';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('pwabuilder-offline').then(function (cache) {
      return cache.addAll([
        homeURL,
        homeURL + 'index.html',
        homeURL + 'geobot.js',
        homeURL + 'style.css',
        homeURL + 'offline.html',
        homeURL + 'manifest.json'
      ]);
    })
  );
});

//Ao ativar atualiza o cache se necessário
var CACHE_NAME = 'static-v1';
self.addEventListener('activate', function activator(event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) {
          return key.indexOf(CACHE_NAME) !== 0;
        })
        .map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
});

//pegar o que for solicitado do cache, e se ele não existir fazer um request
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      return cachedResponse || fetch(event.request);
    })
  );
});
