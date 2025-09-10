import { ReactNode, Suspense, Component } from "react";
import { CardSkeleton } from "./LoadingStates";

// Simple Error Boundary since react-error-boundary isn't installed
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

// Error fallback component
const ErrorFallback = () => (
  <div className="p-4 text-center">
    <div className="text-4xl mb-2">⚠️</div>
    <h3 className="text-lg font-semibold mb-2 text-foreground">حدث خطأ غير متوقع</h3>
    <p className="text-sm text-muted-foreground mb-4">نعتذر، حدث خطأ أثناء تحميل هذا المحتوى</p>
    <button 
      onClick={() => window.location.reload()}
      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm"
    >
      إعادة المحاولة
    </button>
  </div>
);

// Lazy wrapper with error handling
export const LazyComponent = ({ 
  children, 
  fallback = <CardSkeleton />, 
  errorFallback = <ErrorFallback />
}: LazyComponentProps) => (
  <ErrorBoundary fallback={errorFallback}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Virtual scrolling for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ReactNode;
  className?: string;
}

export const VirtualScroll = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ""
}: VirtualScrollProps) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
  
  return (
    <div className={`overflow-auto mobile-scroll ${className}`} style={{ height: containerHeight }}>
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {items.slice(0, visibleCount).map((item, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Image optimization wrapper
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  lazy = true
}: OptimizedImageProps) => (
  <img
    src={src}
    alt={alt}
    className={className}
    width={width}
    height={height}
    loading={lazy ? "lazy" : "eager"}
    decoding="async"
    style={{
      contentVisibility: lazy ? 'auto' : 'visible',
      containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
    }}
  />
);

// Intersection observer hook for lazy loading
import { useState, useEffect, useRef } from "react";

export const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible] as const;
};