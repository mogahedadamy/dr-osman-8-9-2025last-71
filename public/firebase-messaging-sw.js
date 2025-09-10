// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "dr-osman-pregnancy.firebaseapp.com",
  projectId: "dr-osman-pregnancy",
  storageBucket: "dr-osman-pregnancy.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'تطبيق د. عثمان';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك إشعار جديد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'pregnancy-notification',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'عرض',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'إغلاق'
      }
    ],
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();

  // Handle different actions
  if (event.action === 'view') {
    // Open the app and navigate to specific page
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification close analytics if needed
  // analytics.track('notification_closed', { 
  //   tag: event.notification.tag 
  // });
});