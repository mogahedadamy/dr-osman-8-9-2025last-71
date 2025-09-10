import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { dbOperations, localDB } from '@/lib/localDatabase';

export interface DataBackup {
  version: string;
  timestamp: string;
  userData: {
    profile: any;
    preferences: any;
    pregnancy: any;
    health: any;
  };
  content: {
    favorites: any[];
    readingHistory: any[];
    notes: any[];
    reminders: any[];
  };
  analytics: {
    usage: any[];
    interactions: any[];
  };
}

export interface SyncStatus {
  lastSync: string | null;
  pendingChanges: number;
  conflicts: number;
  status: 'idle' | 'syncing' | 'error' | 'success';
}

/**
 * Hook متقدم لإدارة البيانات والمزامنة والنسخ الاحتياطي
 */
export const useDataManager = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    pendingChanges: 0,
    conflicts: 0,
    status: 'idle'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 0,
    percentage: 0
  });

  // حساب استخدام التخزين
  const calculateStorageUsage = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        const percentage = total > 0 ? (used / total) * 100 : 0;

        setStorageUsage({
          used: Math.round(used / 1024 / 1024), // MB
          total: Math.round(total / 1024 / 1024), // MB
          percentage: Math.round(percentage)
        });
      } catch (error) {
        console.error('Error calculating storage:', error);
      }
    }
  }, []);

  // إنشاء نسخة احتياطية شاملة
  const createFullBackup = useCallback(async (): Promise<DataBackup> => {
    try {
      setIsExporting(true);

      // جمع بيانات المستخدم
      const [
        profile,
        preferences,
        pregnancy,
        health,
        favorites,
        readingHistory,
        notes,
        reminders,
        usage,
        interactions
      ] = await Promise.all([
        dbOperations.getSetting('userProfile'),
        dbOperations.getSetting('userPreferences'),
        dbOperations.getSetting('pregnancyData'),
        dbOperations.getSetting('healthData'),
        dbOperations.getFavorites(),
        dbOperations.getSetting('readingHistory'),
        dbOperations.getSetting('userNotes'),
        dbOperations.getReminders(),
        dbOperations.getSetting('usageAnalytics'),
        dbOperations.getSetting('userInteractions')
      ]);

      const backup: DataBackup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        userData: {
          profile: profile ? JSON.parse(profile) : null,
          preferences: preferences ? JSON.parse(preferences) : null,
          pregnancy: pregnancy ? JSON.parse(pregnancy) : null,
          health: health ? JSON.parse(health) : null,
        },
        content: {
          favorites: favorites || [],
          readingHistory: readingHistory ? JSON.parse(readingHistory) : [],
          notes: notes ? JSON.parse(notes) : [],
          reminders: reminders || [],
        },
        analytics: {
          usage: usage ? JSON.parse(usage) : [],
          interactions: interactions ? JSON.parse(interactions) : [],
        }
      };

      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('فشل في إنشاء النسخة الاحتياطية');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // تصدير البيانات كملف
  const exportData = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      const backup = await createFullBackup();
      
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(backup, null, 2);
        filename = `pregnancy-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // تحويل إلى CSV للبيانات المهمة
        const csvRows = [
          'التاريخ,النوع,البيانات',
          `${backup.timestamp},ملف المستخدم,"${JSON.stringify(backup.userData.profile)}"`,
          `${backup.timestamp},التفضيلات,"${JSON.stringify(backup.userData.preferences)}"`,
          `${backup.timestamp},بيانات الحمل,"${JSON.stringify(backup.userData.pregnancy)}"`,
          `${backup.timestamp},البيانات الصحية,"${JSON.stringify(backup.userData.health)}"`,
        ];
        content = csvRows.join('\n');
        filename = `pregnancy-app-data-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير البيانات بتنسيق ${format.toUpperCase()}`,
      });

      return true;
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير البيانات. حاولي مرة أخرى.",
        variant: "destructive"
      });
      return false;
    }
  }, [createFullBackup]);

  // استيراد البيانات من ملف
  const importData = useCallback(async (file: File): Promise<boolean> => {
    try {
      setIsImporting(true);

      const text = await file.text();
      const backup: DataBackup = JSON.parse(text);

      // التحقق من صحة البيانات
      if (!backup.version || !backup.timestamp || !backup.userData) {
        throw new Error('تنسيق الملف غير صحيح');
      }

      // استيراد البيانات المختلفة
      const importPromises = [];

      if (backup.userData.profile) {
        importPromises.push(
          dbOperations.saveSetting('userProfile', JSON.stringify(backup.userData.profile))
        );
      }

      if (backup.userData.preferences) {
        importPromises.push(
          dbOperations.saveSetting('userPreferences', JSON.stringify(backup.userData.preferences))
        );
      }

      if (backup.userData.pregnancy) {
        importPromises.push(
          dbOperations.saveSetting('pregnancyData', JSON.stringify(backup.userData.pregnancy))
        );
      }

      if (backup.userData.health) {
        importPromises.push(
          dbOperations.saveSetting('healthData', JSON.stringify(backup.userData.health))
        );
      }

      if (backup.content.favorites) {
        for (const fav of backup.content.favorites) {
          importPromises.push(dbOperations.saveFavorite(fav));
        }
      }

      if (backup.content.reminders) {
        for (const reminder of backup.content.reminders) {
          importPromises.push(dbOperations.saveReminder(reminder));
        }
      }

      await Promise.all(importPromises);

      // تحديث حالة آخر مزامنة
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        status: 'success'
      }));

      toast({
        title: "تم الاستيراد بنجاح",
        description: "تم استيراد جميع البيانات بنجاح",
      });

      return true;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: "فشل في استيراد البيانات. تأكدي من صحة الملف.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsImporting(false);
    }
  }, []);

  // تنظيف البيانات القديمة
  const cleanupOldData = useCallback(async (daysToKeep: number = 90) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // تنظيف سجل القراءة القديم
      const readingHistory = await dbOperations.getSetting('readingHistory');
      if (readingHistory) {
        const history = JSON.parse(readingHistory);
        const filteredHistory = history.filter((item: any) => 
          new Date(item.timestamp) > cutoffDate
        );
        await dbOperations.saveSetting('readingHistory', JSON.stringify(filteredHistory));
      }

      // تنظيف التحليلات القديمة
      const usageAnalytics = await dbOperations.getSetting('usageAnalytics');
      if (usageAnalytics) {
        const analytics = JSON.parse(usageAnalytics);
        const filteredAnalytics = analytics.filter((item: any) => 
          new Date(item.timestamp) > cutoffDate
        );
        await dbOperations.saveSetting('usageAnalytics', JSON.stringify(filteredAnalytics));
      }

      await calculateStorageUsage();

      toast({
        title: "تم التنظيف",
        description: `تم حذف البيانات الأقدم من ${daysToKeep} يوم`,
      });

      return true;
    } catch (error) {
      console.error('Cleanup error:', error);
      return false;
    }
  }, [calculateStorageUsage]);

  // مزامنة البيانات مع الخادم (محاكاة)
  const syncWithServer = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

      // محاكاة عملية المزامنة
      await new Promise(resolve => setTimeout(resolve, 2000));

      // في التطبيق الحقيقي، هنا سيتم إرسال البيانات للخادم
      const backup = await createFullBackup();
      
      // محاكاة حفظ آخر مزامنة
      await dbOperations.saveSetting('lastSyncTimestamp', new Date().toISOString());

      setSyncStatus({
        lastSync: new Date().toISOString(),
        pendingChanges: 0,
        conflicts: 0,
        status: 'success'
      });

      toast({
        title: "تمت المزامنة",
        description: "تم مزامنة جميع البيانات بنجاح",
      });

      return true;
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
      console.error('Sync error:', error);
      return false;
    }
  }, [createFullBackup]);

  // إعادة تعيين جميع البيانات
  const resetAllData = useCallback(async () => {
    try {
      // حذف البيانات من كل جدول منفصل
      const stores = ['userProfile', 'reminders', 'dailyLogs', 'bellyPhotos', 'medicalTests', 'weightTracking', 'favorites', 'settings'];
      
      for (const storeName of stores) {
        try {
          // الحصول على جميع البيانات من الجدول
          const allData = await localDB.getAll(storeName);
          // حذف كل عنصر
          for (const item of allData) {
            await localDB.delete(storeName, (item as any).id);
          }
        } catch (error) {
          console.warn(`Error clearing ${storeName}:`, error);
        }
      }
      
      // حذف البيانات من localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pregnancy_') || key.startsWith('user_') || key.startsWith('ai_') || key.startsWith('reminder_')) {
          localStorage.removeItem(key);
        }
      });

      // إعادة تعيين الحالات
      setSyncStatus({
        lastSync: null,
        pendingChanges: 0,
        conflicts: 0,
        status: 'idle'
      });

      await calculateStorageUsage();

      toast({
        title: "تم إعادة التعيين",
        description: "تم حذف جميع البيانات بنجاح",
      });

      return true;
    } catch (error) {
      console.error('Reset error:', error);
      return false;
    }
  }, [calculateStorageUsage]);

  // تحميل حالة المزامنة عند البدء
  useEffect(() => {
    const loadSyncStatus = async () => {
      try {
        const lastSync = await dbOperations.getSetting('lastSyncTimestamp');
        if (lastSync) {
          setSyncStatus(prev => ({
            ...prev,
            lastSync,
            status: 'idle'
          }));
        }
        await calculateStorageUsage();
      } catch (error) {
        console.error('Error loading sync status:', error);
      }
    };

    loadSyncStatus();
  }, [calculateStorageUsage]);

  return {
    // الحالة
    syncStatus,
    isExporting,
    isImporting,
    storageUsage,

    // الوظائف الأساسية  
    createFullBackup,
    exportData,
    importData,
    
    // إدارة البيانات
    syncWithServer,
    cleanupOldData,
    resetAllData,
    calculateStorageUsage,

    // إحصائيات
    stats: {
      storageUsed: `${storageUsage.used} MB`,
      storageTotal: `${storageUsage.total} MB`,
      storagePercentage: `${storageUsage.percentage}%`,
      lastSync: syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleDateString('ar-SA') : 'لم يتم',
      pendingChanges: syncStatus.pendingChanges
    }
  };
};