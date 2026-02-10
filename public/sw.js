// Service Worker for Football Squad - Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, matchId } = event.data;
    
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `match-${matchId}`,
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Match' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        // Focus existing window or open new one
        for (const client of clients) {
          if (client.url.includes('/matches') && 'focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow('/matches');
      })
    );
  }
});
