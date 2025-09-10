import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface SyncTask {
  id: string;
  type: 'reminder' | 'health-data' | 'chat' | 'profile' | 'settings';
  data: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
}

interface UseAutoSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingTasks: number;
  addSyncTask: (task: Omit<SyncTask, 'id' | 'timestamp'>) => void;
  forcSync: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

export const useAutoSync = (): UseAutoSyncReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>(() => {
    try {
      const saved = localStorage.getItem('pendingSyncTasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // حفظ المهام في التخزين المحلي
  useEffect(() => {
    try {
      localStorage.setItem('pendingSyncTasks', JSON.stringify(syncTasks));
    } catch (error) {
      console.error('Failed to save sync tasks:', error);
    }
  }, [syncTasks]);

  // إضافة مهمة مزامنة جديدة
  const addSyncTask = useCallback((task: Omit<SyncTask, 'id' | 'timestamp'>) => {
    const newTask: SyncTask = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    setSyncTasks(prev => [...prev, newTask]);
    
    // محاولة المزامنة فوراً إذا كان متصل
    if (isOnline && !isSyncing) {
      syncWithDelay();
    }
  }, [isOnline, isSyncing]);

  // مزامنة مع تأخير للتجميع
  const syncWithDelay = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      performSync();
    }, 1000); // تأخير ثانية واحدة لتجميع المهام
  }, []);

  // تنفيذ المزامنة
  const performSync = useCallback(async () => {
    if (!isOnline || isSyncing || syncTasks.length === 0) {
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // ترتيب المهام حسب الأولوية
      const sortedTasks = [...syncTasks].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // معالجة المهام تدريجياً
      const completedTasks: string[] = [];
      
      for (const task of sortedTasks) {
        try {
          await processSyncTask(task);
          completedTasks.push(task.id);
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
          // في حالة الفشل، نحتفظ بالمهمة للمحاولة لاحقاً
        }
      }

      // إزالة المهام المكتملة
      setSyncTasks(prev => prev.filter(task => !completedTasks.includes(task.id)));
      
      setSyncStatus('success');
      
      // إزالة التوست المزعج للنجاح
      // if (completedTasks.length > 0) {
      //   toast({
      //     title: "تم التحديث تلقائياً",
      //     description: `تم مزامنة ${completedTasks.length} عنصر بنجاح`,
      //     duration: 2000
      //   });
      // }

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      toast({
        title: "فشل في المزامنة",
        description: "سيتم المحاولة مرة أخرى قريباً",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setIsSyncing(false);
      
      // إعادة تعيين الحالة بعد فترة
      setTimeout(() => {
        setSyncStatus('idle');
      }, 2000);
    }
  }, [isOnline, isSyncing, syncTasks]);

  // معالجة مهمة مزامنة واحدة
  const processSyncTask = async (task: SyncTask): Promise<void> => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    switch (task.type) {
      case 'reminder':
        // مزامنة التذكيرات
        await delay(200);
        console.log('Synced reminder:', task.data);
        break;
        
      case 'health-data':
        // مزامنة البيانات الصحية
        await delay(300);
        console.log('Synced health data:', task.data);
        break;
        
      case 'chat':
        // مزامنة رسائل المحادثة
        await delay(150);
        console.log('Synced chat:', task.data);
        break;
        
      case 'profile':
        // مزامنة الملف الشخصي
        await delay(250);
        console.log('Synced profile:', task.data);
        break;
        
      case 'settings':
        // مزامنة الإعدادات
        await delay(100);
        console.log('Synced settings:', task.data);
        break;
        
      default:
        throw new Error(`Unknown sync task type: ${task.type}`);
    }
  };

  // مزامنة قسرية
  const forceSync = useCallback(async () => {
    await performSync();
  }, [performSync]);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 اتصال بالإنترنت');
      setIsOnline(true);
      
      // مزامنة تلقائية عند عودة الاتصال
      if (syncTasks.length > 0) {
        // بدء المزامنة بعد ثانيتين للتأكد من استقرار الاتصال
        setTimeout(() => {
          performSync();
        }, 2000);
      }
    };

    const handleOffline = () => {
      console.log('📵 فقدان الاتصال بالإنترنت');
      setIsOnline(false);
      setIsSyncing(false);
      setSyncStatus('idle');
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncTasks.length, performSync]);

  // مزامنة دورية (كل 5 دقائق إذا كان هناك مهام معلقة)
  useEffect(() => {
    if (!isOnline || syncTasks.length === 0) return;

    const interval = setInterval(() => {
      if (!isSyncing) {
        performSync();
      }
    }, 5 * 60 * 1000); // 5 دقائق

    return () => clearInterval(interval);
  }, [isOnline, syncTasks.length, isSyncing, performSync]);

  return {
    isOnline,
    isSyncing,
    pendingTasks: syncTasks.length,
    addSyncTask,
    forcSync: forceSync,
    syncStatus
  };
};