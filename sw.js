/* Elvar Admin service worker: lets the admin be installed. Network first, so you always see the latest version;
   the saved copy is only used when the phone is offline. Only files of this app are handled. */
const VER = 'elvar-admin-v1';
const SCOPE_PATH = new URL(self.registration.scope).pathname;
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VER).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || !u.pathname.startsWith(SCOPE_PATH)) return;
  e.respondWith(
    fetch(r).then((res) => { if (res && res.ok) { const cp = res.clone(); caches.open(VER).then((c) => c.put(r, cp)).catch(() => {}); } return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match(SCOPE_PATH) || caches.match('index.html')))
  );
});
