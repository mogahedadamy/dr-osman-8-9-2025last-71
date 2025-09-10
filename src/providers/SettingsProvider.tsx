import React, { createContext, useContext, ReactNode } from 'react';

export interface AppSettings {
  notifications: boolean;
  dailyReminders: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  exerciseReminders: boolean;
  darkMode: boolean;
  language: 'ar' | 'en';
  reminderSound: string;
  reminderTime: string;
  dataBackup: boolean;
  shareAnalytics: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  dailyReminders: true,
  appointmentReminders: true,
  medicationReminders: true,
  exerciseReminders: false,
  darkMode: false,
  language: 'ar',
  reminderSound: 'default',
  reminderTime: '08:00',
  dataBackup: true,
  shareAnalytics: false
};

// Internal settings hook - not exported to avoid circular dependencies
const useInternalSettings = () => {
  const [settings, setSettings] = React.useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply theme changes
  React.useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Apply language changes
  React.useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  // Auto backup data
  React.useEffect(() => {
    if (settings.dataBackup) {
      const interval = setInterval(() => {
        try {
          const backupData = {
            timestamp: new Date().toISOString(),
            settings,
            reminders: JSON.parse(localStorage.getItem('reminders') || '[]'),
            dailyLogs: JSON.parse(localStorage.getItem('dailyLogs') || '[]'),
            profile: JSON.parse(localStorage.getItem('pregnancyProfile') || '{}')
          };
          localStorage.setItem('autoBackup', JSON.stringify(backupData));
          console.log('🔄 Auto backup completed');
        } catch (error) {
          console.error('Auto backup failed:', error);
        }
      }, 24 * 60 * 60 * 1000); // Daily backup

      return () => clearInterval(interval);
    }
  }, [settings.dataBackup, settings]);

  const updateSetting = React.useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      
      // Handle special settings
      if (key === 'notifications' && value === true) {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }, [settings]);

  const resetSettings = React.useCallback(() => {
    try {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }, []);

  const exportSettings = React.useCallback(() => {
    try {
      const data = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
    }
  }, [settings]);

  const importSettings = React.useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          localStorage.setItem('appSettings', JSON.stringify(data.settings));
        }
      } catch (error) {
        console.error('Error importing settings:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    isLoading: false
  };
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: (file: File) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export const useSettingsContext = () => {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

// Convenience hook for theme
export const useTheme = () => {
  const { settings } = useSettingsContext();
  return {
    isDarkMode: settings.darkMode,
    theme: settings.darkMode ? 'dark' : 'light'
  };
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const settingsHook = useInternalSettings();

  const contextValue = {
    ...settingsHook,
    isDarkMode: settingsHook.settings.darkMode
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Export settings hook that uses context
export const useSettings = () => {
  const context = useSettingsContext();
  return {
    settings: context.settings,
    updateSetting: context.updateSetting,
    resetSettings: context.resetSettings,
    exportSettings: context.exportSettings,
    importSettings: context.importSettings,
    isLoading: context.isLoading
  };
};