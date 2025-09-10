import { useEffect, useRef } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

// مكون تسريع تلقائي غير مرئي للمستخدم
const AutoSpeedBoost = () => {
  const { metrics, optimizations, cleanupMemory, scheduleOptimizedTask } = useAdvancedPerformance();
  const hasAppliedBoost = useRef(false);
  const cleanupInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // تطبيق تحسينات CSS فورية
    const applyCSSSOptimizations = () => {
      const style = document.createElement('style');
      style.id = 'auto-speed-boost';
      style.textContent = `
        /* تحسينات الأداء التلقائية */
        * {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        
        /* تحسين الخطوط */
        * {
          font-display: swap;
          text-rendering: optimizeSpeed;
        }
        
        /* تحسين الصور */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          will-change: transform;
          transform: translateZ(0);
        }
        
        /* تحسين التمرير */
        .mobile-scroll, * {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* تحسين الانتقالات للسرعة */
        * {
          transition-duration: 0.2s !important;
          animation-duration: 0.2s !important;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* تحسين العرض */
        [class*="card"], [class*="button"], [class*="input"] {
          contain: layout style paint;
          will-change: transform;
        }
        
        /* تقليل إعادة الرسم */
        .no-repaint, button, a, [role="button"] {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
      `;
      
      // إزالة الستايل القديم إن وجد
      const oldStyle = document.getElementById('auto-speed-boost');
      if (oldStyle) {
        oldStyle.remove();
      }
      
      document.head.appendChild(style);
    };

    // تحسين DOM تلقائياً
    const optimizeDOM = () => {
      // تحسين الصور
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.loading) img.loading = 'lazy';
        if (!img.decoding) img.decoding = 'async';
      });
      
      // تحسين القوائم الطويلة
      const lists = document.querySelectorAll('[class*="list"], [class*="grid"]');
      lists.forEach(list => {
        if (list.children.length > 10) {
          (list as HTMLElement).style.containIntrinsicSize = 'auto 400px';
          (list as HTMLElement).style.contentVisibility = 'auto';
        }
      });

      // تحسين الأزرار والروابط
      const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
      interactiveElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'transform';
        (el as HTMLElement).style.transform = 'translateZ(0)';
      });
    };

    // تنظيف تلقائي للذاكرة
    const autoCleanup = () => {
      // إزالة عناصر مؤقتة
      const tempElements = document.querySelectorAll('[data-temp="true"], .hidden, [style*="display: none"]');
      tempElements.forEach(el => {
        if (el.getAttribute('data-important') !== 'true') {
          el.remove();
        }
      });

      // تنظيف localStorage
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('temp_') || key.includes('old_') || key.includes('cache_')) {
            const timestamp = localStorage.getItem(key + '_timestamp');
            if (timestamp && Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
              localStorage.removeItem(key);
              localStorage.removeItem(key + '_timestamp');
            }
          }
        });
      } catch (e) {
        // تجاهل أخطاء localStorage
      }

      // تنظيف cache إذا متوفر
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old-') || name.includes('temp-')) {
              caches.delete(name);
            }
          });
        });
      }

      // استدعاء تنظيف الذاكرة المتقدم
      scheduleOptimizedTask(cleanupMemory, 'low');
    };

    // تطبيق التحسينات فوراً
    const applyImmediateOptimizations = () => {
      applyCSSSOptimizations();
      
      setTimeout(() => {
        optimizeDOM();
      }, 100);

      setTimeout(() => {
        autoCleanup();
      }, 500);

      hasAppliedBoost.current = true;
      console.log('⚡ تم تطبيق التسريع التلقائي');
    };

    // تطبيق التحسينات عند التحميل
    if (!hasAppliedBoost.current) {
      applyImmediateOptimizations();
    }

    // تحسينات دورية تلقائية
    cleanupInterval.current = setInterval(() => {
      // تنظيف دوري كل دقيقة
      autoCleanup();
      
      // إعادة تطبيق تحسينات DOM إذا احتاج الأمر
      if (metrics.memoryUsage > 100 || metrics.loadTime > 2000) {
        optimizeDOM();
      }
    }, 60000);

    // تحسينات تفاعلية حسب الأداء
    const performanceOptimizations = () => {
      // تسريع إضافي للأجهزة البطيئة
      if (metrics.isSlowDevice || metrics.networkSpeed === 'slow') {
        document.body.style.willChange = 'scroll-position';
        
        // تقليل جودة الانتقالات للأجهزة البطيئة
        const fastStyle = document.createElement('style');
        fastStyle.textContent = `
          * {
            transition-duration: 0.1s !important;
            animation-duration: 0.1s !important;
          }
        `;
        document.head.appendChild(fastStyle);
        
        setTimeout(() => {
          fastStyle.remove();
        }, 5000);
      }

      // تحسين إضافي عند استهلاك ذاكرة عالي
      if (metrics.memoryUsage > 150) {
        // إخفاء عناصر غير ضرورية مؤقتاً
        const nonEssential = document.querySelectorAll('.decoration, .background-image, [data-priority="low"]');
        nonEssential.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });

        // إعادة إظهارها بعد تنظيف الذاكرة
        setTimeout(() => {
          autoCleanup();
          nonEssential.forEach(el => {
            (el as HTMLElement).style.display = '';
          });
        }, 2000);
      }
    };

    // مراقبة الأداء وتطبيق التحسينات حسب الحاجة
    setTimeout(performanceOptimizations, 1000);

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
      
      // إزالة الستايل عند الخروج
      const style = document.getElementById('auto-speed-boost');
      if (style) {
        style.remove();
      }
    };
  }, [metrics, optimizations, cleanupMemory, scheduleOptimizedTask]);

  // مكون غير مرئي
  return null;
};

export default AutoSpeedBoost;