import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePregnancyTracking } from '@/hooks/usePregnancyTracking';

export interface NotificationSettings {
  enabled: boolean;
  medicalReminders: {
    enabled: boolean;
    prenatalCheckups: boolean;
    vitamins: boolean;
    medications: boolean;
    tests: boolean;
  };
  wellnessReminders: {
    enabled: boolean;
    exercise: boolean;
    hydration: boolean;
    nutrition: boolean;
    rest: boolean;
  };
  educationalContent: {
    enabled: boolean;
    weeklyTips: boolean;
    newArticles: boolean;
    osmanTips: boolean;
  };
  emergencyAlerts: {
    enabled: boolean;
    urgentSymptoms: boolean;
    appointmentReminders: boolean;
  };
  timing: {
    morningTime: string; // "08:00"
    afternoonTime: string; // "14:00"
    eveningTime: string; // "20:00"
    frequency: 'daily' | 'weekly' | 'smart'; // Smart = based on user behavior
  };
  smartFeatures: {
    aiPersonalization: boolean;
    contextualReminders: boolean; // Based on weather, location, etc.
    adaptiveFrequency: boolean; // Reduce frequency if user doesn't engage
  };
}

export interface ScheduledNotification {
  id: string;
  type: 'medical' | 'wellness' | 'educational' | 'emergency' | 'appointment';
  title: string;
  body: string;
  scheduledTime: Date;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  week?: number;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  customData?: any;
  sent: boolean;
  acknowledged: boolean;
  snoozedUntil?: Date;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  category: string;
  titleTemplate: string;
  bodyTemplate: string;
  triggers: {
    pregnancyWeek?: number[];
    timeOfDay?: string[];
    conditions?: string[];
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  variables: string[];
}

export const useSmartNotifications = () => {
  const { toast } = useToast();
  const { currentWeek, dueDate } = usePregnancyTracking();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    medicalReminders: {
      enabled: true,
      prenatalCheckups: true,
      vitamins: true,
      medications: true,
      tests: true,
    },
    wellnessReminders: {
      enabled: true,
      exercise: true,
      hydration: true,
      nutrition: true,
      rest: true,
    },
    educationalContent: {
      enabled: true,
      weeklyTips: true,
      newArticles: true,
      osmanTips: true,
    },
    emergencyAlerts: {
      enabled: true,
      urgentSymptoms: true,
      appointmentReminders: true,
    },
    timing: {
      morningTime: "08:00",
      afternoonTime: "14:00", 
      eveningTime: "20:00",
      frequency: 'smart'
    },
    smartFeatures: {
      aiPersonalization: true,
      contextualReminders: true,
      adaptiveFrequency: true,
    }
  });

  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة النظام
  useEffect(() => {
    initializeNotificationSystem();
  }, []);

  // مراقبة تغييرات الأسبوع لإنشاء تذكيرات جديدة
  useEffect(() => {
    if (isInitialized && currentWeek) {
      generateWeeklyNotifications(currentWeek);
    }
  }, [currentWeek, isInitialized]);

  // تهيئة نظام الإشعارات
  const initializeNotificationSystem = async () => {
    try {
      // طلب إذن الإشعارات
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('تم منح إذن الإشعارات');
        }
      }

      // تحميل الإعدادات المحفوظة
      const savedSettings = localStorage.getItem('smartNotificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // تحميل الإشعارات المجدولة
      const savedNotifications = localStorage.getItem('smartScheduledNotifications');
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications);
        setScheduledNotifications(notifications);
      }

      // تحميل القوالب
      await loadNotificationTemplates();
      
      setIsInitialized(true);
      
      // بدء مراقبة الإشعارات المجدولة
      startNotificationMonitoring();
      
    } catch (error) {
      console.error('Error initializing notifications:', error);
      toast({
        title: "خطأ في الإشعارات",
        description: "حدث خطأ في تهيئة نظام الإشعارات",
        variant: "destructive"
      });
    }
  };

  // تحميل قوالب الإشعارات
  const loadNotificationTemplates = async (): Promise<void> => {
    const notificationTemplates: NotificationTemplate[] = [
      // التذكيرات الطبية
      {
        id: 'medical_checkup',
        type: 'medical',
        category: 'prenatal_checkup',
        titleTemplate: 'موعد الفحص الطبي 👩‍⚕️',
        bodyTemplate: 'لا تنسي موعد الفحص الطبي في الأسبوع {week}. تأكدي من تحضير قائمة الأسئلة للطبيب.',
        triggers: {
          pregnancyWeek: [8, 12, 16, 20, 24, 28, 32, 36, 38, 40],
          timeOfDay: ['morning']
        },
        priority: 'high',
        variables: ['week', 'doctorName']
      },
      {
        id: 'vitamin_reminder',
        type: 'medical',
        category: 'vitamins',
        titleTemplate: 'وقت تناول الفيتامينات 💊',
        bodyTemplate: 'حان وقت تناول فيتامينات الحمل. تذكري أن حمض الفوليك والحديد مهمان جداً لصحتك وصحة طفلك.',
        triggers: {
          timeOfDay: ['morning', 'evening']
        },
        priority: 'medium',
        variables: ['vitaminType']
      },
      {
        id: 'test_reminder',
        type: 'medical', 
        category: 'tests',
        titleTemplate: 'موعد الفحوصات المخبرية 🔬',
        bodyTemplate: 'في الأسبوع {week}، ينصح بإجراء {testType}. تواصلي مع طبيبك لتحديد الموعد.',
        triggers: {
          pregnancyWeek: [11, 15, 24, 28, 35]
        },
        priority: 'high',
        variables: ['week', 'testType']
      },

      // تذكيرات الصحة والعافية
      {
        id: 'hydration_reminder',
        type: 'wellness',
        category: 'hydration',
        titleTemplate: 'اشربي الماء 💧',
        bodyTemplate: 'حان وقت شرب كوب من الماء! الترطيب مهم جداً أثناء الحمل، خاصة في الأسبوع {week}.',
        triggers: {
          timeOfDay: ['morning', 'afternoon', 'evening']
        },
        priority: 'low',
        variables: ['week', 'waterIntake']
      },
      {
        id: 'exercise_reminder',
        type: 'wellness',
        category: 'exercise',
        titleTemplate: 'وقت التمارين الآمنة 🤸‍♀️',
        bodyTemplate: 'ما رأيك في ممارسة تمارين بسيطة؟ المشي أو اليوغا مفيدان جداً في الأسبوع {week}.',
        triggers: {
          timeOfDay: ['morning', 'afternoon']
        },
        priority: 'medium',
        variables: ['week', 'exerciseType']
      },
      {
        id: 'nutrition_reminder',
        type: 'wellness',
        category: 'nutrition',
        titleTemplate: 'وجبة صحية 🥗',
        bodyTemplate: 'تذكري تناول وجبة متوازنة تحتوي على البروتين والخضروات. في الأسبوع {week}، جسمك يحتاج تغذية إضافية.',
        triggers: {
          timeOfDay: ['morning', 'afternoon', 'evening']
        },
        priority: 'medium',
        variables: ['week', 'mealType']
      },
      {
        id: 'rest_reminder',
        type: 'wellness',
        category: 'rest',
        titleTemplate: 'وقت الراحة 😴',
        bodyTemplate: 'حان وقت الراحة والاسترخاء. جسمك يعمل بجد لنمو طفلك، فلا تترددي في أخذ قسط من الراحة.',
        triggers: {
          timeOfDay: ['afternoon', 'evening']
        },
        priority: 'low',
        variables: ['week']
      },

      // المحتوى التعليمي
      {
        id: 'weekly_tip',
        type: 'educational',
        category: 'weeklyTips',
        titleTemplate: 'نصيحة الأسبوع {week} 📖',
        bodyTemplate: 'اكتشفي ما هو جديد في الأسبوع {week} من الحمل! لدينا نصائح مهمة ومعلومات مفيدة في انتظارك.',
        triggers: {
          timeOfDay: ['morning']
        },
        priority: 'medium',
        variables: ['week', 'tipTitle']
      },
      {
        id: 'osman_tip',
        type: 'educational',
        category: 'osmanTips',
        titleTemplate: 'عثمانيات الحمل 👨‍⚕️',
        bodyTemplate: 'د. عثمان لديه نصيحة خاصة لك هذا الأسبوع! اكتشفي التجارب والنصائح الشخصية في قسم "عثمانيات الحمل".',
        triggers: {
          timeOfDay: ['evening']
        },
        priority: 'medium',
        variables: ['week']
      },
      {
        id: 'new_article',
        type: 'educational',
        category: 'newArticles',
        titleTemplate: 'مقال جديد 📰',
        bodyTemplate: 'تم إضافة مقال جديد: "{articleTitle}". اقرئيه الآن في المكتبة التعليمية!',
        triggers: {
          timeOfDay: ['morning', 'evening']
        },
        priority: 'low',
        variables: ['articleTitle', 'category']
      },

      // التنبيهات الطارئة
      {
        id: 'urgent_symptoms',
        type: 'emergency',
        category: 'urgentSymptoms',
        titleTemplate: '⚠️ أعراض تحتاج انتباه',
        bodyTemplate: 'إذا كنت تعانين من: نزيف، آلام شديدة، أو صداع قوي، يرجى التواصل مع طبيبك فوراً.',
        triggers: {
          pregnancyWeek: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          timeOfDay: ['morning']
        },
        priority: 'urgent',
        variables: ['symptoms']
      },
      {
        id: 'appointment_reminder',
        type: 'emergency',
        category: 'appointmentReminders',
        titleTemplate: 'تذكير: موعد طبي غداً 📅',
        bodyTemplate: 'لديك موعد طبي غداً في {appointmentTime}. تأكدي من تحضير التحاليل والأسئلة اللازمة.',
        triggers: {
          timeOfDay: ['evening']
        },
        priority: 'high',
        variables: ['appointmentTime', 'doctorName', 'location']
      }
    ];

    setTemplates(notificationTemplates);
  };

  // إنشاء تذكيرات أسبوعية
  const generateWeeklyNotifications = (week: number) => {
    if (!settings.enabled) return;

    const newNotifications: ScheduledNotification[] = [];
    const now = new Date();

    templates.forEach(template => {
      // التحقق من إذا كان القالب ينطبق على هذا الأسبوع
      if (template.triggers.pregnancyWeek && 
          !template.triggers.pregnancyWeek.includes(week)) {
        return;
      }

      // التحقق من الإعدادات المطلوبة
      if (!isNotificationTypeEnabled(template.type, template.category)) {
        return;
      }

      // إنشاء إشعارات لأوقات مختلفة في اليوم
      template.triggers.timeOfDay?.forEach(timeOfDay => {
        const scheduledTime = getScheduledTime(timeOfDay);
        
        const notification: ScheduledNotification = {
          id: `${template.id}_${week}_${timeOfDay}_${Date.now()}`,
          type: template.type as any,
          title: template.titleTemplate.replace('{week}', week.toString()),
          body: template.bodyTemplate.replace('{week}', week.toString()),
          scheduledTime,
          category: template.category,
          priority: template.priority,
          week,
          isRecurring: false,
          sent: false,
          acknowledged: false,
          customData: {
            templateId: template.id,
            timeOfDay
          }
        };

        newNotifications.push(notification);
      });
    });

    // إضافة الإشعارات الجديدة
    setScheduledNotifications(prev => {
      const updated = [...prev, ...newNotifications];
      localStorage.setItem('smartScheduledNotifications', JSON.stringify(updated));
      return updated;
    });

    if (newNotifications.length > 0) {
      toast({
        title: "تم إنشاء التذكيرات",
        description: `تم إنشاء ${newNotifications.length} تذكير جديد للأسبوع ${week}`,
      });
    }
  };

  // التحقق من تفعيل نوع الإشعار
  const isNotificationTypeEnabled = (type: string, category: string): boolean => {
    switch (type) {
      case 'medical':
        return settings.medicalReminders.enabled && 
               (settings.medicalReminders as any)[category];
      case 'wellness':
        return settings.wellnessReminders.enabled && 
               (settings.wellnessReminders as any)[category];
      case 'educational':
        return settings.educationalContent.enabled && 
               (settings.educationalContent as any)[category];
      case 'emergency':
        return settings.emergencyAlerts.enabled && 
               (settings.emergencyAlerts as any)[category];
      default:
        return true;
    }
  };

  // حساب وقت الإشعار المجدول
  const getScheduledTime = (timeOfDay: string): Date => {
    const now = new Date();
    const scheduledTime = new Date(now);
    
    switch (timeOfDay) {
      case 'morning':
        const [mHour, mMinute] = settings.timing.morningTime.split(':');
        scheduledTime.setHours(parseInt(mHour), parseInt(mMinute), 0, 0);
        break;
      case 'afternoon':
        const [aHour, aMinute] = settings.timing.afternoonTime.split(':');
        scheduledTime.setHours(parseInt(aHour), parseInt(aMinute), 0, 0);
        break;
      case 'evening':
        const [eHour, eMinute] = settings.timing.eveningTime.split(':');
        scheduledTime.setHours(parseInt(eHour), parseInt(eMinute), 0, 0);
        break;
    }

    // إذا كان الوقت قد مضى اليوم، اجدوله للغد
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  };

  // مراقبة الإشعارات المجدولة
  const startNotificationMonitoring = () => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      
      scheduledNotifications.forEach(notification => {
        if (!notification.sent && 
            notification.scheduledTime <= now && 
            (!notification.snoozedUntil || notification.snoozedUntil <= now)) {
          sendNotification(notification);
        }
      });
    }, 60000); // فحص كل دقيقة

    // تنظيف عند إلغاء التحميل
    return () => clearInterval(checkInterval);
  };

  // إرسال إشعار
  const sendNotification = async (notification: ScheduledNotification) => {
    try {
      // إشعار المتصفح
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: notification.id,
          requireInteraction: notification.priority === 'urgent'
        });
      }

      // إشعار Toast للتطبيق
      toast({
        title: notification.title,
        description: notification.body,
        duration: notification.priority === 'urgent' ? 0 : 5000,
      });

      // تحديث حالة الإشعار
      updateNotificationStatus(notification.id, { sent: true });

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // تحديث حالة الإشعار
  const updateNotificationStatus = (notificationId: string, updates: Partial<ScheduledNotification>) => {
    setScheduledNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, ...updates }
          : notification
      );
      localStorage.setItem('smartScheduledNotifications', JSON.stringify(updated));
      return updated;
    });
  };

  // تأجيل إشعار
  const snoozeNotification = (notificationId: string, minutes: number) => {
    const snoozedUntil = new Date();
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + minutes);
    
    updateNotificationStatus(notificationId, { snoozedUntil });
    
    toast({
      title: "تم تأجيل التذكير",
      description: `سيتم التذكير مرة أخرى خلال ${minutes} دقيقة`,
    });
  };

  // تأكيد قراءة الإشعار
  const acknowledgeNotification = (notificationId: string) => {
    updateNotificationStatus(notificationId, { acknowledged: true });
  };

  // إنشاء إشعار مخصص
  const createCustomNotification = (
    title: string,
    body: string,
    scheduledTime: Date,
    type: ScheduledNotification['type'] = 'wellness',
    priority: ScheduledNotification['priority'] = 'medium'
  ) => {
    const notification: ScheduledNotification = {
      id: `custom_${Date.now()}`,
      type,
      title,
      body,
      scheduledTime,
      category: 'custom',
      priority,
      isRecurring: false,
      sent: false,
      acknowledged: false
    };

    setScheduledNotifications(prev => {
      const updated = [...prev, notification];
      localStorage.setItem('smartScheduledNotifications', JSON.stringify(updated));
      return updated;
    });

    toast({
      title: "تم إنشاء التذكير المخصص",
      description: `سيتم إرسال التذكير في: ${scheduledTime.toLocaleString('ar')}`,
    });
  };

  // حذف إشعار
  const deleteNotification = (notificationId: string) => {
    setScheduledNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      localStorage.setItem('smartScheduledNotifications', JSON.stringify(updated));
      return updated;
    });
  };

  // تحديث الإعدادات
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('smartNotificationSettings', JSON.stringify(updated));
    
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث إعدادات الإشعارات بنجاح",
    });
  };

  // الحصول على إحصائيات الإشعارات
  const getNotificationStats = () => {
    const total = scheduledNotifications.length;
    const sent = scheduledNotifications.filter(n => n.sent).length;
    const acknowledged = scheduledNotifications.filter(n => n.acknowledged).length;
    const pending = scheduledNotifications.filter(n => !n.sent && n.scheduledTime > new Date()).length;
    const overdue = scheduledNotifications.filter(n => !n.sent && n.scheduledTime <= new Date()).length;

    return {
      total,
      sent,
      acknowledged,
      pending,
      overdue,
      acknowledgeRate: sent > 0 ? (acknowledged / sent) * 100 : 0
    };
  };

  return {
    settings,
    scheduledNotifications,
    templates,
    isInitialized,
    updateSettings,
    createCustomNotification,
    snoozeNotification,
    acknowledgeNotification,
    deleteNotification,
    generateWeeklyNotifications,
    getNotificationStats,
    sendNotification: (notification: ScheduledNotification) => sendNotification(notification)
  };
};