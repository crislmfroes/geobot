//This is the "Offline page" service worker

//adicionar ao cache todos os arquivos estáticos

var homeURL = '/geobot/';
var CACHE_NAME = 'geobot-v1';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        homeURL,
        homeURL + 'index.html',
        homeURL + 'geobot.js',
        homeURL + 'style.css',
        homeURL + 'offline.html',
        homeURL + 'manifest.json',
        homeURL + 'img/bot.png',
        homeURL + 'img/user.png'
      ]);
    })
  );
});

//Ao ativar atualiza o cache se necessário
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
