import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadMore?: () => void;
  hasMore?: boolean;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  getItemKey = (_, index) => index.toString(),
  onScroll,
  loading = false,
  loadMore,
  hasMore = false
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const { optimizations, scheduleOptimizedTask } = useAdvancedPerformance();

  // حساب العناصر المرئية
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // إضافة overscan للحصول على أداء أفضل
    const overscanStart = Math.max(0, startIndex - overscan);
    const overscanEnd = Math.min(items.length - 1, endIndex + overscan);

    return {
      startIndex: overscanStart,
      endIndex: overscanEnd,
      visibleStartIndex: startIndex,
      visibleEndIndex: endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // العناصر المرئية
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // معالجة التمرير
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    scheduleOptimizedTask(() => {
      setScrollTop(scrollTop);
      onScroll?.(scrollTop);
      
      // تحميل المزيد إذا اقترب من النهاية
      if (loadMore && hasMore && !loading) {
        const scrollHeight = e.currentTarget.scrollHeight;
        const clientHeight = e.currentTarget.clientHeight;
        const scrollPosition = scrollTop + clientHeight;
        
        if (scrollPosition >= scrollHeight - (itemHeight * 3)) {
          loadMore();
        }
      }
    }, 'normal');
  }, [scheduleOptimizedTask, onScroll, loadMore, hasMore, loading, itemHeight]);

  // تحسين الأداء للأجهزة البطيئة
  const throttledHandleScroll = useMemo(() => {
    if (!optimizations.shouldUseVirtualScroll) {
      return handleScroll;
    }

    let timeoutId: NodeJS.Timeout;
    return (e: React.UIEvent<HTMLDivElement>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleScroll(e), 16); // ~60fps
    };
  }, [handleScroll, optimizations.shouldUseVirtualScroll]);

  // إجمالي الارتفاع
  const totalHeight = items.length * itemHeight;

  // ارتفاع المساحة قبل العناصر المرئية
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={throttledHandleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={getItemKey(item, actualIndex)}
                style={{
                  height: itemHeight,
                  overflow: 'hidden'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
          
          {/* مؤشر التحميل */}
          {loading && (
            <div
              style={{ height: itemHeight }}
              className="flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="mr-2 text-sm text-muted-foreground">جاري التحميل...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook لاستخدام القائمة الافتراضية المحسنة
export const useVirtualizedList = <T,>(
  items: T[],
  options: {
    itemHeight?: number;
    containerHeight?: number;
    batchSize?: number;
  } = {}
) => {
  const {
    itemHeight = 60,
    containerHeight = 400,
    batchSize = 50
  } = options;

  const { optimizations } = useAdvancedPerformance();
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  // تحميل دفعي للعناصر
  useEffect(() => {
    if (optimizations.shouldUseVirtualScroll && items.length > batchSize) {
      setDisplayedItems(items.slice(0, batchSize));
    } else {
      setDisplayedItems(items);
    }
  }, [items, batchSize, optimizations.shouldUseVirtualScroll]);

  const loadMore = useCallback(() => {
    if (loading || displayedItems.length >= items.length) return;

    setLoading(true);
    
    setTimeout(() => {
      const nextBatch = items.slice(
        displayedItems.length,
        displayedItems.length + batchSize
      );
      setDisplayedItems(prev => [...prev, ...nextBatch]);
      setLoading(false);
    }, 100);
  }, [items, displayedItems.length, batchSize, loading]);

  const hasMore = displayedItems.length < items.length;

  return {
    displayedItems,
    loading,
    hasMore,
    loadMore,
    itemHeight,
    containerHeight,
    shouldUseVirtualization: optimizations.shouldUseVirtualScroll
  };
};

export default VirtualizedList;