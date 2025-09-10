import { useEffect } from 'react';
import { useLightningPerformance } from '@/hooks/useLightningPerformance';

// مكون لتطبيق تحسينات سريعة فورية
const QuickPerformanceBoost = () => {
  const { boost, speedScore } = useLightningPerformance();

  useEffect(() => {
    // تحسينات CSS فورية
    const optimizeCSS = () => {
      const style = document.createElement('style');
      style.id = 'lightning-boost-styles';
      style.textContent = `
        /* تحسين الخطوط والنصوص */
        * {
          font-display: swap;
          text-rendering: optimizeSpeed;
        }
        
        /* تحسين الصور */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        
        /* تحسين التمرير */
        .mobile-scroll {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* تحسين الانتقالات */
        .lightning-fast * {
          transition-duration: 0.1s !important;
          animation-duration: 0.1s !important;
        }
        
        /* تحسين العرض */
        .performance-optimized {
          contain: layout style paint;
          will-change: transform;
        }
        
        /* تحسين الذاكرة */
        .memory-efficient {
          contain: strict;
          content-visibility: auto;
        }
        
        /* تقليل إعادة الرسم */
        .no-repaint {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
      `;
      
      // إزالة الستايل القديم إن وجد
      const oldStyle = document.getElementById('lightning-boost-styles');
      if (oldStyle) {
        oldStyle.remove();
      }
      
      document.head.appendChild(style);
    };

    // تحسين DOM فوري
    const optimizeDOM = () => {
      // إضافة classes التحسين للعناصر
      document.body.classList.add('lightning-fast');
      
      // تحسين الصور
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.classList.add('no-repaint');
        if (!img.loading) img.loading = 'lazy';
        if (!img.decoding) img.decoding = 'async';
      });
      
      // تحسين المحتوى
      const cards = document.querySelectorAll('[class*="card"], [class*="component"]');
      cards.forEach(card => {
        card.classList.add('performance-optimized');
      });

      // تحسين القوائم
      const lists = document.querySelectorAll('[class*="list"], [class*="grid"]');
      lists.forEach(list => {
        if (list.children.length > 10) {
          list.classList.add('memory-efficient');
        }
      });
    };

    // تحسين الشبكة
    const optimizeNetwork = () => {
      // تحميل مسبق للموارد الحرجة
      const criticalAssets = [
        '/icons/icon-192x192.png',
        '/manifest.json'
      ];

      criticalAssets.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset;
        if (asset.includes('.png')) link.as = 'image';
        document.head.appendChild(link);
      });
    };

    // تحسين الذاكرة
    const optimizeMemory = () => {
      // إزالة مستمعي الأحداث المؤقتة
      const tempElements = document.querySelectorAll('[data-temp="true"]');
      tempElements.forEach(el => el.remove());

      // تنظيف localStorage القديم
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('temp_') || key.includes('cache_old_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.log('تنظيف localStorage غير متاح');
      }
    };

    // تطبيق كل التحسينات
    const applyOptimizations = () => {
      optimizeCSS();
      setTimeout(optimizeDOM, 50);
      setTimeout(optimizeNetwork, 100);
      setTimeout(optimizeMemory, 200);
    };

    // تطبيق فوري
    applyOptimizations();

    // تحسين إضافي عند انخفاض الأداء
    if (speedScore < 70) {
      setTimeout(() => {
        boost();
        console.log('⚡ تم تطبيق تحسينات إضافية للسرعة');
      }, 500);
    }

    return () => {
      // تنظيف عند الخروج
      document.body.classList.remove('lightning-fast');
      const style = document.getElementById('lightning-boost-styles');
      if (style) style.remove();
    };
  }, [boost, speedScore]);

  return null; // مكون غير مرئي
};

export default QuickPerformanceBoost;