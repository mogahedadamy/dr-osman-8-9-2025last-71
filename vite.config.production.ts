import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Production configuration for deployment
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Remove componentTagger in production
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        // Split chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          utils: ['clsx', 'tailwind-merge', 'date-fns'],
          performance: ['src/hooks/useAdvancedPerformance.ts', 'src/components/performance/'],
          pages: ['src/pages/Chat.tsx', 'src/pages/Library.tsx', 'src/pages/Tools.tsx', 'src/pages/Statistics.tsx']
        },
        // تحسين أسماء الملفات
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800,
    // Enable compression
    reportCompressedSize: true,
    // Optimize assets
    assetsInlineLimit: 8192, // 8kb inline limit
    // تحسين CSS
    cssCodeSplit: true,
    // تقليل حجم البناء
    target: 'es2020',
    // تمكين tree shaking
    modulePreload: {
      polyfill: false
    }
  },
  // Production optimizations
  define: {
    // Remove ALL console statements in production
    'console.log': '(() => {})',
    'console.warn': '(() => {})', 
    'console.error': '(() => {})',
    'console.info': '(() => {})',
    'console.debug': '(() => {})',
    'console.trace': '(() => {})',
    // Global production flag
    __DEV__: false,
    'process.env.NODE_ENV': '"production"'
  }
});