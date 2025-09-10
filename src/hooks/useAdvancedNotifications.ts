import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificationSettings } from '@/types';
import { dbOperations } from '@/lib/localDatabase';
import { toast } from '@/hooks/use-toast';

/**
 * Hook لإدارة الإشعارات المحلية باستخدام Capacitor
 */
export const useAdvancedNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminders: true,
    appointments: true,
    dailyLogs: true,
    weeklyTips: true,
    soundEnabled: true,
    vibrationEnabled: true
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  // طلب الإذن للإشعارات
  const requestPermission = useCallback(async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      setHasPermission(result.display === 'granted');
      return result.display === 'granted';
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      return false;
    }
  }, []);

  // تحميل إعدادات الإشعارات
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const saved = await dbOperations.getSetting('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      
      // التحقق من الإذن
      const permission = await LocalNotifications.checkPermissions();
      setHasPermission(permission.display === 'granted');
    } catch (error) {
      console.error('خطأ في تحميل إعدادات الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // حفظ إعدادات الإشعارات
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await dbOperations.saveSetting('notificationSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات الإشعارات",
      });
    } catch (error) {
      console.error('خطأ في حفظ إعدادات الإشعارات:', error);
    }
  };

  // جدولة إشعار
  const scheduleNotification = async (options: {
    id: number;
    title: string;
    body: string;
    schedule: Date;
    extra?: any;
  }) => {
    if (!hasPermission || !settings.enabled) {
      return false;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: options.id,
            title: options.title,
            body: options.body,
            schedule: {
              at: options.schedule,
            },
            sound: settings.soundEnabled ? 'default' : undefined,
            extra: options.extra,
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#FF6B6B',
          }
        ]
      });
      return true;
    } catch (error) {
      console.error('خطأ في جدولة الإشعار:', error);
      return false;
    }
  };

  // جدولة تذكير
  const scheduleReminder = async (reminder: {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    type: string;
  }) => {
    if (!settings.reminders) return false;

    const [hours, minutes] = reminder.time.split(':').map(Number);
    const scheduleDate = new Date(reminder.date);
    scheduleDate.setHours(hours, minutes, 0, 0);

    return await scheduleNotification({
      id: reminder.id,
      title: `⏰ ${reminder.title}`,
      body: reminder.description || 'حان وقت التذكير',
      schedule: scheduleDate,
      extra: { type: 'reminder', reminderId: reminder.id }
    });
  };

  // جدولة تذكير موعد طبي
  const scheduleAppointment = async (appointment: {
    id: number;
    title: string;
    doctorName?: string;
    location?: string;
    date: string;
    time: string;
  }) => {
    if (!settings.appointments) return false;

    const [hours, minutes] = appointment.time.split(':').map(Number);
    const scheduleDate = new Date(appointment.date);
    
    // إشعار قبل ساعة من الموعد
    const oneHourBefore = new Date(scheduleDate);
    oneHourBefore.setHours(hours - 1, minutes, 0, 0);

    // إشعار في وقت الموعد
    const appointmentTime = new Date(scheduleDate);
    appointmentTime.setHours(hours, minutes, 0, 0);

    const results = await Promise.all([
      scheduleNotification({
        id: appointment.id * 10, // للتمييز بين الإشعارات
        title: '🏥 موعد طبي قريباً',
        body: `موعدك مع ${appointment.doctorName || 'الطبيب'} خلال ساعة`,
        schedule: oneHourBefore,
        extra: { type: 'appointment', appointmentId: appointment.id }
      }),
      scheduleNotification({
        id: appointment.id * 10 + 1,
        title: '🏥 حان وقت الموعد الطبي',
        body: `موعدك مع ${appointment.doctorName || 'الطبيب'} الآن`,
        schedule: appointmentTime,
        extra: { type: 'appointment', appointmentId: appointment.id }
      })
    ]);

    return results.every(result => result);
  };

  // إلغاء إشعار
  const cancelNotification = async (id: number) => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('خطأ في إلغاء الإشعار:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    hasPermission,
    loading,
    requestPermission,
    updateSettings,
    scheduleNotification,
    scheduleReminder,
    scheduleAppointment,
    cancelNotification,
    reloadSettings: loadSettings
  };
};