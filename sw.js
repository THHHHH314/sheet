// 离线缓存：装到 iPad 主屏后没网也能练。
//
// 策略是"网络优先、缓存兜底"：有网时永远拿到最新版本（避免更新后被旧缓存卡住），
// 没网时回落到上一次成功加载的内容。
const CACHE = 'sheet-v2';
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
  e.waitUntil(
    caches.open(CACHE)
      // 单个文件取不到不该让整次安装失败
      .then((c) => Promise.allSettled(ASSETS.map((url) => c.add(url))))
      .then(() => self.skipWaiting())
  );
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
    fetch(e.request)
      .then((res) => {
        // 顺手更新缓存，供下次断网时用
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit ?? caches.match('index.html')))
  );
});
