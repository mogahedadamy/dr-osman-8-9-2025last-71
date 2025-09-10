import { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';
import { CardSkeleton } from '@/components/mobile/LoadingStates';

// تحسين تحميل الصفحات بشكل lazy
export const OptimizedLazyWrapper = memo(({ 
  Component, 
  fallback = <CardSkeleton />,
  preload = false 
}: {
  Component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  preload?: boolean;
}) => {
  const { optimizations, scheduleOptimizedTask } = useAdvancedPerformance();

  // تحميل مسبق للمكونات المهمة
  useMemo(() => {
    if (preload && optimizations.shouldPreload) {
      scheduleOptimizedTask(() => {
        // Preload component
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        document.head.appendChild(link);
      }, 'low');
    }
  }, [preload, optimizations.shouldPreload, scheduleOptimizedTask]);

  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
});

// تحسين الذاكرة للمكونات الكبيرة
export const MemoryOptimizedComponent = memo(({ 
  children,
  shouldMount = true,
  memoryThreshold = 150 // MB
}: {
  children: React.ReactNode;
  shouldMount?: boolean;
  memoryThreshold?: number;
}) => {
  const { metrics } = useAdvancedPerformance();

  // إخفاء المكونات عند استهلاك ذاكرة عالي
  const shouldRender = useMemo(() => {
    if (!shouldMount) return false;
    if (metrics.memoryUsage > memoryThreshold) {
      console.warn(`⚠️ Memory usage high: ${metrics.memoryUsage.toFixed(1)}MB - Hiding component`);
      return false;
    }
    return true;
  }, [shouldMount, metrics.memoryUsage, memoryThreshold]);

  if (!shouldRender) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-2xl mb-1">🧠</div>
        <p className="text-sm">تم إخفاء هذا المحتوى لتوفير الذاكرة</p>
      </div>
    );
  }

  return <>{children}</>;
});

// تحسين القوائم الطويلة
export const FastList = memo(({ 
  items,
  renderItem,
  maxVisible = 10,
  itemHeight = 60,
  className = ""
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  maxVisible?: number;
  itemHeight?: number;
  className?: string;
}) => {
  const { optimizations } = useAdvancedPerformance();

  // عرض عدد محدود من العناصر للأجهزة البطيئة
  const visibleItems = useMemo(() => {
    if (optimizations.shouldUseVirtualScroll && items.length > maxVisible) {
      return items.slice(0, maxVisible);
    }
    return items;
  }, [items, maxVisible, optimizations.shouldUseVirtualScroll]);

  const loadMore = useCallback(() => {
    // يمكن تطبيق منطق التحميل التدريجي هنا
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleItems.map((item, index) => (
        <div key={index} style={{ minHeight: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {items.length > maxVisible && optimizations.shouldUseVirtualScroll && (
        <div className="text-center p-4">
          <button 
            onClick={loadMore}
            className="text-sm text-primary hover:text-primary-glow transition-colors"
          >
            عرض المزيد ({items.length - maxVisible} عنصر)
          </button>
        </div>
      )}
    </div>
  );
});

// تحسين الصور للسرعة القصوى
export const LightningImage = memo(({ 
  src,
  alt,
  width,
  height,
  className = "",
  priority = false
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}) => {
  const { optimizations } = useAdvancedPerformance();

  const optimizedSrc = useMemo(() => {
    // تحسين جودة الصورة حسب السرعة
    if (optimizations.shouldCompressImages && !priority) {
      // يمكن إضافة معاملات ضغط هنا
      return src;
    }
    return src;
  }, [src, optimizations.shouldCompressImages, priority]);

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{
        contentVisibility: priority ? 'visible' : 'auto',
        containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
      }}
    />
  );
});

export default {
  OptimizedLazyWrapper,
  MemoryOptimizedComponent,
  FastList,
  LightningImage
};