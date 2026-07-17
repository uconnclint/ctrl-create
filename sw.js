const CACHE = "ctrlcreate-v15";
const CORE = ["./", "index.html", "css/theme.css?v=15", "css/blocks.css?v=15", "css/game.css?v=15", "css/enhancements.css?v=15",
  "js/core.js?v=15", "js/blockDefs.js?v=15", "js/main.js?v=15", "js/enhancements.js?v=15"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match("index.html"))));
});
