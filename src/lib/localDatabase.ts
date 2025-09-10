// نظام قاعدة البيانات المحلية للتطبيق
class LocalDatabase {
  private dbName = 'DrOsmanApp';
  private version = 2;
  private db: IDBDatabase | null = null;

  // إعداد قاعدة البيانات
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // إنشاء جداول البيانات
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('currentUser')) {
          const currentUserStore = db.createObjectStore('currentUser', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('userProfile')) {
          const userStore = db.createObjectStore('userProfile', { keyPath: 'id' });
          userStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('reminders')) {
          const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
          reminderStore.createIndex('date', 'date', { unique: false });
          reminderStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('dailyLogs')) {
          const logStore = db.createObjectStore('dailyLogs', { keyPath: 'id' });
          logStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('bellyPhotos')) {
          const photoStore = db.createObjectStore('bellyPhotos', { keyPath: 'id' });
          photoStore.createIndex('week', 'week', { unique: false });
          photoStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('medicalTests')) {
          const testStore = db.createObjectStore('medicalTests', { keyPath: 'id' });
          testStore.createIndex('week', 'week', { unique: false });
          testStore.createIndex('completed', 'completed', { unique: false });
        }

        if (!db.objectStoreNames.contains('weightTracking')) {
          const weightStore = db.createObjectStore('weightTracking', { keyPath: 'id' });
          weightStore.createIndex('date', 'date', { unique: false });
          weightStore.createIndex('week', 'week', { unique: false });
        }

        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('paymentRequests')) {
          const paymentStore = db.createObjectStore('paymentRequests', { keyPath: 'id' });
          paymentStore.createIndex('status', 'status', { unique: false });
          paymentStore.createIndex('submittedAt', 'submittedAt', { unique: false });
        }

        // إضافة جدول الملفات الشخصية للمستخدمين
        if (!db.objectStoreNames.contains('userProfiles')) {
          const profileStore = db.createObjectStore('userProfiles', { keyPath: 'id' });
          profileStore.createIndex('userId', 'userId', { unique: false });
          profileStore.createIndex('isPremium', 'isPremium', { unique: false });
        }

        // جداول نظام الحجوزات
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientStore.createIndex('phone', 'phone', { unique: false });
          patientStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('doctors')) {
          const doctorStore = db.createObjectStore('doctors', { keyPath: 'id' });
          doctorStore.createIndex('specialization', 'specialization', { unique: false });
          doctorStore.createIndex('isActive', 'isActive', { unique: false });
        }

        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentStore = db.createObjectStore('appointments', { keyPath: 'id' });
          appointmentStore.createIndex('patientId', 'patientId', { unique: false });
          appointmentStore.createIndex('doctorId', 'doctorId', { unique: false });
          appointmentStore.createIndex('date', 'date', { unique: false });
          appointmentStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('specializations')) {
          const specializationStore = db.createObjectStore('specializations', { keyPath: 'id' });
          specializationStore.createIndex('isActive', 'isActive', { unique: false });
        }
      };
    });
  }

  // حفظ البيانات
  async save<T>(storeName: string, data: T & { id: string }): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // قراءة البيانات
  async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // قراءة جميع البيانات
  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  // البحث بالفهرس
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  // حذف البيانات
  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // تحديث البيانات
  async update<T>(storeName: string, id: string, updates: Partial<T>): Promise<void> {
    const existing = await this.get(storeName, id);
    if (existing) {
      const updated = { ...existing as any, ...updates };
      await this.save(storeName, updated as T & { id: string });
    }
  }

  // إحصائيات
  async count(storeName: string): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // تصدير البيانات
  async exportData(): Promise<any> {
    const stores = ['userProfile', 'reminders', 'dailyLogs', 'bellyPhotos', 'medicalTests', 'weightTracking', 'favorites', 'settings'];
    const exportData: any = {};

    for (const store of stores) {
      exportData[store] = await this.getAll(store);
    }

    return exportData;
  }

  // استيراد البيانات
  async importData(data: any): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      if (Array.isArray(items)) {
        for (const item of items as any[]) {
          await this.save(storeName, item);
        }
      }
    }
  }

  // تنظيف البيانات القديمة
  async cleanup(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365); // حذف البيانات الأقدم من سنة

    const oldLogs = await this.getByIndex('dailyLogs', 'date', IDBKeyRange.upperBound(cutoffDate.toISOString()));
    for (const log of oldLogs) {
      await this.delete('dailyLogs', (log as any).id);
    }
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
export const localDB = new LocalDatabase();

// دوال مساعدة للعمليات الشائعة
export const dbOperations = {
  // حفظ الملف الشخصي
  async saveUserProfile(profile: any) {
    return localDB.save('userProfile', { ...profile, id: 'main' });
  },

  // قراءة الملف الشخصي
  async getUserProfile() {
    return localDB.get('userProfile', 'main');
  },

  // حفظ تذكير
  async saveReminder(reminder: any) {
    return localDB.save('reminders', reminder);
  },

  // قراءة التذكيرات
  async getReminders() {
    return localDB.getAll('reminders');
  },

  // حفظ اليوميات
  async saveDailyLog(log: any) {
    return localDB.save('dailyLogs', log);
  },

  // قراءة اليوميات
  async getDailyLogs() {
    return localDB.getAll('dailyLogs');
  },

  // حفظ صور البطن
  async saveBellyPhoto(photo: any) {
    return localDB.save('bellyPhotos', photo);
  },

  // قراءة صور البطن
  async getBellyPhotos() {
    return localDB.getAll('bellyPhotos');
  },

  // حفظ الفحوصات الطبية
  async saveMedicalTest(test: any) {
    return localDB.save('medicalTests', test);
  },

  // قراءة الفحوصات الطبية
  async getMedicalTests() {
    return localDB.getAll('medicalTests');
  },

  // حفظ بيانات الوزن
  async saveWeightEntry(entry: any) {
    return localDB.save('weightTracking', entry);
  },

  // قراءة بيانات الوزن
  async getWeightEntries() {
    return localDB.getAll('weightTracking');
  },

  // حفظ المفضلة
  async saveFavorite(favorite: any) {
    return localDB.save('favorites', favorite);
  },

  // قراءة المفضلة
  async getFavorites() {
    return localDB.getAll('favorites');
  },

  // حفظ الإعدادات
  async saveSetting(key: string, value: any) {
    return localDB.save('settings', { key, value, id: key });
  },

  // قراءة الإعدادات
  async getSetting(key: string) {
    const result = await localDB.get('settings', key);
    return result ? (result as any).value : null;
  }
};