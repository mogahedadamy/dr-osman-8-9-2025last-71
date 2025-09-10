import { useState, useEffect, useCallback } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface PregnancyWeekInfo {
  week: number;
  title: string;
  description: string;
  tips: string[];
  checkups: string[];
}

interface NotificationSchedule {
  id: string;
  type: 'daily_tip' | 'weekly_milestone' | 'checkup_reminder' | 'medication' | 'custom';
  title: string;
  body: string;
  scheduledTime: string; // ISO string
  pregnancyWeek?: number;
  isActive: boolean;
  recurring?: 'daily' | 'weekly' | 'none';
}

export const useSmartPregnancyNotifications = () => {
  const { isRegistered, requestPermission } = usePushNotifications();
  const [pregnancyWeek, setPregnancyWeek] = useLocalStorage('pregnancy_week', 1);
  const [dueDate, setDueDate] = useLocalStorage('due_date', '');
  const [notifications, setNotifications] = useLocalStorage<NotificationSchedule[]>('notification_schedule', []);
  const [isEnabled, setIsEnabled] = useLocalStorage('smart_notifications_enabled', false);

  // Weekly pregnancy information
  const pregnancyWeekInfo: Record<number, PregnancyWeekInfo> = {
    1: {
      week: 1,
      title: "بداية رحلة الحمل",
      description: "تهانينا! بدأت رحلة الأمومة الجميلة",
      tips: ["تناولي حمض الفوليك", "اشربي الكثير من الماء", "تجنبي التدخين والكحول"],
      checkups: ["اختبار الحمل", "فحص الدم الأولي"]
    },
    8: {
      week: 8,
      title: "الأسبوع الثامن - نمو الأعضاء",
      description: "أعضاء طفلك تبدأ في التكون",
      tips: ["راجعي الطبيب للمرة الأولى", "تناولي الفيتامينات", "تجنبي التعب المفرط"],
      checkups: ["فحص الموجات فوق الصوتية الأول", "فحص ضغط الدم"]
    },
    12: {
      week: 12,
      title: "نهاية الثلث الأول",
      description: "انتهت المرحلة الأكثر حساسية من الحمل",
      tips: ["يمكنك الإعلان عن الحمل", "تناولي طعام صحي متنوع", "مارسي رياضة خفيفة"],
      checkups: ["فحص شامل", "اختبارات الدم المتقدمة"]
    },
    20: {
      week: 20,
      title: "منتصف الحمل - معرفة الجنس",
      description: "يمكن معرفة جنس المولود الآن",
      tips: ["فحص الأعضاء التفصيلي", "ابدئي في تحضير غرفة الطفل", "تواصلي مع طفلك"],
      checkups: ["فحص الموجات فوق الصوتية التفصيلي", "فحص وزن الطفل"]
    },
    28: {
      week: 28,
      title: "دخول الثلث الأخير",
      description: "بدأت المرحلة الأخيرة من الحمل",
      tips: ["راقبي حركة الطفل", "احضري دورة الولادة", "تجهزي حقيبة المستشفى"],
      checkups: ["فحص السكري", "مراقبة ضغط الدم"]
    },
    36: {
      week: 36,
      title: "قريباً من موعد الولادة",
      description: "الطفل مكتمل النمو تقريباً",
      tips: ["حضري للولادة", "راقبي علامات المخاض", "استريحي واسترخي"],
      checkups: ["فحص أسبوعي", "مراقبة وضعية الطفل"]
    }
  };

  useEffect(() => {
    if (isEnabled && dueDate) {
      calculatePregnancyWeek();
      scheduleWeeklyNotifications();
    }
  }, [isEnabled, dueDate]);

  const calculatePregnancyWeek = () => {
    if (!dueDate) return;
    
    const due = new Date(dueDate);
    const now = new Date();
    const gestationDays = 280; // 40 weeks
    const daysSinceConception = gestationDays - Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.ceil(daysSinceConception / 7);
    
    if (currentWeek !== pregnancyWeek && currentWeek > 0 && currentWeek <= 42) {
      setPregnancyWeek(currentWeek);
    }
  };

  const scheduleWeeklyNotifications = () => {
    const newNotifications: NotificationSchedule[] = [];

    // Daily tip notifications
    newNotifications.push({
      id: `daily_tip_${Date.now()}`,
      type: 'daily_tip',
      title: "نصيحة يومية للحمل",
      body: "تذكري شرب 8 أكواب من الماء يومياً",
      scheduledTime: getNextScheduledTime(9, 0), // 9:00 AM
      isActive: true,
      recurring: 'daily'
    });

    // Weekly milestone notifications
    const weekInfo = pregnancyWeekInfo[pregnancyWeek];
    if (weekInfo) {
      newNotifications.push({
        id: `weekly_milestone_${pregnancyWeek}`,
        type: 'weekly_milestone',
        title: weekInfo.title,
        body: weekInfo.description,
        scheduledTime: getNextScheduledTime(10, 0), // 10:00 AM on next Monday
        pregnancyWeek: pregnancyWeek,
        isActive: true,
        recurring: 'weekly'
      });
    }

    // Checkup reminders based on pregnancy week
    if (pregnancyWeek >= 8 && pregnancyWeek <= 12) {
      newNotifications.push({
        id: `checkup_first_trimester`,
        type: 'checkup_reminder',
        title: "موعد فحص الثلث الأول",
        body: "حان وقت فحص الثلث الأول من الحمل",
        scheduledTime: getNextScheduledTime(14, 0), // 2:00 PM
        pregnancyWeek: pregnancyWeek,
        isActive: true,
        recurring: 'none'
      });
    }

    if (pregnancyWeek >= 20 && pregnancyWeek <= 22) {
      newNotifications.push({
        id: `checkup_anatomy_scan`,
        type: 'checkup_reminder',
        title: "موعد فحص الأعضاء التفصيلي",
        body: "حان وقت الفحص التفصيلي لأعضاء الطفل",
        scheduledTime: getNextScheduledTime(14, 0),
        pregnancyWeek: pregnancyWeek,
        isActive: true,
        recurring: 'none'
      });
    }

    if (pregnancyWeek >= 28) {
      newNotifications.push({
        id: `checkup_third_trimester`,
        type: 'checkup_reminder',
        title: "فحص الثلث الأخير",
        body: "موعد الفحص الدوري للثلث الأخير",
        scheduledTime: getNextScheduledTime(11, 0),
        pregnancyWeek: pregnancyWeek,
        isActive: true,
        recurring: 'weekly'
      });
    }

    // Update notifications
    setNotifications(prev => [...prev.filter(n => !n.isActive), ...newNotifications]);
  };

  const getNextScheduledTime = (hours: number, minutes: number, daysFromNow: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (date.getTime() <= Date.now() && daysFromNow === 0) {
      date.setDate(date.getDate() + 1);
    }
    
    return date.toISOString();
  };

  const enableSmartNotifications = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (hasPermission && isRegistered) {
      setIsEnabled(true);
      scheduleWeeklyNotifications();
      return true;
    }
    return false;
  }, [requestPermission, isRegistered]);

  const disableSmartNotifications = useCallback(() => {
    setIsEnabled(false);
    setNotifications([]);
  }, []);

  const addCustomNotification = useCallback((title: string, body: string, scheduledTime: string, recurring: 'daily' | 'weekly' | 'none' = 'none') => {
    const notification: NotificationSchedule = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      title,
      body,
      scheduledTime,
      isActive: true,
      recurring
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getWeeklyTips = useCallback(() => {
    const weekInfo = pregnancyWeekInfo[pregnancyWeek];
    return weekInfo ? weekInfo.tips : [];
  }, [pregnancyWeek]);

  const getUpcomingCheckups = useCallback(() => {
    const weekInfo = pregnancyWeekInfo[pregnancyWeek];
    return weekInfo ? weekInfo.checkups : [];
  }, [pregnancyWeek]);

  return {
    pregnancyWeek,
    isEnabled,
    notifications: notifications.filter(n => n.isActive),
    enableSmartNotifications,
    disableSmartNotifications,
    addCustomNotification,
    removeNotification,
    getWeeklyTips,
    getUpcomingCheckups,
    setDueDate,
    dueDate
  };
};