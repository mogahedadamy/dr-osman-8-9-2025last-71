import { lazy, Suspense } from 'react';
import { CardSkeleton } from '@/components/mobile/LoadingStates';

// تحسين الصفحات بـ lazy loading
const OptimizedChat = lazy(() => import('@/pages/Chat'));
const OptimizedLibrary = lazy(() => import('@/pages/Library'));
const OptimizedTools = lazy(() => import('@/pages/Tools'));
const OptimizedStatistics = lazy(() => import('@/pages/Statistics'));
const OptimizedSettings = lazy(() => import('@/pages/Settings'));
const OptimizedProfile = lazy(() => import('@/pages/Profile'));

// مكون wrapper للصفحات المحسنة
const OptimizedPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<CardSkeleton />}>
    <div className="performance-optimized">
      {children}
    </div>
  </Suspense>
);

// تصدير الصفحات المحسنة
export const FastChat = () => (
  <OptimizedPageWrapper>
    <OptimizedChat />
  </OptimizedPageWrapper>
);

export const FastLibrary = () => (
  <OptimizedPageWrapper>
    <OptimizedLibrary />
  </OptimizedPageWrapper>
);

export const FastTools = () => (
  <OptimizedPageWrapper>
    <OptimizedTools />
  </OptimizedPageWrapper>
);

export const FastStatistics = () => (
  <OptimizedPageWrapper>
    <OptimizedStatistics />
  </OptimizedPageWrapper>
);

export const FastSettings = () => (
  <OptimizedPageWrapper>
    <OptimizedSettings />
  </OptimizedPageWrapper>
);

export const FastProfile = () => (
  <OptimizedPageWrapper>
    <OptimizedProfile />
  </OptimizedPageWrapper>
);

export default {
  FastChat,
  FastLibrary,
  FastTools,
  FastStatistics,
  FastSettings,
  FastProfile
};