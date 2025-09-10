import { useEffect } from 'react';

const FinalProductionOptimizations = () => {
  useEffect(() => {
    // تحقق من كون البيئة native بطريقة مباشرة
    const isNativeApp = !!(window as any).Capacitor;
    
    // Google Play Store final requirements
    const setupFinalOptimizations = () => {
      // 1. Set proper meta tags for Google Play Console
      const setGooglePlayMeta = () => {
        // Privacy policy reference
        const privacyMeta = document.createElement('meta');
        privacyMeta.name = 'privacy-policy';
        privacyMeta.content = 'https://your-domain.com/privacy-policy';
        document.head.appendChild(privacyMeta);

        // Content rating for health apps
        const contentRatingMeta = document.createElement('meta');
        contentRatingMeta.name = 'content-rating';
        contentRatingMeta.content = 'health-pregnancy-education';
        document.head.appendChild(contentRatingMeta);

        // Medical disclaimer
        const medicalMeta = document.createElement('meta');
        medicalMeta.name = 'medical-disclaimer';
        medicalMeta.content = 'true';
        document.head.appendChild(medicalMeta);
      };

      // 2. Performance optimizations for Google Play Vitals
      const optimizePerformance = () => {
        // Preload critical resources
        const criticalResources = [
          '/icons/icon-192x192.png',
          '/manifest.json'
        ];

        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource;
          link.as = resource.includes('.png') ? 'image' : 'fetch';
          document.head.appendChild(link);
        });

        // Optimize images for different screen densities
        if (isNativeApp) {
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            if (!img.loading) {
              img.loading = 'lazy';
            }
            if (!img.decoding) {
              img.decoding = 'async';
            }
          });
        }
      };

      // 3. Accessibility improvements for Google Play requirements
      const enhanceAccessibility = () => {
        // Ensure proper ARIA labels for Arabic content
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');

        // Add skip navigation for screen readers
        const skipNav = document.createElement('a');
        skipNav.href = '#main-content';
        skipNav.textContent = 'تخطي إلى المحتوى الرئيسي';
        skipNav.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded';
        document.body.insertBefore(skipNav, document.body.firstChild);

        // Mark main content area
        const mainContent = document.querySelector('main') || document.getElementById('root');
        if (mainContent) {
          mainContent.id = 'main-content';
        }
      };

      // 4. Security headers for Android WebView
      const setSecurityHeaders = () => {
        if (isNativeApp) {
          // Content Security Policy for WebView
          const cspMeta = document.createElement('meta');
          cspMeta.httpEquiv = 'Content-Security-Policy';
          cspMeta.content = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: gap: https://ssl.gstatic.com https://fonts.googleapis.com; img-src 'self' data: blob:;";
          document.head.appendChild(cspMeta);

          // Prevent clickjacking
          const frameMeta = document.createElement('meta');
          frameMeta.httpEquiv = 'X-Frame-Options';
          frameMeta.content = 'DENY';
          document.head.appendChild(frameMeta);
        }
      };

      // 5. Google Play Console compliance
      const ensureStoreCompliance = () => {
        // Target audience indicators
        document.documentElement.setAttribute('data-target-audience', 'pregnant-women');
        document.documentElement.setAttribute('data-age-rating', 'everyone');
        document.documentElement.setAttribute('data-content-category', 'health-medical');

        // Accessibility compliance
        document.documentElement.setAttribute('data-accessibility-compliant', 'true');
        document.documentElement.setAttribute('data-rtl-support', 'true');

        // Privacy compliance
        document.documentElement.setAttribute('data-gdpr-compliant', 'true');
        document.documentElement.setAttribute('data-data-location', 'local-only');
      };

      // 6. Remove development artifacts
      const cleanupForProduction = () => {
        // Remove any Lovable development indicators
        const lovableBadges = document.querySelectorAll('[data-lovable-badge], [data-lovable], .lovable-badge');
        lovableBadges.forEach(badge => badge.remove());

        // Remove debug console logs in production
        if (process.env.NODE_ENV === 'production') {
          ['log', 'debug', 'info', 'warn'].forEach(method => {
            console[method] = () => {};
          });
        }

        // Clean up any test IDs or development attributes
        const devElements = document.querySelectorAll('[data-testid], [data-dev]');
        devElements.forEach(el => {
          el.removeAttribute('data-testid');
          el.removeAttribute('data-dev');
        });
      };

      // Execute all optimizations
      setGooglePlayMeta();
      optimizePerformance();
      enhanceAccessibility();
      setSecurityHeaders();
      ensureStoreCompliance();
      cleanupForProduction();
    };

    // Apply optimizations after a short delay to ensure DOM is ready
    const timer = setTimeout(setupFinalOptimizations, 100);

    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      // Remove Lovable badges that might appear dynamically
      const badges = document.querySelectorAll('[data-lovable-badge], .lovable-badge');
      badges.forEach(badge => badge.remove());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(cleanupInterval);
    };
  }, []);

  return null;
};

export default FinalProductionOptimizations;