import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVideoOffline } from '@/hooks/useVideoOffline';
import { articlesData, ArticleContent } from '@/data/articlesData';
import { encyclopediaData, EncyclopediaEntry } from '@/data/encyclopediaData';
import { osmanTipsData, OsmanTip } from '@/data/osmanTipsData';

export interface OfflineContent {
  id: string;
  type: 'article' | 'video' | 'encyclopedia' | 'tip';
  title: string;
  content: any;
  downloadedAt: string;
  size: number; // بالبايت
  lastAccessed?: string;
}

export interface StorageStats {
  totalSize: number;
  availableSpace: number;
  usedSpace: number;
  itemCount: number;
  lastCleanup?: string;
}

export const useOfflineContent = () => {
  const { toast } = useToast();
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalSize: 0,
    availableSpace: 0,
    usedSpace: 0,
    itemCount: 0
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: number}>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة النظام
  useEffect(() => {
    initializeOfflineStorage();
  }, []);

  // تهيئة التخزين المحلي
  const initializeOfflineStorage = async () => {
    try {
      const stored = localStorage.getItem('offlineContent');
      if (stored) {
        const content = JSON.parse(stored);
        setOfflineContent(content);
      }
      
      updateStorageStats();
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing offline storage:', error);
      toast({
        title: "خطأ في التخزين",
        description: "حدث خطأ في تهيئة نظام القراءة أوفلاين",
        variant: "destructive"
      });
    }
  };

  // تحديث إحصائيات التخزين
  const updateStorageStats = () => {
    try {
      const stored = localStorage.getItem('offlineContent');
      const content: OfflineContent[] = stored ? JSON.parse(stored) : [];
      
      const totalSize = content.reduce((sum, item) => sum + item.size, 0);
      
      // تقدير المساحة المتاحة (5MB كحد أقصى للتخزين المحلي)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const availableSpace = Math.max(0, maxSize - totalSize);
      
      setStorageStats({
        totalSize: maxSize,
        usedSpace: totalSize,
        availableSpace,
        itemCount: content.length,
        lastCleanup: localStorage.getItem('lastCleanup') || undefined
      });
    } catch (error) {
      console.error('Error updating storage stats:', error);
    }
  };

  // حفظ المحتوى أوفلاين
  const saveContentOffline = async (contentId: string, type: 'article' | 'video' | 'encyclopedia' | 'tip'): Promise<boolean> => {
    setIsDownloading(true);
    setDownloadProgress(prev => ({ ...prev, [contentId]: 0 }));

    try {
      let content: any;
      let title: string;
      let contentData: any;

      // جلب البيانات حسب النوع
      switch (type) {
        case 'article':
          contentData = Object.values(articlesData).find(article => article.id.toString() === contentId);
          if (!contentData) throw new Error('المقال غير موجود');
          title = contentData.title;
          content = contentData;
          break;
          
        case 'encyclopedia':
          contentData = encyclopediaData.find(entry => entry.id === contentId);
          if (!contentData) throw new Error('المدخل غير موجود في الموسوعة');
          title = contentData.title;
          content = contentData;
          break;
          
        case 'video':
          // محاكاة بيانات الفيديو (في التطبيق الحقيقي ستأتي من API)
          contentData = { id: contentId, title: `فيديو ${contentId}`, description: 'محتوى الفيديو' };
          title = contentData.title;
          content = contentData;
          break;
          
        case 'tip':
          contentData = osmanTipsData.find(tip => tip.id === contentId);
          if (!contentData) throw new Error('النصيحة غير موجودة');
          title = contentData.title;
          content = contentData;
          break;
          
        default:
          throw new Error('نوع محتوى غير مدعوم');
      }

      // محاكاة تحميل تدريجي
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(prev => ({ ...prev, [contentId]: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // حساب حجم المحتوى (تقريبي)
      const contentSize = JSON.stringify(content).length * 2; // تقدير بالبايت

      // التحقق من المساحة المتاحة
      if (contentSize > storageStats.availableSpace) {
        throw new Error('مساحة التخزين غير كافية');
      }

      const offlineItem: OfflineContent = {
        id: `${type}-${contentId}`,
        type,
        title,
        content,
        downloadedAt: new Date().toISOString(),
        size: contentSize
      };

      // حفظ في التخزين المحلي
      const existingContent = [...offlineContent];
      const existingIndex = existingContent.findIndex(item => item.id === offlineItem.id);
      
      if (existingIndex >= 0) {
        existingContent[existingIndex] = offlineItem;
      } else {
        existingContent.push(offlineItem);
      }

      localStorage.setItem('offlineContent', JSON.stringify(existingContent));
      setOfflineContent(existingContent);
      updateStorageStats();

      toast({
        title: "تم الحفظ بنجاح",
        description: `تم حفظ "${title}" للقراءة أوفلاين`,
      });

      return true;
    } catch (error) {
      console.error('Error saving content offline:', error);
      toast({
        title: "فشل في الحفظ",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDownloading(false);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[contentId];
        return newProgress;
      });
    }
  };

  // حذف محتوى أوفلاين
  const removeOfflineContent = (contentId: string) => {
    const updatedContent = offlineContent.filter(item => item.id !== contentId);
    localStorage.setItem('offlineContent', JSON.stringify(updatedContent));
    setOfflineContent(updatedContent);
    updateStorageStats();

    const removedItem = offlineContent.find(item => item.id === contentId);
    if (removedItem) {
      toast({
        title: "تم الحذف",
        description: `تم حذف "${removedItem.title}" من القراءة أوفلاين`,
      });
    }
  };

  // جلب محتوى محفوظ
  const getOfflineContent = (contentId: string): OfflineContent | null => {
    const content = offlineContent.find(item => item.id === contentId);
    if (content) {
      // تحديث وقت آخر وصول
      const updatedContent = offlineContent.map(item => 
        item.id === contentId 
          ? { ...item, lastAccessed: new Date().toISOString() }
          : item
      );
      localStorage.setItem('offlineContent', JSON.stringify(updatedContent));
      setOfflineContent(updatedContent);
    }
    return content || null;
  };

  // التحقق من توفر المحتوى أوفلاين
  const isContentAvailableOffline = (contentId: string, type: string): boolean => {
    return offlineContent.some(item => item.id === `${type}-${contentId}`);
  };

  // تنظيف التخزين (حذف المحتوى القديم)
  const cleanupStorage = (daysOld: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const filteredContent = offlineContent.filter(item => {
      const downloadDate = new Date(item.downloadedAt);
      return downloadDate > cutoffDate;
    });

    localStorage.setItem('offlineContent', JSON.stringify(filteredContent));
    localStorage.setItem('lastCleanup', new Date().toISOString());
    
    setOfflineContent(filteredContent);
    updateStorageStats();

    const removedCount = offlineContent.length - filteredContent.length;
    if (removedCount > 0) {
      toast({
        title: "تم تنظيف التخزين",
        description: `تم حذف ${removedCount} عنصر قديم لتوفير مساحة`,
      });
    }
  };

  // تحديث جميع المحتوى المحفوظ
  const syncOfflineContent = async () => {
    setIsDownloading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of offlineContent) {
      try {
        const [type, id] = item.id.split('-');
        if (['article', 'video', 'encyclopedia', 'tip'].includes(type)) {
          const success = await saveContentOffline(id, type as 'article' | 'video' | 'encyclopedia' | 'tip');
          if (success) successCount++;
          else errorCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setIsDownloading(false);

    toast({
      title: "تم التحديث",
      description: `نجح: ${successCount}، فشل: ${errorCount}`,
    });
  };

  // تحميل مجموعة محتوى (مثل جميع مقالات فئة معينة)
  const downloadContentBatch = async (contentIds: {id: string, type: 'article' | 'video' | 'encyclopedia' | 'tip'}[]) => {
    setIsDownloading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const { id, type } of contentIds) {
      try {
        const success = await saveContentOffline(id, type);
        if (success) successCount++;
        else errorCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsDownloading(false);

    toast({
      title: "تم التحميل المجمع",
      description: `تم حفظ ${successCount} من أصل ${contentIds.length} عنصر`,
    });
  };

  // تصدير المحتوى المحفوظ
  const exportOfflineContent = () => {
    try {
      const dataStr = JSON.stringify(offlineContent, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `offline-content-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم التصدير",
        description: "تم تصدير المحتوى المحفوظ بنجاح",
      });
    } catch (error) {
      toast({
        title: "فشل التصدير",
        description: "حدث خطأ أثناء تصدير المحتوى",
        variant: "destructive"
      });
    }
  };

  // استيراد محتوى محفوظ
  const importOfflineContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedContent = JSON.parse(e.target?.result as string);
        localStorage.setItem('offlineContent', JSON.stringify(importedContent));
        setOfflineContent(importedContent);
        updateStorageStats();
        
        toast({
          title: "تم الاستيراد",
          description: `تم استيراد ${importedContent.length} عنصر`,
        });
      } catch (error) {
        toast({
          title: "فشل الاستيراد",
          description: "تأكد من صحة ملف البيانات",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  // فلترة المحتوى المحفوظ
  const getOfflineContentByType = (type: 'article' | 'video' | 'encyclopedia' | 'tip'): OfflineContent[] => {
    return offlineContent.filter(item => item.type === type);
  };

  // البحث في المحتوى المحفوظ
  const searchOfflineContent = (query: string): OfflineContent[] => {
    const searchTerm = query.toLowerCase();
    return offlineContent.filter(item => 
      item.title.toLowerCase().includes(searchTerm)
    );
  };

  return {
    offlineContent,
    storageStats,
    isDownloading,
    downloadProgress,
    isInitialized,
    saveContentOffline,
    removeOfflineContent,
    getOfflineContent,
    isContentAvailableOffline,
    cleanupStorage,
    syncOfflineContent,
    downloadContentBatch,
    exportOfflineContent,
    importOfflineContent,
    getOfflineContentByType,
    searchOfflineContent,
    updateStorageStats
  };
};