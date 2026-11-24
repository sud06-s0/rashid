// sw.js — Rasid service worker: app shell, CDN libraries and fonts cached for full offline use
const VERSION = 'rasid-v1.0.0';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
const LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);
    await Promise.allSettled(LIBS.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && cache.put(u, r))));
    try {   // fonts: cache the stylesheet and every font file it points to
      const res = await fetch(FONT_CSS, { mode: 'cors' });
      if (res.ok) {
        const css = await res.clone().text();
        await cache.put(FONT_CSS, res);
        const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"]+/g) || [])];
        await Promise.allSettled(urls.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && cache.put(u, r))));
      }
    } catch (e) { /* fonts fall back to system fonts until next visit */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // pages: network first so updates arrive, cached copy when offline
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }
  const cdn = /^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(url.hostname);
  if (url.origin !== self.location.origin && !cdn) return;
  // everything else: cache first, then network (and keep a copy)
  event.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: url.origin === self.location.origin });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) { const cache = await caches.open(VERSION); cache.put(req, res.clone()); }
      return res;
    } catch (e) { return hit || Response.error(); }
  })());
});
