importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Config is fetched from the API route on install
let firebaseConfig = null;

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/api/sw-config')
      .then((res) => res.json())
      .then((config) => {
        firebaseConfig = config;
        firebase.initializeApp(config);
      })
      .catch(() => {
        // Fallback: will try to use cached config
        console.warn('Could not fetch Firebase config for service worker');
      })
  );
});

// Initialize messaging after config is loaded
let messaging = null;

self.addEventListener('activate', () => {
  if (firebaseConfig && !messaging) {
    try {
      messaging = firebase.messaging();
    } catch (e) {
      console.warn('Firebase messaging init error:', e);
    }
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    return;
  }

  const notification = data.notification || {};
  const title = notification.title || 'Ephlats 2026';
  const body = notification.body || '';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url: '/home' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/home';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
