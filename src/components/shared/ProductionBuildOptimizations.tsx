import React, { useEffect } from 'react';

const ProductionBuildOptimizations = () => {
  useEffect(() => {
    // Disable console logs in production
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }

    // Remove Lovable development indicators
    const removeLovableBadge = () => {
      const badge = document.querySelector('[data-lovable-badge]');
      if (badge) {
        badge.remove();
      }
    };

    // Performance optimizations
    const optimizeForMobile = () => {
      // Preload critical resources
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = '/icons/icon-192x192.png';
      link.as = 'image';
      document.head.appendChild(link);

      // Optimize viewport for mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    };

    // Initialize optimizations
    removeLovableBadge();
    optimizeForMobile();

    // Set up interval to ensure badge stays removed
    const interval = setInterval(removeLovableBadge, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default ProductionBuildOptimizations;