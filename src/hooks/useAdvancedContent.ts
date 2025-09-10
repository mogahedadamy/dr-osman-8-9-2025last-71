// Hook متقدم لإدارة المحتوى مع إمكانيات محسّنة
import { useState, useEffect, useCallback } from 'react';
import { DynamicContent, ContentCategory, SyncStatus } from '@/types/cms';
import { advancedContentService } from '@/services/advancedContentService';

interface UseAdvancedContentOptions {
  type?: string;
  category?: string;
  accessLevel?: 'free' | 'premium';
  autoSync?: boolean;
  syncInterval?: number;
  enableRealtime?: boolean;
  cacheEnabled?: boolean;
}

interface ContentFilters {
  search?: string;
  type?: string;
  category?: string;
  accessLevel?: 'free' | 'premium' | 'all';
  published?: boolean;
  authorId?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'newest' | 'oldest' | 'popular' | 'rating' | 'views';
  limit?: number;
  offset?: number;
}

export function useAdvancedContent(options: UseAdvancedContentOptions = {}) {
  const [content, setContent] = useState<DynamicContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(advancedContentService.getSyncStatus());
  const [filters, setFilters] = useState<ContentFilters>({});

  // تحميل المحتوى
  const loadContent = useCallback(async (customFilters?: ContentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const activeFilters = { ...filters, ...customFilters };
      
      const [contentData, categoriesData] = await Promise.all([
        advancedContentService.getAllContent({
          type: activeFilters.type || options.type,
          category: activeFilters.category || options.category,
          accessLevel: activeFilters.accessLevel === 'all' ? undefined : (activeFilters.accessLevel || options.accessLevel),
          published: activeFilters.published,
          authorId: activeFilters.authorId,
          search: activeFilters.search,
          limit: activeFilters.limit,
          offset: activeFilters.offset
        }),
        advancedContentService.getCategories()
      ]);

      // تطبيق الترتيب
      let sortedContent = [...contentData];
      if (activeFilters.sortBy) {
        sortedContent = sortContent(sortedContent, activeFilters.sortBy);
      }

      setContent(sortedContent);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل المحتوى');
    } finally {
      setLoading(false);
    }
  }, [filters, options.type, options.category, options.accessLevel]);

  // مزامنة المحتوى
  const syncContent = useCallback(async (force = false) => {
    try {
      setSyncing(true);
      await advancedContentService.syncWithServer(force);
      setSyncStatus(advancedContentService.getSyncStatus());
      await loadContent(); // إعادة تحميل بعد المزامنة
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في المزامنة');
    } finally {
      setSyncing(false);
    }
  }, [loadContent]);

  // البحث في المحتوى
  const searchContent = useCallback(async (query: string, searchFilters?: ContentFilters) => {
    return loadContent({ ...searchFilters, search: query });
  }, [loadContent]);

  // جلب محتوى واحد
  const getContentById = useCallback(async (id: string): Promise<DynamicContent | null> => {
    try {
      const content = await advancedContentService.getContentById(id);
      return content;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في جلب المحتوى');
      return null;
    }
  }, []);

  // إنشاء محتوى جديد
  const createContent = useCallback(async (contentData: Omit<DynamicContent, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    try {
      const newContent = await advancedContentService.createContent(contentData);
      await loadContent(); // إعادة تحميل القائمة
      return newContent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في إنشاء المحتوى');
      throw err;
    }
  }, [loadContent]);

  // تحديث محتوى
  const updateContent = useCallback(async (id: string, updates: Partial<DynamicContent>) => {
    try {
      const updatedContent = await advancedContentService.updateContent(id, updates);
      await loadContent(); // إعادة تحميل القائمة
      return updatedContent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحديث المحتوى');
      throw err;
    }
  }, [loadContent]);

  // حذف محتوى
  const deleteContent = useCallback(async (id: string) => {
    try {
      const success = await advancedContentService.deleteContent(id);
      if (success) {
        await loadContent(); // إعادة تحميل القائمة
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في حذف المحتوى');
      throw err;
    }
  }, [loadContent]);

  // نشر/إلغاء نشر محتوى
  const togglePublish = useCallback(async (id: string, publish: boolean) => {
    try {
      const success = publish 
        ? await advancedContentService.publishContent(id)
        : await advancedContentService.unpublishContent(id);
      
      if (success) {
        await loadContent(); // إعادة تحميل القائمة
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تغيير حالة النشر');
      throw err;
    }
  }, [loadContent]);

  // تتبع مشاهدة المحتوى
  const trackView = useCallback(async (contentId: string) => {
    try {
      await advancedContentService.trackView(contentId);
      // تحديث العداد محلياً لتحسين الأداء
      setContent(prev => prev.map(item => 
        item.id === contentId 
          ? { ...item, views: item.views + 1 }
          : item
      ));
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  }, []);

  // تطبيق الفلاتر
  const applyFilters = useCallback((newFilters: ContentFilters) => {
    setFilters(newFilters);
    loadContent(newFilters);
  }, [loadContent]);

  // مسح الفلاتر
  const clearFilters = useCallback(() => {
    setFilters({});
    loadContent({});
  }, [loadContent]);

  // تحميل أولي
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // مزامنة تلقائية
  useEffect(() => {
    if (options.autoSync && options.syncInterval) {
      const interval = setInterval(() => {
        syncContent();
      }, options.syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [options.autoSync, options.syncInterval, syncContent]);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => {
      if (options.autoSync) {
        syncContent();
      }
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
  }, [options.autoSync, syncContent]);

  // وظائف مساعدة
  const sortContent = (content: DynamicContent[], sortBy: string): DynamicContent[] => {
    switch (sortBy) {
      case 'newest':
        return content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return content.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'popular':
        return content.sort((a, b) => b.views - a.views);
      case 'views':
        return content.sort((a, b) => b.views - a.views);
      default:
        return content;
    }
  };

  const getContentStats = useCallback(() => {
    return {
      total: content.length,
      published: content.filter(c => c.isPublished).length,
      draft: content.filter(c => !c.isPublished).length,
      free: content.filter(c => c.accessLevel === 'free').length,
      premium: content.filter(c => c.accessLevel === 'premium').length,
      totalViews: content.reduce((sum, c) => sum + c.views, 0),
      byType: {
        articles: content.filter(c => c.type === 'article').length,
        videos: content.filter(c => c.type === 'video').length,
        tips: content.filter(c => c.type === 'tip').length,
        encyclopedia: content.filter(c => c.type === 'encyclopedia').length
      },
      popularContent: content
        .filter(c => c.isPublished)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
    };
  }, [content]);

  return {
    // البيانات
    content,
    categories,
    loading,
    syncing,
    error,
    syncStatus,
    filters,
    
    // الوظائف الأساسية
    loadContent,
    syncContent,
    searchContent,
    getContentById,
    trackView,
    
    // إدارة المحتوى
    createContent,
    updateContent,
    deleteContent,
    togglePublish,
    
    // الفلاتر
    applyFilters,
    clearFilters,
    
    // الإحصائيات والمعلومات
    getContentStats,
    hasContent: content.length > 0,
    isOnline: syncStatus.isOnline,
    hasPendingChanges: syncStatus.pendingChanges > 0,
    
    // معلومات الفلاتر النشطة
    activeFilters: filters,
    isFiltered: Object.keys(filters).some(key => 
      filters[key as keyof ContentFilters] !== undefined && 
      filters[key as keyof ContentFilters] !== ''
    )
  };
}