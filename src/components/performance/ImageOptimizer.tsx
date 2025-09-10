import { useState, useEffect, useRef, memo } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  fallback?: string;
}

const ImageOptimizer = memo(({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  fallback = '/icons/icon-192x192.png'
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const { optimizations } = useAdvancedPerformance();

  // تحسين مصدر الصورة بناءً على جودة الشبكة
  useEffect(() => {
    const optimizeSrc = () => {
      let newSrc = src;
      
      // تقليل الجودة للشبكات البطيئة
      if (optimizations.shouldCompressImages && quality > 60) {
        // يمكن إضافة منطق لضغط الصور هنا
        // مثلاً: تحويل إلى WebP أو تقليل الجودة
        newSrc = src;
      }

      // تحسين الحجم للأجهزة البطيئة
      if (optimizations.shouldLazyLoad && width && height) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const maxWidth = width * devicePixelRatio;
        const maxHeight = height * devicePixelRatio;
        
        // يمكن إضافة منطق لتغيير حجم الصورة
        newSrc = src;
      }

      setOptimizedSrc(newSrc);
    };

    optimizeSrc();
  }, [src, quality, width, height, optimizations]);

  // Intersection Observer للـ lazy loading
  useEffect(() => {
    if (priority || !optimizations.shouldLazyLoad) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, optimizations.shouldLazyLoad]);

  // معالجة تحميل الصورة
  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  // إنشاء placeholder
  const renderPlaceholder = () => {
    if (placeholder === 'blur') {
      return (
        <div
          className={`bg-muted animate-pulse ${className}`}
          style={{
            width: width || '100%',
            height: height || 'auto',
            aspectRatio: width && height ? `${width}/${height}` : undefined
          }}
        />
      );
    }

    return (
      <div
        className={`bg-muted/30 ${className}`}
        style={{
          width: width || '100%',
          height: height || 'auto',
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
    );
  };

  // إذا لم تكن الصورة في المنطقة المرئية، اعرض placeholder
  if (!isInView) {
    return <div ref={imgRef}>{renderPlaceholder()}</div>;
  }

  return (
    <div ref={imgRef} className="relative">
      {/* Placeholder أثناء التحميل */}
      {!isLoaded && !error && renderPlaceholder()}
      
      {/* الصورة الفعلية */}
      <img
        src={error ? fallback : optimizedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          position: isLoaded ? 'static' : 'absolute',
          top: isLoaded ? 'auto' : 0,
          left: isLoaded ? 'auto' : 0,
          contentVisibility: 'auto',
          containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
        }}
      />
      
      {/* مؤشر الخطأ */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground text-sm">
          ⚠️ خطأ في تحميل الصورة
        </div>
      )}
    </div>
  );
});

ImageOptimizer.displayName = 'ImageOptimizer';

// مكون لتحسين عرض مجموعة من الصور
interface ImageGalleryOptimizerProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  itemClassName?: string;
  priority?: number; // عدد الصور ذات الأولوية
}

export const ImageGalleryOptimizer = memo(({
  images,
  className = '',
  itemClassName = '',
  priority = 3
}: ImageGalleryOptimizerProps) => {
  const { optimizations } = useAdvancedPerformance();
  
  return (
    <div className={className}>
      {images.map((image, index) => (
        <div key={index} className={itemClassName}>
          <ImageOptimizer
            {...image}
            priority={index < priority}
            quality={optimizations.shouldCompressImages ? 70 : 85}
          />
        </div>
      ))}
    </div>
  );
});

ImageGalleryOptimizer.displayName = 'ImageGalleryOptimizer';

export default ImageOptimizer;