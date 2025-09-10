// Core types for the pregnancy companion app

export interface Reminder {
  id: number;
  title: string;
  time: string;
  date: string;
  type: 'medical' | 'medication' | 'appointment' | 'exercise';
  enabled: boolean;
  completed: boolean;
  description?: string;
  frequency?: string;
  // خصائص إضافية للمواعيد الطبية
  doctorName?: string;
  specialty?: string;
  location?: string;
  phoneNumber?: string;
  appointmentType?: 'checkup' | 'ultrasound' | 'test' | 'consultation';
}

export interface Video {
  id: number;
  title: string;
  duration: string;
  category: string;
  thumbnail: string;
  rating: number;
  views: string;
  localPath?: string; // مسار الفيديو المضمّن داخل التطبيق
  remoteUrl?: string; // رابط CDN للفيديو الكامل
  offlineUri?: string; // مسار الملف المحمّل داخل مساحة التطبيق
  accessLevel?: 'free' | 'premium';
}

export interface Article {
  id: number;
  title: string;
  readTime: string;
  category: string;
  emoji: string;
  summary: string;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface WeeklyTip {
  icon: string;
  title: string;
  content: string;
}

export interface WeeklyData {
  title: string;
  tips: WeeklyTip[];
}

// Pregnancy tracking types
export interface PregnancyInfo {
  id: string;
  lastPeriodDate: string;
  currentWeek: number;
  dueDate: string;
  estimatedDueDate: string;
  pregnancyStartDate: string;
  isActive: boolean;
}

export interface BellyPhoto {
  id: string;
  week: number;
  date: string;
  photo: string; // Base64 encoded image
  notes?: string;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  week: number;
  weight: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface AppointmentReminder extends Reminder {
  doctorName?: string;
  location?: string;
  phoneNumber?: string;
  notes?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  reminders: boolean;
  appointments: boolean;
  dailyLogs: boolean;
  weeklyTips: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export type LibraryTab = 'videos' | 'articles' | 'encyclopedia';
export type ReminderType = 'medical' | 'medication' | 'appointment' | 'exercise';