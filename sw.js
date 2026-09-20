// 离线缓存：装到 iPad 主屏后没网也能练。
const CACHE = 'sheet-v1';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'vendor/vexflow-bravura.js',
  'src/app.js',
  'src/i18n.js',
  'src/notes.js',
  'src/levels.js',
  'src/staff.js',
  'src/keyboard.js',
  'src/audio.js',
  'src/progress.js',
  'icons/icon-180.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit ?? fetch(e.request))
  );
});
