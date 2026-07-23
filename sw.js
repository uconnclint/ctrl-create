const CACHE = "ctrlcreate-v17";
const CORE = ["./", "index.html", "css/theme.css?v=16", "css/blocks.css?v=16", "css/game.css?v=16", "css/enhancements.css?v=16",
  "js/core.js?v=16", "js/blockDefs.js?v=16", "js/main.js?v=16", "js/enhancements.js?v=16", "js/engine-bridge.js"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match("index.html"))));
});
