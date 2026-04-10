importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Public config — safe to hardcode (same values as NEXT_PUBLIC_* env vars)
firebase.initializeApp({
  apiKey: 'AIzaSyAlhkEEGqa8HoWOII47VBTxEVA1LZ-k-v4',
  authDomain: 'ephlats-2026.firebaseapp.com',
  projectId: 'ephlats-2026',
  storageBucket: 'ephlats-2026.firebasestorage.app',
  messagingSenderId: '919804807357',
  appId: '1:919804807357:web:b39710d7d212ce28820fd4',
});

const messaging = firebase.messaging();

// Handle background push messages via the Firebase Messaging SDK
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const title = notification.title || 'Ephlats 2026';
  const body = notification.body || '';
  const link = payload.fcmOptions?.link || '/home';

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: link },
  });
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
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
