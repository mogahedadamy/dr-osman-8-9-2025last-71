import { useEffect, useState, useCallback } from 'react';

interface AdvancedPerformanceMetrics {
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  jsHeapSize: number;
  domElements: number;
  networkSpeed: 'fast' | 'slow' | 'unknown';
  isSlowDevice: boolean;
  batteryLevel?: number;
}

interface PerformanceOptimizations {
  shouldLazyLoad: boolean;
  shouldPreload: boolean;
  shouldUseVirtualScroll: boolean;
  shouldCompressImages: boolean;
  maxConcurrentRequests: number;
}

export const useAdvancedPerformance = () => {
  const [metrics, setMetrics] = useState<AdvancedPerformanceMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    jsHeapSize: 0,
    domElements: 0,
    networkSpeed: 'unknown',
    isSlowDevice: false
  });

  const [optimizations, setOptimizations] = useState<PerformanceOptimizations>({
    shouldLazyLoad: true,
    shouldPreload: true,
    shouldUseVirtualScroll: false,
    shouldCompressImages: true,
    maxConcurrentRequests: 6
  });

  // قياس الأداء المتقدم
  const measurePerformance = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;
    
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    const renderTime = navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0;
    
    // قياس سرعة الشبكة
    const connection = (navigator as any).connection;
    let networkSpeed: 'fast' | 'slow' | 'unknown' = 'unknown';
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      
      if (effectiveType === '4g' && downlink > 10) {
        networkSpeed = 'fast';
      } else if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1.5) {
        networkSpeed = 'slow';
      } else {
        networkSpeed = 'fast';
      }
    }

    // كشف الأجهزة البطيئة
    const isSlowDevice = navigator.hardwareConcurrency <= 2 || 
                        (memory && memory.jsHeapSizeLimit < 1073741824); // أقل من 1GB

    // قياس عدد عناصر DOM
    const domElements = document.querySelectorAll('*').length;

    const newMetrics: AdvancedPerformanceMetrics = {
      memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
      loadTime,
      renderTime,
      jsHeapSize: memory ? memory.jsHeapSizeLimit / 1024 / 1024 : 0,
      domElements,
      networkSpeed,
      isSlowDevice
    };

    // قياس البطارية إذا متوفر
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        newMetrics.batteryLevel = battery.level * 100;
        setMetrics(newMetrics);
      });
    } else {
      setMetrics(newMetrics);
    }

    // تحديد التحسينات بناءً على الأداء
    const newOptimizations: PerformanceOptimizations = {
      shouldLazyLoad: networkSpeed === 'slow' || isSlowDevice,
      shouldPreload: networkSpeed === 'fast' && !isSlowDevice,
      shouldUseVirtualScroll: domElements > 1000 || isSlowDevice,
      shouldCompressImages: networkSpeed === 'slow' || isSlowDevice,
      maxConcurrentRequests: networkSpeed === 'fast' ? 6 : 3
    };

    setOptimizations(newOptimizations);
  }, []);

  // تنظيف الذاكرة
  const cleanupMemory = useCallback(() => {
    // إزالة مستمعي الأحداث غير المستخدمة
    const unusedElements = document.querySelectorAll('[data-cleanup="true"]');
    unusedElements.forEach(el => el.remove());

    // تنظيف الكاش
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old-') || name.includes('temp-')) {
            caches.delete(name);
          }
        });
      });
    }

    // فرض garbage collection إذا متوفر
    if ((window as any).gc) {
      (window as any).gc();
    }
  }, []);

  // تحسين الصور تلقائياً
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    
    images.forEach(img => {
      // إضافة lazy loading
      if (!img.loading && optimizations.shouldLazyLoad) {
        img.loading = 'lazy';
      }
      
      // إضافة decoding async
      if (!img.decoding) {
        img.decoding = 'async';
      }
      
      // تحسين أحجام الصور للشاشات المختلفة
      if (!img.srcset && img.src) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        if (devicePixelRatio > 1 && optimizations.shouldCompressImages) {
          // يمكن إضافة منطق لتحميل صور بجودة مناسبة
          img.style.imageRendering = 'crisp-edges';
        }
      }
    });
  }, [optimizations]);

  // جدولة المهام بكفاءة
  const scheduleOptimizedTask = useCallback((
    task: () => void, 
    priority: 'immediate' | 'high' | 'normal' | 'low' = 'normal'
  ) => {
    const scheduler = (window as any).scheduler;
    
    if (scheduler && 'postTask' in scheduler) {
      const priorityMap = {
        immediate: 'user-blocking',
        high: 'user-blocking',
        normal: 'user-visible',
        low: 'background'
      };
      
      scheduler.postTask(task, { priority: priorityMap[priority] });
    } else {
      // Fallback بناءً على الأولوية
      switch (priority) {
        case 'immediate':
          task();
          break;
        case 'high':
          setTimeout(task, 0);
          break;
        case 'normal':
          setTimeout(task, 16);
          break;
        case 'low':
          setTimeout(task, 100);
          break;
      }
    }
  }, []);

  // مراقبة مستمرة للأداء
  useEffect(() => {
    // قياس أولي
    setTimeout(measurePerformance, 100);
    
    // مراقبة دورية
    const performanceInterval = setInterval(measurePerformance, 30000);
    
    // تنظيف الذاكرة كل دقيقة
    const cleanupInterval = setInterval(cleanupMemory, 60000);
    
    // تحسين الصور عند التحميل
    setTimeout(optimizeImages, 1000);
    
    return () => {
      clearInterval(performanceInterval);
      clearInterval(cleanupInterval);
    };
  }, [measurePerformance, cleanupMemory, optimizeImages]);

  return {
    metrics,
    optimizations,
    measurePerformance,
    cleanupMemory,
    optimizeImages,
    scheduleOptimizedTask
  };
};