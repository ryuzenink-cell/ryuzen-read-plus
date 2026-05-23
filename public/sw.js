/* Ryuzen ReadPlus PWA: cache conservador apenas para assets publicos e estaticos. */
const CACHE_PREFIX = 'rrp-static-';
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/icons/pwa-192x192.png',
  '/icons/pwa-512x512.png',
  '/icons/pwa-maskable-192x192.png',
  '/icons/pwa-maskable-512x512.png'
];

const SENSITIVE_PREFIXES = [
  '/admin',
  '/api',
  '/functions',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/nova-senha',
  '/biblioteca',
  '/conta'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isSensitivePath(pathname) {
  return SENSITIVE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isSafeStaticAsset(request, url) {
  if (url.origin !== self.location.origin || isSensitivePath(url.pathname)) return false;
  if (request.destination === 'document' || request.mode === 'navigate') return false;
  if (url.pathname === '/manifest.webmanifest') return true;
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/favicon/') || url.pathname === '/favicon.ico' || url.pathname === '/favicon.png' || url.pathname === '/apple-touch-icon.png') return true;
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/assets/')) {
    return ['style', 'script', 'font', 'image'].includes(request.destination);
  }
  return false;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Somente GET e assets locais comprovadamente estaticos entram em cache.
  // Navegacoes, APIs, auth, biblioteca e admin permanecem totalmente na rede.
  if (request.method !== 'GET' || !isSafeStaticAsset(request, url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
