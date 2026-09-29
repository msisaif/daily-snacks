// নেট না থাকলে ব্রাউজারের এরর পেজের বদলে offline.html দেখায়।
// লগইন-নির্ভর পেজ বা ডেটা কখনো ক্যাশ করা হয় না; সব পেজ সবসময় সার্ভার থেকে আসে।
const CACHE = "daily-snacks-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
