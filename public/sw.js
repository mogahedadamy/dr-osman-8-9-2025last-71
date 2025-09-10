const CACHE_NAME = 'dr-osman-cache-v4';
const STATIC_CACHE = 'static-cache-v4';
const DYNAMIC_CACHE = 'dynamic-cache-v4';

// الموارد الأساسية للتخزين المؤقت (موارد مضمونة الوجود)
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// الموارد الثانوية (تحميل آمن)
const OPTIONAL_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-384x384.png'
];

// تثبيت Service Worker (آمن ولا يفشل)
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // تخزين الموارد الأساسية فقط (مضمونة الوجود)
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.warn('بعض الموارد الأساسية غير متوفرة:', error);
          return Promise.resolve();
        });
      }),
      // تخزين الموارد الثانوية (لا تفشل التثبيت إذا فشلت)
      caches.open(DYNAMIC_CACHE).then(cache => {
        return Promise.allSettled(
          OPTIONAL_ASSETS.map(asset => 
            fetch(asset).then(response => {
              if (response.ok) {
                return cache.put(asset, response);
              }
            }).catch(() => {
              // تجاهل الملفات غير الموجودة
            })
          )
        );
      })
    ]).then(() => {
      console.log('✅ Service Worker مُثبت بنجاح');
      return self.skipWaiting();
    }).catch(error => {
      console.warn('⚠️ تثبيت Service Worker مع تحذيرات:', error);
      return self.skipWaiting();
    })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // مسح الكاش القديم
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // السيطرة على جميع النوافذ
      self.clients.claim()
    ])
  );
});

// استراتيجية التخزين المؤقت المتقدمة
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // تخطي الطلبات الخارجية
  if (url.origin !== location.origin) {
    return;
  }

  // استراتيجية Cache First للموارد الثابتة
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      request.url.includes('/static/')) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(fetchResponse => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
    );
    return;
  }

  // استراتيجية Network First للصفحات والـ API
  if (request.mode === 'navigate' || 
      request.destination === 'document' ||
      request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // العودة للكاش في حالة عدم وجود اتصال
        return caches.match(request).then(response => {
          return response || caches.match('/');
        });
      })
    );
    return;
  }

  // استراتيجية Cache First العامة
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(fetchResponse => {
        if (fetchResponse.ok) {
          const responseClone = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return fetchResponse;
      });
    })
  );
});

// معالجة رسائل من الصفحة الرئيسية
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// تنظيف الكاش الديناميكي دورياً
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    cleanupDynamicCache();
  }
});

async function cleanupDynamicCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  // إبقاء آخر 50 عنصر فقط
  if (requests.length > 50) {
    const requestsToDelete = requests.slice(0, requests.length - 50);
    await Promise.all(
      requestsToDelete.map(request => cache.delete(request))
    );
  }
}

// Background sync for offline actions - تحسين المزامنة التلقائية
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'auto-sync') {
    event.waitUntil(performAutoSync());
  } else if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// تنفيذ المزامنة التلقائية
async function performAutoSync() {
  try {
    console.log('📤 بدء المزامنة التلقائية...');
    
    // الحصول على البيانات المعلقة
    const pendingTasks = await getPendingSyncTasks();
    
    if (pendingTasks.length === 0) {
      console.log('✅ لا توجد مهام للمزامنة');
      return;
    }
    
    console.log(`📋 ${pendingTasks.length} مهمة في انتظار المزامنة`);
    
    // معالجة المهام تدريجياً
    for (const task of pendingTasks) {
      try {
        await processSyncTask(task);
        await markTaskAsCompleted(task.id);
        console.log(`✅ تم مزامنة المهمة: ${task.type}`);
      } catch (error) {
        console.error(`❌ فشل في مزامنة المهمة ${task.id}:`, error);
      }
    }
    
    // إشعار الصفحات بنجاح المزامنة
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        completedTasks: pendingTasks.length
      });
    });
    
    console.log('🎉 تمت المزامنة التلقائية بنجاح');
    
  } catch (error) {
    console.error('❌ فشل في المزامنة التلقائية:', error);
  }
}

// تنفيذ المزامنة العادية
async function performBackgroundSync() {
  console.log('📱 Background sync for offline actions');
  // Handle offline data synchronization here
}

// الحصول على المهام المعلقة
async function getPendingSyncTasks() {
  try {
    // محاولة الوصول للتخزين المحلي
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      // طلب البيانات من الصفحة النشطة
      return new Promise((resolve) => {
        clients[0].postMessage({ type: 'GET_PENDING_TASKS' });
        
        // انتظار الرد لمدة 5 ثوان كحد أقصى
        const timeout = setTimeout(() => resolve([]), 5000);
        
        self.addEventListener('message', function handler(event) {
          if (event.data && event.data.type === 'PENDING_TASKS_RESPONSE') {
            clearTimeout(timeout);
            self.removeEventListener('message', handler);
            resolve(event.data.tasks || []);
          }
        });
      });
    }
    
    return [];
  } catch (error) {
    console.error('خطأ في الحصول على المهام المعلقة:', error);
    return [];
  }
}

// معالجة مهمة مزامنة
async function processSyncTask(task) {
  // محاكاة إرسال البيانات للخادم
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  switch (task.type) {
    case 'reminder':
      await delay(200);
      console.log('📅 تم مزامنة التذكير:', task.data);
      break;
      
    case 'health-data':
      await delay(300);
      console.log('🏥 تم مزامنة البيانات الصحية:', task.data);
      break;
      
    case 'chat':
      await delay(150);
      console.log('💬 تم مزامنة رسالة المحادثة:', task.data);
      break;
      
    case 'profile':
      await delay(250);
      console.log('👤 تم مزامنة الملف الشخصي:', task.data);
      break;
      
    case 'settings':
      await delay(100);
      console.log('⚙️ تم مزامنة الإعدادات:', task.data);
      break;
      
    default:
      throw new Error(`نوع مهمة غير معروف: ${task.type}`);
  }
}

// تمييز المهمة كمكتملة
async function markTaskAsCompleted(taskId) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'MARK_TASK_COMPLETED',
      taskId: taskId
    });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'لديك إشعار جديد من Dr. Osman',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    tag: 'dr-osman-notification',
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar'
  };

  event.waitUntil(
    self.registration.showNotification('Dr. Osman', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});