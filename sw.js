/* Service Worker - Ortak Hatim ve Dua Takip
   Amac: sitenin Chrome'da "Uygulama olarak kur" / tam ekran (standalone)
   olarak calisabilmesini saglamak. Veri Supabase/localStorage'da oldugu icin
   burada AGRESIF onbellegi yok; ag-oncelikli, calisma-zamani geri donus. */
const CACHE = "hatim-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/Wir-lesen-zusammen-/index.html")))
  );
});
