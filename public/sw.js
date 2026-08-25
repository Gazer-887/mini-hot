// Mini_hot 离线扩展：缓存 app shell（静态资源），网络优先、失败回退缓存。
// 注意：不缓存第三方 API（避免展示过期热榜）。

const CACHE = 'minihot-v1'
const SHELL = ['index.html', 'manifest.webmanifest', 'favicon.svg']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  // 仅处理同源 GET（第三方 / API 请求交给网络，不缓存）
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  e.respondWith(
    fetch(req)
      .then((res) => {
        // 只缓存成功响应
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('index.html'))),
  )
})
