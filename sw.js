// ── SERVICE WORKER — Sinal SP Almoxarifado ────────────────────────
const CACHE_NAME = 'sinalsp-alm-v1';
const URLS_TO_CACHE = [
  '/sinalsp-almoxarifado/',
  '/sinalsp-almoxarifado/index.html',
  '/sinalsp-almoxarifado/manifest.json',
  '/sinalsp-almoxarifado/icon-192.png',
  '/sinalsp-almoxarifado/icon-512.png',
];

// ── INSTALL: pré-cacheia os arquivos do app ───────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// ── ACTIVATE: limpa caches antigos ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH: serve do cache se offline ─────────────────────────────
self.addEventListener('fetch', event => {
  // Não intercepta requisições do Firebase (sempre online)
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('callmebot') ||
      event.request.url.includes('googleapis.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => caches.match('/sinalsp-almoxarifado/index.html'));
    })
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title   = data.title   || '⚠️ Sinal SP Almoxarifado';
  const options = {
    body:    data.body    || 'Ferramenta danificada devolvida.',
    icon:    '/sinalsp-almoxarifado/icon-192.png',
    badge:   '/sinalsp-almoxarifado/icon-192.png',
    vibrate: [200, 100, 200],
    data:    { url: '/sinalsp-almoxarifado/' },
    actions: [{ action: 'open', title: 'Ver no sistema' }]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── NOTIFICATION CLICK ────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/sinalsp-almoxarifado/');
    })
  );
});
