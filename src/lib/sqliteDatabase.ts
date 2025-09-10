import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

class SQLiteService {
  private sqliteConnection: SQLiteConnection;
  private database: SQLiteDBConnection | null = null;
  private isInitialized = false;
  private readonly DB_NAME = 'pregnancy_app_db';
  private readonly DB_VERSION = 1;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // التحقق من دعم المنصة لـ SQLite
      if (!Capacitor.isNativePlatform()) {
        console.log('SQLite not available on web platform, falling back to IndexedDB');
        return false;
      }

      // إنشاء قاعدة البيانات
      const ret = await this.sqliteConnection.checkConnectionsConsistency();
      const isConn = (await this.sqliteConnection.isConnection(this.DB_NAME, false)).result;
      
      if (ret.result && isConn) {
        this.database = await this.sqliteConnection.retrieveConnection(this.DB_NAME, false);
      } else {
        this.database = await this.sqliteConnection.createConnection(
          this.DB_NAME,
          false,
          'no-encryption',
          this.DB_VERSION,
          false
        );
      }

      await this.database.open();
      await this.createTables();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      return false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const tables = [
      // جدول المستخدم والملف الشخصي
      `CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT,
        email TEXT,
        due_date TEXT,
        pregnancy_week INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`,
      
      // جدول التذكيرات
      `CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME NOT NULL,
        completed INTEGER DEFAULT 0,
        category TEXT,
        priority TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`,
      
      // جدول اليوميات والملاحظات
      `CREATE TABLE IF NOT EXISTS daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        mood TEXT,
        symptoms TEXT,
        notes TEXT,
        weight REAL,
        blood_pressure TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`,
      
      // جدول صور البطن
      `CREATE TABLE IF NOT EXISTS belly_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_path TEXT NOT NULL,
        pregnancy_week INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`,
      
      // جدول الفحوصات الطبية
      `CREATE TABLE IF NOT EXISTS medical_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_name TEXT NOT NULL,
        test_date TEXT NOT NULL,
        result TEXT,
        doctor_notes TEXT,
        file_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`,
      
      // جدول متابعة الوزن
      `CREATE TABLE IF NOT EXISTS weight_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        bmi REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`,
      
      // جدول المفضلة
      `CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`,
      
      // جدول الإعدادات
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );`
    ];

    for (const tableSQL of tables) {
      await this.database.execute(tableSQL);
    }
  }

  // العمليات الأساسية للمستخدم
  async saveUserProfile(profile: any): Promise<boolean> {
    if (!this.database) return false;

    try {
      const query = `
        INSERT OR REPLACE INTO user_profile 
        (user_id, name, email, due_date, pregnancy_week, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      await this.database.run(query, [
        profile.userId || 'default',
        profile.name,
        profile.email,
        profile.dueDate,
        profile.pregnancyWeek
      ]);
      
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  async getUserProfile(): Promise<any | null> {
    if (!this.database) return null;

    try {
      const result = await this.database.query('SELECT * FROM user_profile ORDER BY updated_at DESC LIMIT 1');
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // عمليات التذكيرات
  async saveReminder(reminder: any): Promise<boolean> {
    if (!this.database) return false;

    try {
      const query = `
        INSERT INTO reminders 
        (title, description, due_date, category, priority, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      await this.database.run(query, [
        reminder.title,
        reminder.description,
        reminder.dueDate,
        reminder.category || 'general',
        reminder.priority || 'medium'
      ]);
      
      return true;
    } catch (error) {
      console.error('Error saving reminder:', error);
      return false;
    }
  }

  async getReminders(): Promise<any[]> {
    if (!this.database) return [];

    try {
      const result = await this.database.query('SELECT * FROM reminders ORDER BY due_date ASC');
      return result.values || [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  async updateReminder(id: number, updates: any): Promise<boolean> {
    if (!this.database) return false;

    try {
      const query = `
        UPDATE reminders 
        SET title = ?, description = ?, due_date = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await this.database.run(query, [
        updates.title,
        updates.description,
        updates.dueDate,
        updates.completed ? 1 : 0,
        id
      ]);
      
      return true;
    } catch (error) {
      console.error('Error updating reminder:', error);
      return false;
    }
  }

  // عمليات اليوميات
  async saveDailyLog(log: any): Promise<boolean> {
    if (!this.database) return false;

    try {
      const query = `
        INSERT OR REPLACE INTO daily_logs 
        (date, mood, symptoms, notes, weight, blood_pressure, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      await this.database.run(query, [
        log.date,
        log.mood,
        log.symptoms,
        log.notes,
        log.weight,
        log.bloodPressure
      ]);
      
      return true;
    } catch (error) {
      console.error('Error saving daily log:', error);
      return false;
    }
  }

  async getDailyLogs(limit: number = 30): Promise<any[]> {
    if (!this.database) return [];

    try {
      const result = await this.database.query(
        'SELECT * FROM daily_logs ORDER BY date DESC LIMIT ?',
        [limit]
      );
      return result.values || [];
    } catch (error) {
      console.error('Error getting daily logs:', error);
      return [];
    }
  }

  // عمليات المفضلة
  async saveFavorite(favorite: any): Promise<boolean> {
    if (!this.database) return false;

    try {
      const query = `
        INSERT OR IGNORE INTO favorites 
        (content_id, content_type, title)
        VALUES (?, ?, ?)
      `;
      
      await this.database.run(query, [
        favorite.contentId,
        favorite.contentType,
        favorite.title
      ]);
      
      return true;
    } catch (error) {
      console.error('Error saving favorite:', error);
      return false;
    }
  }

  async getFavorites(): Promise<any[]> {
    if (!this.database) return [];

    try {
      const result = await this.database.query('SELECT * FROM favorites ORDER BY created_at DESC');
      return result.values || [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // عمليات المزامنة
  async getUnsyncedData(): Promise<{ table: string; data: any[] }[]> {
    if (!this.database) return [];

    const tables = ['user_profile', 'reminders', 'daily_logs', 'medical_tests', 'weight_tracking', 'favorites'];
    const unsyncedData: { table: string; data: any[] }[] = [];

    try {
      for (const table of tables) {
        const result = await this.database.query(
          `SELECT * FROM ${table} WHERE synced_at IS NULL OR updated_at > synced_at`
        );
        
        if (result.values && result.values.length > 0) {
          unsyncedData.push({
            table,
            data: result.values
          });
        }
      }
      
      return unsyncedData;
    } catch (error) {
      console.error('Error getting unsynced data:', error);
      return [];
    }
  }

  async markAsSynced(table: string, ids: number[]): Promise<boolean> {
    if (!this.database || ids.length === 0) return false;

    try {
      const placeholders = ids.map(() => '?').join(',');
      const query = `UPDATE ${table} SET synced_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`;
      
      await this.database.run(query, ids);
      return true;
    } catch (error) {
      console.error('Error marking as synced:', error);
      return false;
    }
  }

  // إغلاق الاتصال
  async close(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
      this.isInitialized = false;
    }
  }

  // تصدير البيانات للنسخ الاحتياطي
  async exportData(): Promise<any> {
    if (!this.database) return null;

    try {
      const tables = ['user_profile', 'reminders', 'daily_logs', 'belly_photos', 'medical_tests', 'weight_tracking', 'favorites', 'settings'];
      const exportData: any = {};

      for (const table of tables) {
        const result = await this.database.query(`SELECT * FROM ${table}`);
        exportData[table] = result.values || [];
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
}

export const sqliteService = new SQLiteService();