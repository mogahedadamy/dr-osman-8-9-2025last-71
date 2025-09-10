// أنواع البيانات لنظام إدارة المحتوى الديناميكي

export interface ContentBase {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
  accessLevel: 'free' | 'premium';
  authorId: string;
  views: number;
  tags: string[];
  language: 'ar' | 'en';
  priority: number; // لترتيب العرض
}

export interface DynamicArticle extends ContentBase {
  type: 'article';
  summary: string;
  content: string;
  readTime: string;
  emoji: string;
  sections: ArticleSection[];
  sources: string[];
  relatedArticles: string[];
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
}

export interface DynamicVideo extends ContentBase {
  type: 'video';
  duration: string;
  thumbnail: string;
  description: string;
  videoUrl: string;
  localPath?: string;
  cdnUrl?: string;
  subtitles?: string;
  transcript?: string;
  relatedVideos: string[];
  downloadSize?: number;
}

export interface DynamicTip extends ContentBase {
  type: 'tip';
  week?: number;
  tipCategory: 'nutrition' | 'exercise' | 'psychological' | 'medical' | 'general';
  content: string;
  personalNote?: string;
  isPersonalExperience: boolean;
  audioUrl?: string;
  imageUrl?: string;
}

export interface DynamicEncyclopediaEntry extends ContentBase {
  type: 'encyclopedia';
  definition: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  symptoms?: string[];
  whenToSeek: string;
  letter: string;
  relatedEntries: string[];
}

export interface ArticleSection {
  id: string;
  title: string;
  content?: string;
  type: 'paragraph' | 'list' | 'tip' | 'warning' | 'image' | 'video';
  items?: string[];
  imageUrl?: string;
  videoUrl?: string;
  order: number;
}

export type DynamicContent = 
  | DynamicArticle 
  | DynamicVideo 
  | DynamicTip 
  | DynamicEncyclopediaEntry;

// إحصائيات المحتوى
export interface ContentAnalytics {
  contentId: string;
  totalViews: number;
  uniqueViews: number;
  shareCount: number;
  averageTimeSpent: number;
  completionRate?: number; // للفيديوهات
  bounceRate: number;
  lastViewed: Date;
}

// تقييمات المستخدمين
export interface ContentRating {
  id: string;
  contentId: string;
  userId: string;
  rating: number; // 1-5
  review?: string;
  isVerified: boolean;
  createdAt: Date;
}

// فئات المحتوى الديناميكية
export interface ContentCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  icon: string;
  parentCategoryId?: string;
  order: number;
  isActive: boolean;
}

// تحديثات المحتوى
export interface ContentUpdate {
  id: string;
  contentId: string;
  updateType: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished';
  changes: Record<string, any>;
  authorId: string;
  timestamp: Date;
  version: number;
}

// إعدادات المزامنة
export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // بالدقائق
  wifiOnly: boolean;
  downloadImages: boolean;
  downloadVideos: boolean;
  maxCacheSize: number; // بالMB
  lastSyncDate: Date;
}

// حالة المزامنة
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAttempt: Date;
  lastSuccessfulSync: Date;
  pendingChanges: number;
  syncProgress: number; // 0-100
  errors: string[];
}