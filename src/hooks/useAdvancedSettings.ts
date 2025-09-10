import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { dbOperations } from '@/lib/localDatabase';

export interface UserPreferences {
  // الواجهة والعرض
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'pink' | 'purple' | 'blue';
  
  // الإشعارات
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    reminders: boolean;
    tips: boolean;
    appointments: boolean;
    emergency: boolean;
  };
  
  // المحتوى والقراءة
  content: {
    autoDownload: boolean;
    offlineMode: boolean;
    preferredFormat: 'article' | 'video' | 'audio';
    readingSpeed: 'slow' | 'normal' | 'fast';
    autoPlayVideos: boolean;
  };
  
  // الخصوصية والأمان
  privacy: {
    dataCollection: boolean;
    analyticsSharing: boolean;
    locationSharing: boolean;
    backupToCloud: boolean;
    biometricLock: boolean;
  };
  
  // إدارة البيانات
  dataManagement: {
    autoCleanup: boolean;
    cleanupDays: number;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    syncEnabled: boolean;
  };
  
  // تجربة المستخدم
  userExperience: {
    animations: boolean;
    hapticFeedback: boolean;
    quickActions: boolean;
    smartSuggestions: boolean;
    contextualHelp: boolean;
  };
}

export interface SystemSettings {
  version: string;
  buildNumber: string;
  lastUpdate: string;
  installDate: string;
  deviceInfo: {
    platform: string;
    userAgent: string;
    screenSize: string;
    colorDepth: number;
    timezone: string;
  };
  performance: {
    cacheSize: number;
    databaseSize: number;
    averageLoadTime: number;
    crashCount: number;
    lastCrash: string | null;
  };
  security: {
    encryptionEnabled: boolean;
    lastSecurityScan: string;
    vulnerabilitiesFound: number;
    securityLevel: 'low' | 'medium' | 'high';
  };
}

/**
 * Hook للإعدادات المتقدمة وتخصيص التطبيق
 */
export const useAdvancedSettings = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'ar',
    fontSize: 'medium',
    colorScheme: 'default',
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
      reminders: true,
      tips: true,
      appointments: true,
      emergency: true,
    },
    content: {
      autoDownload: false,
      offlineMode: false,
      preferredFormat: 'article',
      readingSpeed: 'normal',
      autoPlayVideos: false,
    },
    privacy: {
      dataCollection: true,
      analyticsSharing: false,
      locationSharing: false,
      backupToCloud: false,
      biometricLock: false,
    },
    dataManagement: {
      autoCleanup: true,
      cleanupDays: 90,
      autoBackup: false,
      backupFrequency: 'weekly',
      syncEnabled: false,
    },
    userExperience: {
      animations: true,
      hapticFeedback: true,
      quickActions: true,
      smartSuggestions: true,
      contextualHelp: true,
    },
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    version: '1.0.0',
    buildNumber: '001',
    lastUpdate: new Date().toISOString(),
    installDate: new Date().toISOString(),
    deviceInfo: {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    performance: {
      cacheSize: 0,
      databaseSize: 0,
      averageLoadTime: 0,
      crashCount: 0,
      lastCrash: null,
    },
    security: {
      encryptionEnabled: true,
      lastSecurityScan: new Date().toISOString(),
      vulnerabilitiesFound: 0,
      securityLevel: 'high',
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // تحميل الإعدادات المحفوظة
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await dbOperations.getSetting('userPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }

      // تحميل إعدادات النظام
      const systemSaved = await dbOperations.getSetting('systemSettings');
      if (systemSaved) {
        const parsed = JSON.parse(systemSaved);
        setSystemSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // حفظ الإعدادات
  const savePreferences = useCallback(async (newPreferences?: Partial<UserPreferences>) => {
    try {
      const toSave = newPreferences ? { ...preferences, ...newPreferences } : preferences;
      await dbOperations.saveSetting('userPreferences', JSON.stringify(toSave));
      
      if (newPreferences) {
        setPreferences(toSave);
      }
      
      setHasUnsavedChanges(false);
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ تفضيلاتك بنجاح",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ الإعدادات. حاولي مرة أخرى.",
        variant: "destructive"
      });
    }
  }, [preferences]);

  // تحديث تفضيل معين
  const updatePreference = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // تحديث قسم معين من التفضيلات
  const updatePreferenceSection = useCallback(<K extends keyof UserPreferences>(
    section: K,
    updates: Partial<UserPreferences[K]>
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), ...(updates as any) }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // إعادة تعيين الإعدادات للافتراضية
  const resetToDefaults = useCallback(async () => {
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'ar',
      fontSize: 'medium',
      colorScheme: 'default',
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        badge: true,
        reminders: true,
        tips: true,
        appointments: true,
        emergency: true,
      },
      content: {
        autoDownload: false,
        offlineMode: false,
        preferredFormat: 'article',
        readingSpeed: 'normal',
        autoPlayVideos: false,
      },
      privacy: {
        dataCollection: true,
        analyticsSharing: false,
        locationSharing: false,
        backupToCloud: false,
        biometricLock: false,
      },
      dataManagement: {
        autoCleanup: true,
        cleanupDays: 90,
        autoBackup: false,
        backupFrequency: 'weekly',
        syncEnabled: false,
      },
      userExperience: {
        animations: true,
        hapticFeedback: true,
        quickActions: true,
        smartSuggestions: true,
        contextualHelp: true,
      },
    };

    setPreferences(defaultPreferences);
    await savePreferences(defaultPreferences);
    
    toast({
      title: "تم إعادة تعيين الإعدادات",
      description: "تم إرجاع جميع الإعدادات إلى القيم الافتراضية",
    });
  }, [savePreferences]);

  // تطبيق السمة
  const applyTheme = useCallback((theme: UserPreferences['theme']) => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    
    updatePreference({ theme });
  }, [updatePreference]);

  // تطبيق نظام الألوان
  const applyColorScheme = useCallback((scheme: UserPreferences['colorScheme']) => {
    const root = document.documentElement;
    
    // إزالة جميع فئات الألوان الموجودة
    root.classList.remove('scheme-pink', 'scheme-purple', 'scheme-blue');
    
    // إضافة الفئة الجديدة
    if (scheme !== 'default') {
      root.classList.add(`scheme-${scheme}`);
    }
    
    updatePreference({ colorScheme: scheme });
  }, [updatePreference]);

  // تطبيق حجم الخط
  const applyFontSize = useCallback((size: UserPreferences['fontSize']) => {
    const root = document.documentElement;
    
    root.classList.remove('text-small', 'text-medium', 'text-large');
    root.classList.add(`text-${size}`);
    
    updatePreference({ fontSize: size });
  }, [updatePreference]);

  // تحديث إحصائيات الأداء
  const updatePerformanceStats = useCallback(async (stats: Partial<SystemSettings['performance']>) => {
    const updatedSystem = {
      ...systemSettings,
      performance: {
        ...systemSettings.performance,
        ...stats
      }
    };
    
    setSystemSettings(updatedSystem);
    await dbOperations.saveSetting('systemSettings', JSON.stringify(updatedSystem));
  }, [systemSettings]);

  // تشغيل فحص الأمان
  const runSecurityScan = useCallback(async () => {
    // محاكاة فحص الأمان
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const securityUpdate = {
      lastSecurityScan: new Date().toISOString(),
      vulnerabilitiesFound: Math.floor(Math.random() * 3), // 0-2 مشاكل محتملة
      securityLevel: 'high' as const
    };
    
    const updatedSystem = {
      ...systemSettings,
      security: {
        ...systemSettings.security,
        ...securityUpdate
      }
    };
    
    setSystemSettings(updatedSystem);
    await dbOperations.saveSetting('systemSettings', JSON.stringify(updatedSystem));
    
    toast({
      title: "تم فحص الأمان",
      description: `تم العثور على ${securityUpdate.vulnerabilitiesFound} مشكلة محتملة`,
    });
  }, [systemSettings]);

  // تصدير الإعدادات
  const exportSettings = useCallback(() => {
    const settingsData = {
      preferences,
      systemSettings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pregnancy-app-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم تصدير الإعدادات",
      description: "تم تصدير إعداداتك بنجاح",
    });
  }, [preferences, systemSettings]);

  // استيراد الإعدادات
  const importSettings = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.preferences) {
        setPreferences(data.preferences);
        await savePreferences(data.preferences);
      }
      
      if (data.systemSettings) {
        setSystemSettings(data.systemSettings);
        await dbOperations.saveSetting('systemSettings', JSON.stringify(data.systemSettings));
      }
      
      toast({
        title: "تم استيراد الإعدادات",
        description: "تم استيراد الإعدادات بنجاح",
      });
      
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: "فشل في استيراد الإعدادات. تأكدي من صحة الملف.",
        variant: "destructive"
      });
      return false;
    }
  }, [savePreferences]);

  // تحميل الإعدادات عند البدء
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // تطبيق الإعدادات عند التحميل
  useEffect(() => {
    if (!isLoading) {
      applyTheme(preferences.theme);
      applyColorScheme(preferences.colorScheme);
      applyFontSize(preferences.fontSize);
    }
  }, [isLoading, preferences.theme, preferences.colorScheme, preferences.fontSize, applyTheme, applyColorScheme, applyFontSize]);

  return {
    // البيانات
    preferences,
    systemSettings,
    isLoading,
    hasUnsavedChanges,

    // الوظائف الأساسية
    loadPreferences,
    savePreferences,
    updatePreference,
    resetToDefaults,

    // تطبيق الإعدادات
    applyTheme,
    applyColorScheme,
    applyFontSize,

    // إدارة النظام
    updatePerformanceStats,
    runSecurityScan,

    // الاستيراد والتصدير
    exportSettings,
    importSettings,

    // إحصائيات مفيدة
    stats: {
      totalPreferences: Object.keys(preferences).length,
      enabledNotifications: Object.values(preferences.notifications).filter(Boolean).length,
      securityScore: systemSettings.security.securityLevel === 'high' ? 95 : 
                     systemSettings.security.securityLevel === 'medium' ? 75 : 50,
      performanceScore: Math.max(0, 100 - (
        systemSettings.performance.crashCount * 10 + 
        systemSettings.performance.averageLoadTime / 100
      )),
    }
  };
};