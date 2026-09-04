// Push notification handler for Trÿbu
// Imported by the VitePWA-generated service worker via importScripts

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
