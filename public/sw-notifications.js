/* global self */
self.addEventListener('push', (event) => {
  let payload = {
    title: 'atoo',
    body: 'Tienes un aviso nuevo.',
    url: '/',
  };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // ignore
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const origin = self.location.origin;
        const path = targetUrl.startsWith('http') ? targetUrl : `${origin}${targetUrl}`;
        return self.clients.openWindow(path);
      }
      return undefined;
    }),
  );
});
