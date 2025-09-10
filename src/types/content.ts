// أنواع البيانات للمحتوى المحدث

export interface ContentItem {
  id: number;
  title: string;
  category: string;
  type: 'article' | 'video';
  accessLevel: 'free' | 'premium';
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  content?: string; // للمقالات
  videoUrl?: string; // للفيديوهات
  thumbnail: string;
  tags: string[];
  summary?: string;
  readTime?: string;
  duration?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentReview {
  id: string;
  contentId: number;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  isVerified: boolean; // المستخدمون المدفوعون فقط
  createdAt: Date;
}

export interface CategoryStats {
  category: string;
  totalContent: number;
  freeContent: number;
  premiumContent: number;
  totalViews: number;
}

export interface ContentStats {
  totalContent: number;
  freeContent: number;
  premiumContent: number;
  totalViews: number;
  popularContent: ContentItem[];
  categoryStats: CategoryStats[];
}