import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useAdvancedPerformance } from './useAdvancedPerformance';

// Hook للأداء السريع كالرصاصة
export const useLightningPerformance = () => {
  const { metrics, optimizations, scheduleOptimizedTask, cleanupMemory } = useAdvancedPerformance();
  const cleanupRef = useRef<NodeJS.Timeout>();

  // تنظيف تلقائي للذاكرة
  const autoCleanup = useCallback(() => {
    if (metrics.memoryUsage > 100) {
      scheduleOptimizedTask(() => {
        cleanupMemory();
        console.log('🧹 تنظيف تلقائي للذاكرة');
      }, 'low');
    }
  }, [metrics.memoryUsage, cleanupMemory, scheduleOptimizedTask]);

  // تحسين السرعة التلقائي
  const optimizeSpeed = useCallback(() => {
    // تفعيل تحسينات CSS للأداء
    const style = document.createElement('style');
    style.textContent = `
      * {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      
      img, video {
        will-change: transform;
        transform: translateZ(0);
      }
      
      .mobile-scroll {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
      }
      
      .performance-optimized {
        contain: layout style paint;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    // تحسين الخطوط
    const fonts = document.fonts;
    if (fonts && fonts.ready) {
      fonts.ready.then(() => {
        console.log('⚡ تم تحميل الخطوط بنجاح');
      });
    }

    // تحسين الصور
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });

  }, []);

  // مراقبة الأداء المستمرة
  useEffect(() => {
    // تنظيف دوري
    cleanupRef.current = setInterval(autoCleanup, 30000); // كل 30 ثانية

    // تحسين أولي
    setTimeout(optimizeSpeed, 100);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
    };
  }, [autoCleanup, optimizeSpeed]);

  // إضافة مستمعات لتحسين الأداء
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // تنظيف عند إخفاء التطبيق
        scheduleOptimizedTask(cleanupMemory, 'low');
      }
    };

    const handleMemoryWarning = () => {
      console.warn('⚠️ تحذير ذاكرة - تنظيف فوري');
      cleanupMemory();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // مستمع لتحذيرات الذاكرة (في البيئات المدعومة)
    if ('onmemorywarning' in window) {
      window.addEventListener('memorywarning', handleMemoryWarning);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ('onmemorywarning' in window) {
        window.removeEventListener('memorywarning', handleMemoryWarning);
      }
    };
  }, [cleanupMemory, scheduleOptimizedTask]);

  // حساب نقاط السرعة
  const speedScore = useMemo(() => {
    let score = 100;
    
    // خصم نقاط بناءً على البطء
    if (metrics.loadTime > 2000) score -= 30;
    if (metrics.memoryUsage > 100) score -= 20;
    if (metrics.networkSpeed === 'slow') score -= 15;
    if (metrics.isSlowDevice) score -= 10;
    
    return Math.max(0, score);
  }, [metrics]);

  // حالة السرعة
  const speedStatus = useMemo(() => {
    if (speedScore >= 90) return { level: 'lightning', emoji: '⚡', color: 'text-green-500' };
    if (speedScore >= 70) return { level: 'fast', emoji: '🚀', color: 'text-blue-500' };
    if (speedScore >= 50) return { level: 'normal', emoji: '🏃', color: 'text-yellow-500' };
    return { level: 'slow', emoji: '🐌', color: 'text-red-500' };
  }, [speedScore]);

  // تحسين فوري
  const boost = useCallback(() => {
    // تنظيف سريع
    cleanupMemory();
    
    // إزالة عناصر غير ضرورية
    const unusedElements = document.querySelectorAll('[data-temp="true"], .hidden, [style*="display: none"]');
    unusedElements.forEach(el => {
      if (el.getAttribute('data-important') !== 'true') {
        el.remove();
      }
    });

    // تحسين CSS
    const style = document.createElement('style');
    style.textContent = `
      .boost-mode * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('boost-mode');

    // إزالة بعد 5 ثوان
    setTimeout(() => {
      document.body.classList.remove('boost-mode');
      style.remove();
    }, 5000);

    console.log('🚀 تم تفعيل وضع التسريع!');
  }, [cleanupMemory]);

  return {
    metrics,
    optimizations,
    speedScore,
    speedStatus,
    boost,
    autoCleanup,
    isLightningFast: speedScore >= 90
  };
};

export default useLightningPerformance;