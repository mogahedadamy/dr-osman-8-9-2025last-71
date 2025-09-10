import { useState, useEffect } from 'react';
import { localDB, dbOperations } from '@/lib/localDatabase';

// Custom hook for localStorage with TypeScript support
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Watch for changes to the key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue];
}

// Additional utility hooks for common use cases
export function useLocalStorageString(key: string, initialValue: string = '') {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageNumber(key: string, initialValue: number = 0) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageBoolean(key: string, initialValue: boolean = false) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  return useLocalStorage<T[]>(key, initialValue);
}

export function useLocalStorageObject<T extends object>(key: string, initialValue: T) {
  return useLocalStorage<T>(key, initialValue);
}

// Hook لاستخدام قاعدة البيانات المحلية
export const useLocalDB = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        await localDB.init();
        setIsReady(true);
      } catch (error) {
        console.error('فشل في تهيئة قاعدة البيانات المحلية:', error);
      }
    };

    initDB();
  }, []);

  return { isReady, localDB, dbOperations };
};

// Hook للملف الشخصي
export const useUserProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isReady } = useLocalDB();

  const loadProfile = async () => {
    if (!isReady) return;
    
    try {
      const savedProfile = await dbOperations.getUserProfile();
      setProfile(savedProfile);
    } catch (error) {
      console.error('خطأ في تحميل الملف الشخصي:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newProfile: any) => {
    try {
      await dbOperations.saveUserProfile(newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('خطأ في حفظ الملف الشخصي:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [isReady]);

  return {
    profile,
    loading,
    saveProfile,
    reloadProfile: loadProfile
  };
};

// Hook للتذكيرات
export const useRemindersDB = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isReady } = useLocalDB();

  const loadReminders = async () => {
    if (!isReady) return;
    
    try {
      const savedReminders = await dbOperations.getReminders();
      setReminders(savedReminders || []);
    } catch (error) {
      console.error('خطأ في تحميل التذكيرات:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (reminder: any) => {
    try {
      const newReminder = { ...reminder, id: Date.now().toString() };
      await dbOperations.saveReminder(newReminder);
      setReminders(prev => [...prev, newReminder]);
      return newReminder;
    } catch (error) {
      console.error('خطأ في إضافة التذكير:', error);
    }
  };

  const updateReminder = async (id: string, updates: any) => {
    try {
      await localDB.update('reminders', id, updates);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (error) {
      console.error('خطأ في تحديث التذكير:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await localDB.delete('reminders', id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('خطأ في حذف التذكير:', error);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [isReady]);

  return {
    reminders,
    loading,
    addReminder,
    updateReminder,
    deleteReminder,
    reloadReminders: loadReminders
  };
};

// Hook لليوميات
export const useDailyLogsDB = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isReady } = useLocalDB();

  const loadLogs = async () => {
    if (!isReady) return;
    
    try {
      const savedLogs = await dbOperations.getDailyLogs();
      setLogs(savedLogs || []);
    } catch (error) {
      console.error('خطأ في تحميل اليوميات:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (log: any) => {
    try {
      const newLog = { ...log, id: Date.now().toString() };
      await dbOperations.saveDailyLog(newLog);
      setLogs(prev => [...prev, newLog]);
      return newLog;
    } catch (error) {
      console.error('خطأ في إضافة اليومية:', error);
    }
  };

  const updateLog = async (id: string, updates: any) => {
    try {
      await localDB.update('dailyLogs', id, updates);
      setLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    } catch (error) {
      console.error('خطأ في تحديث اليومية:', error);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [isReady]);

  return {
    logs,
    loading,
    addLog,
    updateLog,
    reloadLogs: loadLogs
  };
};

// Hook لصور البطن
export const useBellyPhotosDB = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isReady } = useLocalDB();

  const loadPhotos = async () => {
    if (!isReady) return;
    
    try {
      const savedPhotos = await dbOperations.getBellyPhotos();
      setPhotos(savedPhotos?.sort((a: any, b: any) => a.week - b.week) || []);
    } catch (error) {
      console.error('خطأ في تحميل الصور:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async (photo: any) => {
    try {
      const newPhoto = { ...photo, id: Date.now().toString() };
      await dbOperations.saveBellyPhoto(newPhoto);
      setPhotos(prev => [...prev, newPhoto].sort((a, b) => a.week - b.week));
      return newPhoto;
    } catch (error) {
      console.error('خطأ في إضافة الصورة:', error);
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      await localDB.delete('bellyPhotos', id);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [isReady]);

  return {
    photos,
    loading,
    addPhoto,
    deletePhoto,
    reloadPhotos: loadPhotos
  };
};

// Hook للإعدادات
export const useSettingsDB = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { isReady } = useLocalDB();

  const loadSettings = async () => {
    if (!isReady) return;
    
    try {
      const allSettings = await localDB.getAll('settings');
      const settingsObj = allSettings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      setSettings(settingsObj);
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await dbOperations.saveSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [isReady]);

  return {
    settings,
    loading,
    updateSetting,
    reloadSettings: loadSettings
  };
};