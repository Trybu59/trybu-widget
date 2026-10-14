// Push notification handler for Trÿbu
// Imported by the VitePWA-generated service worker via importScripts

// Nettoyage de l'ancien pages-cache à l'activation.
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.delete('pages-cache'))
})

// Interception des navigations HTML avec cache: 'no-store'.
// Sans ça, le SW transmet la requête du navigateur telle quelle (cache: 'default'),
// Vercel répond 304 Not Modified, et le navigateur réutilise les en-têtes mis en
// cache — y compris une Content-Security-Policy périmée (sans 'unsafe-eval') —
// ce qui bloque le JS à chaque refresh normal. Ctrl+F5 fonctionnait car il force
// cache: 'no-store' lui-même. Ce handler s'enregistre avant les routes Workbox
// (importScripts s'exécute en premier) et prend la main via respondWith().
self.addEventListener('fetch', function(event) {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(new Request(event.request.url, {
      method: 'GET',
      headers: event.request.headers,
      cache: 'no-store',
      credentials: 'same-origin',
      redirect: 'follow',
    }))
  )
})

self.addEventListener('push', function (event) {
  if (!event.data) return
  var data
  try { data = event.data.json() } catch { data = { title: 'Trÿbu', body: event.data.text() } }

  var title = data.title || 'Trÿbu'
  var options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: '/favicon.png',
    tag: data.tag || ('trybu-' + (data.type || 'notif')),
    renotify: true,
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  var url = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i]
        if ('focus' in client) { client.focus(); return }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
