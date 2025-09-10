import { useCallback } from 'react';
import { useAutoSync } from './useAutoSync';
import { toast } from '@/hooks/use-toast';

interface OfflineAction {
  execute: () => Promise<void>;
  onlineAction: () => Promise<void>;
  description: string;
}

export const useOfflineActions = () => {
  const { isOnline, addSyncTask } = useAutoSync();

  // تنفيذ عمل مع دعم الأوفلاين
  const executeWithOfflineSupport = useCallback(async (
    action: OfflineAction
  ) => {
    try {
      // تنفيذ العمل محلياً دائماً
      await action.execute();

      // إذا كان متصل، تنفيذ العمل على الخادم فوراً
      if (isOnline) {
        try {
          await action.onlineAction();
        } catch (error) {
          console.error('Online action failed, adding to sync queue:', error);
          // في حالة الفشل، إضافة للطابور
          addSyncTask({
            type: 'reminder', // سيتم تحديد النوع حسب العمل
            data: action,
            priority: 'medium'
          });
        }
      } else {
        // إضافة للطابور للمزامنة لاحقاً
        addSyncTask({
          type: 'reminder',
          data: action,
          priority: 'medium'
        });
        
        toast({
          title: "تم الحفظ محلياً",
          description: `${action.description} - سيتم المزامنة عند الاتصال`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
      toast({
        title: "خطأ في العملية",
        description: "فشل في تنفيذ العملية",
        variant: "destructive"
      });
    }
  }, [isOnline, addSyncTask]);

  // حفظ التذكير مع دعم الأوفلاين
  const saveReminder = useCallback(async (reminderData: any) => {
    await executeWithOfflineSupport({
      description: "تذكير جديد",
      execute: async () => {
        // حفظ محلي
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders.push({ ...reminderData, id: Date.now(), offline: !isOnline });
        localStorage.setItem('reminders', JSON.stringify(reminders));
      },
      onlineAction: async () => {
        // إرسال للخادم (محاكاة)
        console.log('Saving reminder to server:', reminderData);
      }
    });
  }, [executeWithOfflineSupport, isOnline]);

  // حفظ البيانات الصحية مع دعم الأوفلاين
  const saveHealthData = useCallback(async (healthData: any) => {
    await executeWithOfflineSupport({
      description: "بيانات صحية",
      execute: async () => {
        const data = JSON.parse(localStorage.getItem('healthData') || '[]');
        data.push({ ...healthData, id: Date.now(), offline: !isOnline });
        localStorage.setItem('healthData', JSON.stringify(data));
      },
      onlineAction: async () => {
        console.log('Saving health data to server:', healthData);
      }
    });
  }, [executeWithOfflineSupport, isOnline]);

  // حفظ رسالة محادثة مع دعم الأوفلاين
  const saveChatMessage = useCallback(async (messageData: any) => {
    await executeWithOfflineSupport({
      description: "رسالة محادثة",
      execute: async () => {
        const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        messages.push({ ...messageData, id: Date.now(), offline: !isOnline });
        localStorage.setItem('chatMessages', JSON.stringify(messages));
      },
      onlineAction: async () => {
        console.log('Saving chat message to server:', messageData);
      }
    });
  }, [executeWithOfflineSupport, isOnline]);

  // تحديث الملف الشخصي مع دعم الأوفلاين
  const updateProfile = useCallback(async (profileData: any) => {
    await executeWithOfflineSupport({
      description: "الملف الشخصي",
      execute: async () => {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedProfile = { ...profile, ...profileData, offline: !isOnline };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      },
      onlineAction: async () => {
        console.log('Updating profile on server:', profileData);
      }
    });
  }, [executeWithOfflineSupport, isOnline]);

  // حفظ الإعدادات مع دعم الأوفلاين
  const saveSettings = useCallback(async (settingsData: any) => {
    await executeWithOfflineSupport({
      description: "الإعدادات",
      execute: async () => {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const updatedSettings = { ...settings, ...settingsData, offline: !isOnline };
        localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      },
      onlineAction: async () => {
        console.log('Saving settings to server:', settingsData);
      }
    });
  }, [executeWithOfflineSupport, isOnline]);

  return {
    isOnline,
    saveReminder,
    saveHealthData,
    saveChatMessage,
    updateProfile,
    saveSettings,
    executeWithOfflineSupport
  };
};