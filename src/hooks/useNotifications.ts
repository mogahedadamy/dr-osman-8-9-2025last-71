import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "الإشعارات غير مدعومة",
        description: "متصفحك لا يدعم إشعارات الويب",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: "تم تفعيل الإشعارات",
          description: "ستتلقين إشعارات للتذكيرات المهمة"
        });
        return true;
      } else if (result === 'denied') {
        toast({
          title: "تم رفض الإشعارات",
          description: "يمكنك تفعيلها من إعدادات المتصفح",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      return false;
    }
    
    return false;
  }, [isSupported, toast]);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported) {
      console.warn('الإشعارات غير مدعومة');
      return null;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        dir: 'rtl',
        lang: 'ar'
      });

      console.log("🔔 تم إرسال إشعار:", options.title);

      // Auto close after 5 seconds if not require interaction
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return notification;
    } catch (error) {
      console.error('خطأ في إظهار الإشعار:', error);
      return null;
    }
  }, [isSupported, permission, requestPermission]);

  const scheduleReminder = useCallback((reminderTime: string, title: string, body: string) => {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (reminderDate.getTime() <= now.getTime()) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    console.log(`⏰ جدولة تذكير لـ ${reminderTime}، متبقي ${Math.round(timeUntilReminder / 1000 / 60)} دقيقة`);

    const timeoutId = setTimeout(() => {
      showNotification({
        title,
        body,
        requireInteraction: true,
        tag: 'reminder'
      });
    }, timeUntilReminder);

    return timeoutId;
  }, [showNotification]);

  const scheduleAppointmentReminder = useCallback((appointmentDate: string, appointmentTime: string, title: string) => {
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const reminderDate = new Date(appointmentDate);
    reminderDate.setHours(hours - 1, minutes, 0, 0); // Remind 1 hour before

    const now = new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      console.log(`📅 جدولة تذكير موعد لـ ${appointmentDate} ${appointmentTime}`);
      
      const timeoutId = setTimeout(() => {
        showNotification({
          title: "تذكير موعد قريب",
          body: `موعدك "${title}" خلال ساعة`,
          requireInteraction: true,
          tag: 'appointment'
        });
      }, timeUntilReminder);

      return timeoutId;
    }

    return null;
  }, [showNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleReminder,
    scheduleAppointmentReminder
  };
};