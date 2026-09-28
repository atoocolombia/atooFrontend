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
      const origin = self.location.origin;
      const fullUrl = targetUrl.startsWith('http') ? targetUrl : `${origin}${targetUrl}`;

      for (const client of clientList) {
        if (!client.url.startsWith(origin)) continue;
        if ('navigate' in client && typeof client.navigate === 'function') {
          return client.navigate(fullUrl).then((c) => c?.focus());
        }
        client.postMessage({ type: 'atoo-push-navigate', url: targetUrl });
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
      return undefined;
    }),
  );
});
