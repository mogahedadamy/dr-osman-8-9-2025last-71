import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  memoryUsage?: number;
  loadTime: number;
  renderTime: number;
  isSlowConnection: boolean;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    isSlowConnection: false
  });

  useEffect(() => {
    const startTime = performance.now();

    // Check connection speed
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.downlink < 1.5
    );

    // Measure load time
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      
      // Get memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : undefined;

      setMetrics({
        loadTime,
        renderTime: loadTime,
        memoryUsage,
        isSlowConnection
      });

      console.log("⚡ Performance Metrics:", {
        loadTime: `${loadTime.toFixed(2)}ms`,
        memoryUsage: memoryUsage ? `${memoryUsage.toFixed(2)}MB` : 'N/A',
        connection: connection?.effectiveType || 'unknown',
        isSlowConnection
      });
    };

    // Measure after component mount
    setTimeout(measureLoadTime, 100);

    // Monitor performance every 30 seconds
    const interval = setInterval(() => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const optimizeImages = () => {
    // Add image optimization hints
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });
  };

  const preloadCriticalResources = (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      if (url.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        link.as = 'image';
      } else if (url.match(/\.css$/i)) {
        link.as = 'style';
      } else if (url.match(/\.js$/i)) {
        link.as = 'script';
      }
      
      document.head.appendChild(link);
    });
  };

  const scheduleTask = (callback: () => void, priority: 'high' | 'normal' | 'low' = 'normal') => {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      const scheduler = (window as any).scheduler;
      const priorityMap = {
        high: 'user-blocking',
        normal: 'user-visible', 
        low: 'background'
      };
      
      scheduler.postTask(callback, { priority: priorityMap[priority] });
    } else {
      // Fallback for browsers without scheduler API
      if (priority === 'high') {
        callback();
      } else if (priority === 'normal') {
        setTimeout(callback, 0);
      } else {
        setTimeout(callback, 16); // ~1 frame delay
      }
    }
  };

  return {
    metrics,
    optimizeImages,
    preloadCriticalResources,
    scheduleTask
  };
};