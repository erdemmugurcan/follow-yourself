// Uygulama dosyalarını önbelleğe alır; internet yokken de açılır. Sürüm değişince eski önbellek silinir.
const V = "follow-yourself-v9";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "logo-light.png", "logo-dark.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    // Önce ağ (güncel sürüm), olmazsa önbellek
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
  } else if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; })));
  }
});
