import { lazy, Suspense, memo, useEffect, useState } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';
import { CardSkeleton } from '@/components/mobile/LoadingStates';

interface LazyComponentWrapperProps {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  delay?: number;
  threshold?: number;
  children?: React.ReactNode;
  componentProps?: any;
}

const LazyComponentWrapper = memo(({
  importFunc,
  fallback = <CardSkeleton />,
  delay = 0,
  threshold = 0.1,
  componentProps = {}
}: LazyComponentWrapperProps) => {
  const [LazyComponent, setLazyComponent] = useState<React.ComponentType<any> | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const { optimizations, scheduleOptimizedTask } = useAdvancedPerformance();

  // Intersection Observer للتحكم في متى يتم تحميل المكون
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // تأخير التحميل بناءً على إعدادات الأداء
          const loadDelay = optimizations.shouldLazyLoad ? delay : 0;
          
          scheduleOptimizedTask(() => {
            setShouldLoad(true);
          }, 'normal');
          
          if (loadDelay > 0) {
            setTimeout(() => setShouldLoad(true), loadDelay);
          } else {
            setShouldLoad(true);
          }
          
          observer.disconnect();
        }
      },
      { threshold }
    );

    const element = document.createElement('div');
    element.style.height = '1px';
    
    return () => observer.disconnect();
  }, [delay, threshold, optimizations.shouldLazyLoad, scheduleOptimizedTask]);

  // تحميل المكون عند الحاجة
  useEffect(() => {
    if (shouldLoad && !LazyComponent) {
      scheduleOptimizedTask(async () => {
        try {
          const module = await importFunc();
          setLazyComponent(() => module.default);
        } catch (error) {
          console.error('خطأ في تحميل المكون:', error);
        }
      }, 'high');
    }
  }, [shouldLoad, LazyComponent, importFunc, scheduleOptimizedTask]);

  // إذا لم يكن المكون مرئياً بعد، اعرض placeholder
  if (!isVisible) {
    return <div style={{ minHeight: '100px' }} />;
  }

  // إذا لم يتم تحميل المكون بعد، اعرض fallback
  if (!LazyComponent) {
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...componentProps} />
    </Suspense>
  );
});

LazyComponentWrapper.displayName = 'LazyComponentWrapper';

// Hook لإنشاء lazy components محسنة
export const useLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  options: {
    preload?: boolean;
    delay?: number;
    threshold?: number;
  } = {}
) => {
  const { optimizations } = useAdvancedPerformance();
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (options.preload && optimizations.shouldPreload) {
      // تحميل مسبق للمكونات المهمة
      importFunc().then(module => {
        setComponent(() => module.default);
      });
    }
  }, [importFunc, options.preload, optimizations.shouldPreload]);

  const LazyWrapper = memo((props: any) => (
    <LazyComponentWrapper
      importFunc={importFunc}
      delay={options.delay}
      threshold={options.threshold}
      componentProps={props}
    />
  ));

  LazyWrapper.displayName = 'LazyWrapper';

  return Component || LazyWrapper;
};

// مكونات lazy محسنة للتطبيق
export const LazyChat = () => {
  const ChatComponent = useLazyComponent(
    () => import('@/pages/Chat'),
    { preload: true, delay: 100 }
  );
  return <ChatComponent />;
};

export const LazyLibrary = () => {
  const LibraryComponent = useLazyComponent(
    () => import('@/pages/Library'),
    { delay: 200, threshold: 0.2 }
  );
  return <LibraryComponent />;
};

export const LazyTools = () => {
  const ToolsComponent = useLazyComponent(
    () => import('@/pages/Tools'),
    { delay: 300, threshold: 0.3 }
  );
  return <ToolsComponent />;
};

export const LazyStatistics = () => {
  const StatisticsComponent = useLazyComponent(
    () => import('@/pages/Statistics'),
    { delay: 400, threshold: 0.3 }
  );
  return <StatisticsComponent />;
};

export default LazyComponentWrapper;