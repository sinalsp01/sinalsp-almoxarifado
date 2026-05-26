// ── SERVICE WORKER — Sinal SP Almoxarifado ────────────────────────
const CACHE_NAME = 'sinalsp-alm-v4';
const STATIC_CACHE = [
  '/sinalsp-almoxarifado/manifest.json',
  '/sinalsp-almoxarifado/icon-192.png',
  '/sinalsp-almoxarifado/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Nunca cacheia o index.html — sempre busca a versão mais recente
  if (event.request.url.includes('index.html') ||
      event.request.url.endsWith('/sinalsp-almoxarifado/') ||
      event.request.url.endsWith('/sinalsp-almoxarifado')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Firebase e APIs externas — nunca intercepta
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('callmebot') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('fonts.googleapis.com')) {
    return;
  }

  // Ícones e manifest — serve do cache
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
