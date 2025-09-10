// Hook لإدارة المحتوى الديناميكي
import React from 'react';
import { DynamicContent, ContentCategory, SyncStatus } from '@/types/cms';
import { contentService } from '@/services/contentService';

export interface UseDynamicContentOptions {
  type?: string;
  category?: string;
  accessLevel?: 'free' | 'premium';
  autoSync?: boolean;
  syncInterval?: number;
}

export function useDynamicContent(options: UseDynamicContentOptions = {}) {
  const [content, setContent] = React.useState<DynamicContent[]>([]);
  const [categories, setCategories] = React.useState<ContentCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(contentService.getSyncStatus());

  // تحميل المحتوى
  const loadContent = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [contentData, categoriesData] = await Promise.all([
        contentService.getAllContent({
          type: options.type,
          category: options.category,
          accessLevel: options.accessLevel,
          published: true
        }),
        contentService.getCategories()
      ]);

      setContent(contentData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل المحتوى');
    } finally {
      setLoading(false);
    }
  }, [options.type, options.category, options.accessLevel]);

  // مزامنة المحتوى
  const syncContent = React.useCallback(async (force: boolean = false) => {
    try {
      await contentService.syncContent(force);
      setSyncStatus(contentService.getSyncStatus());
      await loadContent(); // إعادة تحميل المحتوى بعد المزامنة
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في المزامنة');
    }
  }, [loadContent]);

  // البحث في المحتوى
  const searchContent = React.useCallback(async (query: string): Promise<DynamicContent[]> => {
    try {
      const results = await contentService.searchContent(query, options.type);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في البحث');
      return [];
    }
  }, [options.type]);

  // تتبع مشاهدة المحتوى
  const trackView = React.useCallback(async (contentId: string) => {
    try {
      await contentService.trackContentView(contentId);
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  }, []);

  // جلب محتوى واحد
  const getContentById = React.useCallback(async (id: string): Promise<DynamicContent | null> => {
    try {
      const content = await contentService.getContentById(id);
      if (content) {
        await trackView(id);
      }
      return content;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في جلب المحتوى');
      return null;
    }
  }, [trackView]);

  // تحميل أولي
  React.useEffect(() => {
    loadContent();
  }, [loadContent]);

  // تحميل من التخزين المحلي عند البدء
  React.useEffect(() => {
    contentService.loadFromLocalStorage().then(() => {
      loadContent();
    });
  }, [loadContent]);

  // مزامنة تلقائية
  React.useEffect(() => {
    if (options.autoSync && options.syncInterval) {
      const interval = setInterval(() => {
        syncContent();
      }, options.syncInterval * 60 * 1000); // تحويل من دقائق لميلي ثانية

      return () => clearInterval(interval);
    }
  }, [options.autoSync, options.syncInterval, syncContent]);

  // مراقبة حالة الاتصال
  React.useEffect(() => {
    const handleOnline = () => {
      syncContent();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncContent]);

  return {
    // البيانات
    content,
    categories,
    loading,
    error,
    syncStatus,
    
    // الوظائف
    loadContent,
    syncContent,
    searchContent,
    getContentById,
    trackView,
    
    // معلومات إضافية
    hasContent: content.length > 0,
    cacheSize: contentService.getCacheSize(),
    isOnline: navigator.onLine
  };
}