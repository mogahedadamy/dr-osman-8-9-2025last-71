import React, { useEffect, useState } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

const ServiceWorkerManager = () => {
  const [swStatus, setSwStatus] = useState<'installing' | 'waiting' | 'active' | 'error' | null>(null);
  const { optimizations } = useAdvancedPerformance();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          setSwStatus('installing');
          
          newWorker.addEventListener('statechange', () => {
            switch (newWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  setSwStatus('waiting');
                } else {
                  setSwStatus('active');
                }
                break;
              case 'activated':
                setSwStatus('active');
                break;
            }
          });
        }
      });

      // تحديث Service Worker عند توفر نسخة جديدة
      registration.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // إعداد التخزين المؤقت المتقدم
      await setupAdvancedCaching();
      
    } catch (error) {
      console.error('خطأ في تسجيل Service Worker:', error);
      setSwStatus('error');
    }
  };

  const setupAdvancedCaching = async () => {
    if ('caches' in window) {
      const cache = await caches.open('app-cache-v1');
      
      // ذاكرة التخزين المؤقت للموارد الأساسية
      const essentialResources = [
        '/',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
      ];

      // تخزين مؤقت انتقائي بناءً على الأداء
      if (optimizations.shouldPreload) {
        const additionalResources = [
          '/static/js/main.js',
          '/static/css/main.css'
        ];
        essentialResources.push(...additionalResources);
      }

      try {
        await cache.addAll(essentialResources);
      } catch (error) {
        console.error('خطأ في إعداد التخزين المؤقت:', error);
      }

      // تنظيف الكاش القديم
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('app-cache-') && name !== 'app-cache-v1'
      );
      
      await Promise.all(
        oldCaches.map(name => caches.delete(name))
      );
    }
  };

  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  };

  // مراقبة حالة الاتصال لتحديث الكاش
  useEffect(() => {
    const handleOnline = () => {
      if (swStatus === 'active') {
        // تحديث الكاش عند العودة للاتصال
        caches.open('app-cache-v1').then(cache => {
          cache.addAll(['/']);
        });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [swStatus]);

  // إشعار التحديث للمستخدم
  if (swStatus === 'waiting') {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">تحديث جديد متوفر</p>
            <p className="text-sm opacity-90">أعد تحميل التطبيق للحصول على أحدث التحسينات</p>
          </div>
          <button
            onClick={updateServiceWorker}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            تحديث
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ServiceWorkerManager;