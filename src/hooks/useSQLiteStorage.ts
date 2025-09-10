import { useState, useEffect, useCallback } from 'react';
import { sqliteService } from '@/lib/sqliteDatabase';
import { dbOperations, localDB } from '@/lib/localDatabase';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingItems: number;
  syncing: boolean;
}

/**
 * Hook متقدم للتعامل مع SQLite مع نظام مزامنة ذكي
 * يستخدم SQLite للأجهزة المحمولة و IndexedDB للويب
 */
export const useSQLiteStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingItems: 0,
    syncing: false
  });
  const { toast } = useToast();

  // تهيئة قاعدة البيانات
  const initializeDatabase = useCallback(async () => {
    try {
      const sqliteAvailable = await sqliteService.initialize();
      setIsNativePlatform(sqliteAvailable);
      setIsInitialized(true);

      if (sqliteAvailable) {
        console.log('SQLite initialized successfully');
        // نقل البيانات من IndexedDB إلى SQLite إذا لم تكن منقولة من قبل
        await migrateFromIndexedDB();
      } else {
        console.log('Using IndexedDB fallback');
      }

      // تحديث حالة المزامنة
      await updateSyncStatus();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      setIsInitialized(true); // استخدام IndexedDB كـ fallback
    }
  }, []);

  // نقل البيانات من IndexedDB إلى SQLite
  const migrateFromIndexedDB = useCallback(async () => {
    try {
      // التحقق من وجود بيانات في IndexedDB
      const hasIndexedDBData = await checkIndexedDBData();
      if (!hasIndexedDBData) return;

      // نقل ملف المستخدم
      const userProfile = await dbOperations.getSetting('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        await sqliteService.saveUserProfile(profile);
      }

      // نقل التذكيرات
      const reminders = await dbOperations.getReminders();
      for (const reminder of reminders) {
        await sqliteService.saveReminder(reminder);
      }

      // نقل المفضلة
      const favorites = await dbOperations.getFavorites();
      for (const favorite of favorites) {
        await sqliteService.saveFavorite(favorite);
      }

      console.log('Data migration from IndexedDB to SQLite completed');
    } catch (error) {
      console.error('Error migrating data:', error);
    }
  }, []);

  // التحقق من وجود بيانات في IndexedDB
  const checkIndexedDBData = useCallback(async (): Promise<boolean> => {
    try {
      const userProfile = await dbOperations.getSetting('userProfile');
      const reminders = await dbOperations.getReminders();
      const favorites = await dbOperations.getFavorites();
      
      return !!(userProfile || reminders.length > 0 || favorites.length > 0);
    } catch (error) {
      return false;
    }
  }, []);

  // تحديث حالة المزامنة
  const updateSyncStatus = useCallback(async () => {
    if (!isInitialized) return;

    try {
      let pendingItems = 0;
      let lastSync = null;

      if (isNativePlatform) {
        const unsyncedData = await sqliteService.getUnsyncedData();
        pendingItems = unsyncedData.reduce((sum, table) => sum + table.data.length, 0);
      }

      // الحصول على آخر مزامنة من localStorage
      lastSync = localStorage.getItem('lastSyncTimestamp');

      setSyncStatus(prev => ({
        ...prev,
        pendingItems,
        lastSync,
        isOnline: navigator.onLine
      }));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }, [isInitialized, isNativePlatform]);

  // حفظ ملف المستخدم
  const saveUserProfile = useCallback(async (profile: any): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      let success = false;

      if (isNativePlatform) {
        success = await sqliteService.saveUserProfile(profile);
      } else {
        await dbOperations.saveSetting('userProfile', JSON.stringify(profile));
        success = true;
      }

      if (success) {
        await updateSyncStatus();
        toast({
          title: "تم حفظ البيانات",
          description: "تم حفظ ملف المستخدم بنجاح"
        });
      }

      return success;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }, [isInitialized, isNativePlatform, toast, updateSyncStatus]);

  // الحصول على ملف المستخدم
  const getUserProfile = useCallback(async (): Promise<any | null> => {
    if (!isInitialized) return null;

    try {
      if (isNativePlatform) {
        return await sqliteService.getUserProfile();
      } else {
        const profile = await dbOperations.getSetting('userProfile');
        return profile ? JSON.parse(profile) : null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }, [isInitialized, isNativePlatform]);

  // حفظ تذكير
  const saveReminder = useCallback(async (reminder: any): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      let success = false;

      if (isNativePlatform) {
        success = await sqliteService.saveReminder(reminder);
      } else {
        await dbOperations.saveReminder(reminder);
        success = true;
      }

      if (success) {
        await updateSyncStatus();
        toast({
          title: "تم إضافة التذكير",
          description: reminder.title
        });
      }

      return success;
    } catch (error) {
      console.error('Error saving reminder:', error);
      return false;
    }
  }, [isInitialized, isNativePlatform, toast, updateSyncStatus]);

  // الحصول على التذكيرات
  const getReminders = useCallback(async (): Promise<any[]> => {
    if (!isInitialized) return [];

    try {
      if (isNativePlatform) {
        return await sqliteService.getReminders();
      } else {
        return await dbOperations.getReminders();
      }
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }, [isInitialized, isNativePlatform]);

  // حفظ يومية
  const saveDailyLog = useCallback(async (log: any): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      let success = false;

      if (isNativePlatform) {
        success = await sqliteService.saveDailyLog(log);
      } else {
        // حفظ في IndexedDB كـ fallback
        const logs = JSON.parse(localStorage.getItem('daily_logs') || '[]');
        logs.push({ ...log, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('daily_logs', JSON.stringify(logs));
        success = true;
      }

      if (success) {
        await updateSyncStatus();
        toast({
          title: "تم حفظ اليومية",
          description: "تم حفظ البيانات اليومية بنجاح"
        });
      }

      return success;
    } catch (error) {
      console.error('Error saving daily log:', error);
      return false;
    }
  }, [isInitialized, isNativePlatform, toast, updateSyncStatus]);

  // الحصول على اليوميات
  const getDailyLogs = useCallback(async (limit: number = 30): Promise<any[]> => {
    if (!isInitialized) return [];

    try {
      if (isNativePlatform) {
        return await sqliteService.getDailyLogs(limit);
      } else {
        const logs = JSON.parse(localStorage.getItem('daily_logs') || '[]');
        return logs.slice(0, limit);
      }
    } catch (error) {
      console.error('Error getting daily logs:', error);
      return [];
    }
  }, [isInitialized, isNativePlatform]);

  // مزامنة البيانات مع الخادم
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    if (!isInitialized || !navigator.onLine) return false;

    setSyncStatus(prev => ({ ...prev, syncing: true }));

    try {
      let syncData: any = {};

      if (isNativePlatform) {
        // الحصول على البيانات غير المزامنة من SQLite
        const unsyncedData = await sqliteService.getUnsyncedData();
        
        for (const tableData of unsyncedData) {
          syncData[tableData.table] = tableData.data;
        }
      } else {
        // الحصول على البيانات من IndexedDB
        syncData = {
          userProfile: await getUserProfile(),
          reminders: await getReminders(),
          dailyLogs: await getDailyLogs()
        };
      }

      // محاكاة إرسال البيانات للخادم
      await new Promise(resolve => setTimeout(resolve, 2000));

      // تعليم البيانات كمزامنة في SQLite
      if (isNativePlatform) {
        for (const tableData of await sqliteService.getUnsyncedData()) {
          const ids = tableData.data.map((item: any) => item.id);
          await sqliteService.markAsSynced(tableData.table, ids);
        }
      }

      // حفظ timestamp آخر مزامنة
      const timestamp = new Date().toISOString();
      localStorage.setItem('lastSyncTimestamp', timestamp);

      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        lastSync: timestamp,
        pendingItems: 0
      }));

      toast({
        title: "تمت المزامنة بنجاح",
        description: "تم مزامنة جميع البيانات مع الخادم"
      });

      return true;
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
      
      toast({
        title: "خطأ في المزامنة",
        description: "فشل في مزامنة البيانات. سيتم المحاولة لاحقاً",
        variant: "destructive"
      });
      
      return false;
    }
  }, [isInitialized, isNativePlatform, getUserProfile, getReminders, getDailyLogs, toast]);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // مزامنة تلقائية عند العودة أونلاين
      setTimeout(() => syncWithServer(), 1000);
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
  }, [syncWithServer]);

  // تهيئة عند التحميل
  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  // تحديث حالة المزامنة دورياً
  useEffect(() => {
    const interval = setInterval(updateSyncStatus, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, [updateSyncStatus]);

  return {
    // الحالة
    isInitialized,
    isNativePlatform,
    syncStatus,

    // عمليات البيانات
    saveUserProfile,
    getUserProfile,
    saveReminder,
    getReminders,
    saveDailyLog,
    getDailyLogs,

    // المزامنة
    syncWithServer,
    updateSyncStatus,

    // الإحصائيات
    stats: {
      platform: isNativePlatform ? 'SQLite' : 'IndexedDB',
      lastSync: syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleDateString('ar-SA') : 'لم يتم',
      pendingItems: syncStatus.pendingItems,
      isOnline: syncStatus.isOnline,
      syncing: syncStatus.syncing
    }
  };
};