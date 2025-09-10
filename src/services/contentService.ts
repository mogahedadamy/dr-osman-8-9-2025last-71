// خدمة إدارة المحتوى الديناميكي
import { DynamicContent, DynamicArticle, DynamicVideo, DynamicTip, ContentCategory, ContentAnalytics, SyncStatus } from '@/types/cms';

export class ContentService {
  private static instance: ContentService;
  private cache: Map<string, DynamicContent> = new Map();
  private categories: Map<string, ContentCategory> = new Map();
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncAttempt: new Date(),
    lastSuccessfulSync: new Date(),
    pendingChanges: 0,
    syncProgress: 0,
    errors: []
  };

  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  // ========== إدارة المحتوى ==========
  
  async getAllContent(options?: {
    type?: string;
    category?: string;
    accessLevel?: 'free' | 'premium';
    published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<DynamicContent[]> {
    try {
      // إذا كان الكاش فارغ، حمل البيانات الافتراضية
      if (this.cache.size === 0) {
        await this.loadDefaultContent();
      }

      // البحث في الكاش أولاً
      let content = Array.from(this.cache.values());

      // تطبيق المرشحات
      if (options?.type) {
        content = content.filter(item => item.type === options.type);
      }
      if (options?.category) {
        content = content.filter(item => item.category === options.category);
      }
      if (options?.accessLevel) {
        content = content.filter(item => item.accessLevel === options.accessLevel);
      }
      if (options?.published !== undefined) {
        content = content.filter(item => item.isPublished === options.published);
      }

      // ترتيب حسب الأولوية والتاريخ
      content.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      // تطبيق التصفح
      if (options?.offset || options?.limit) {
        const start = options.offset || 0;
        const end = start + (options.limit || content.length);
        content = content.slice(start, end);
      }

      return content;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  async getContentById(id: string): Promise<DynamicContent | null> {
    try {
      // البحث في الكاش أولاً
      if (this.cache.has(id)) {
        return this.cache.get(id)!;
      }

      // إذا لم يوجد في الكاش، محاولة جلبه من الخادم
      const content = await this.fetchContentFromServer(id);
      if (content) {
        this.cache.set(id, content);
      }

      return content;
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      return null;
    }
  }

  async searchContent(query: string, type?: string): Promise<DynamicContent[]> {
    const allContent = await this.getAllContent({ type });
    const searchTerm = query.toLowerCase();

    return allContent.filter(content => 
      content.title.toLowerCase().includes(searchTerm) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      ('content' in content && content.content.toLowerCase().includes(searchTerm)) ||
      ('description' in content && content.description.toLowerCase().includes(searchTerm))
    );
  }

  // ========== إدارة الفئات ==========

  async getCategories(): Promise<ContentCategory[]> {
    try {
      if (this.categories.size === 0) {
        await this.loadCategoriesFromCache();
      }
      return Array.from(this.categories.values())
        .filter(cat => cat.isActive)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryById(id: string): Promise<ContentCategory | null> {
    if (this.categories.has(id)) {
      return this.categories.get(id)!;
    }
    return null;
  }

  // ========== المزامنة والتحديثات ==========

  async syncContent(force: boolean = false): Promise<void> {
    if (this.syncStatus.isSyncing && !force) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.lastSyncAttempt = new Date();
    this.syncStatus.syncProgress = 0;

    try {
      // فحص الاتصال
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // جلب قائمة المحتوى المحدث
      const updatedContentList = await this.getUpdatedContentList();
      
      for (let i = 0; i < updatedContentList.length; i++) {
        const contentId = updatedContentList[i];
        try {
          const content = await this.fetchContentFromServer(contentId);
          if (content) {
            this.cache.set(contentId, content);
            await this.saveContentToLocalStorage(content);
          }
        } catch (error) {
          console.error(`Error syncing content ${contentId}:`, error);
        }
        
        this.syncStatus.syncProgress = ((i + 1) / updatedContentList.length) * 100;
      }

      this.syncStatus.lastSuccessfulSync = new Date();
      this.syncStatus.errors = [];

    } catch (error) {
      console.error('Sync error:', error);
      this.syncStatus.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.syncStatus.isSyncing = false;
      this.syncStatus.syncProgress = 100;
    }
  }

  // ========== إدارة الكاش والتخزين المحلي ==========

  async loadFromLocalStorage(): Promise<void> {
    try {
      const storedContent = localStorage.getItem('dynamic_content');
      if (storedContent) {
        const content: DynamicContent[] = JSON.parse(storedContent);
        content.forEach(item => {
          this.cache.set(item.id, item);
        });
      }

      const storedCategories = localStorage.getItem('content_categories');
      if (storedCategories) {
        const categories: ContentCategory[] = JSON.parse(storedCategories);
        categories.forEach(cat => {
          this.categories.set(cat.id, cat);
        });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  async saveContentToLocalStorage(content: DynamicContent): Promise<void> {
    try {
      this.cache.set(content.id, content);
      const allContent = Array.from(this.cache.values());
      localStorage.setItem('dynamic_content', JSON.stringify(allContent));
      
      console.log(`💾 Saved ${allContent.length} items to localStorage`);
      console.log('🔍 Content in cache:', Array.from(this.cache.keys()));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    this.categories.clear();
    localStorage.removeItem('dynamic_content');
    localStorage.removeItem('content_categories');
  }

  // ========== وظائف مساعدة خاصة ==========

  private async fetchContentFromServer(id: string): Promise<DynamicContent | null> {
    // TODO: سيتم ربطها بـ Supabase لاحقاً
    return null;
  }

  private async getUpdatedContentList(): Promise<string[]> {
    // TODO: سيتم ربطها بـ Supabase لاحقاً
    return [];
  }

  private async loadCategoriesFromCache(): Promise<void> {
    // تحميل مؤقت للفئات الافتراضية
    const defaultCategories: ContentCategory[] = [
      {
        id: 'health',
        name: 'صحة',
        nameEn: 'Health',
        description: 'نصائح ومعلومات صحية',
        color: '#ef4444',
        icon: '🏥',
        order: 1,
        isActive: true
      },
      {
        id: 'nutrition',
        name: 'تغذية',
        nameEn: 'Nutrition',
        description: 'نصائح التغذية الصحية',
        color: '#22c55e',
        icon: '🥗',
        order: 2,
        isActive: true
      },
      {
        id: 'exercise',
        name: 'تمارين',
        nameEn: 'Exercise',
        description: 'تمارين آمنة للحوامل',
        color: '#3b82f6',
        icon: '🤸‍♀️',
        order: 3,
        isActive: true
      }
    ];

    defaultCategories.forEach(cat => {
      this.categories.set(cat.id, cat);
    });
  }

  // ========== معلومات حالة المزامنة ==========

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // ========== إدارة المحتوى (للمدير) ==========

  async saveContent(content: any): Promise<DynamicContent> {
    const now = new Date();
    const newContent = {
      ...content,
      id: content.id || crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      views: 0
    } as DynamicContent;

    console.log('💾 Saving content:', newContent);
    
    this.cache.set(newContent.id, newContent);
    await this.saveContentToLocalStorage(newContent);
    
    // إشعار المستخدمين بالمحتوى الجديد
    this.notifyContentUpdate('created', newContent);
    
    console.log('✅ Content saved successfully');
    return newContent;
  }

  async updateContent(id: string, updates: any): Promise<DynamicContent | null> {
    const existingContent = this.cache.get(id);
    if (!existingContent) {
      return null;
    }

    const updatedContent = {
      ...existingContent,
      ...updates,
      updatedAt: new Date()
    } as DynamicContent;

    this.cache.set(id, updatedContent);
    await this.saveContentToLocalStorage(updatedContent);
    
    // إشعار المستخدمين بالتحديث
    this.notifyContentUpdate('updated', updatedContent);
    
    return updatedContent;
  }

  async deleteContent(id: string): Promise<boolean> {
    const contentToDelete = this.cache.get(id);
    const success = this.cache.delete(id);
    if (success) {
      // إعادة حفظ الكاش بدون العنصر المحذوف
      const allContent = Array.from(this.cache.values());
      localStorage.setItem('dynamic_content', JSON.stringify(allContent));
      
      // إشعار المستخدمين بالحذف
      if (contentToDelete) {
        this.notifyContentUpdate('deleted', contentToDelete);
      }
    }
    return success;
  }

  async toggleContentStatus(id: string): Promise<DynamicContent | null> {
    const content = this.cache.get(id);
    if (!content) {
      return null;
    }

    const updatedContent = {
      ...content,
      isPublished: !content.isPublished,
      updatedAt: new Date()
    };

    this.cache.set(id, updatedContent);
    await this.saveContentToLocalStorage(updatedContent);
    
    // إشعار المستخدمين بتغيير الحالة
    this.notifyContentUpdate(updatedContent.isPublished ? 'published' : 'unpublished', updatedContent);
    
    return updatedContent;
  }

  // ========== تحميل البيانات الافتراضية ==========

  private async loadDefaultContent(): Promise<void> {
    try {
      // تحميل البيانات من ملفات البيانات الموجودة
      const { articlesData } = await import('@/data/articlesData');
      const { freeVideos } = await import('@/data/videosData');
      const { osmanTipsData } = await import('@/data/osmanTipsData');

      // تحويل المقالات للشكل الجديد
      const dynamicArticles: DynamicArticle[] = Object.values(articlesData).map((article, index) => ({
        id: `article-${article.id}`,
        type: 'article' as const,
        title: article.title,
        category: article.category,
        summary: article.summary,
        content: article.sections?.map(s => s.content).join('\n') || '',
        readTime: article.readTime,
        emoji: article.emoji,
        sections: article.sections?.map((section, idx) => ({
          id: `section-${idx}`,
          title: section.title || '',
          content: section.content,
          type: 'paragraph' as const,
          order: idx
        })) || [],
        sources: article.sources || [],
        relatedArticles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true,
        accessLevel: 'free' as const,
        authorId: 'system',
        views: 0,
        tags: article.tags || [article.category],
        language: 'ar' as const,
        priority: index
      }));

      // تحويل الفيديوهات للشكل الجديد
      const dynamicVideos: DynamicVideo[] = freeVideos.map((video, index) => ({
        id: `video-${video.id}`,
        type: 'video' as const,
        title: video.title,
        category: video.category,
        description: video.title, // استخدام العنوان كوصف مؤقت
        duration: video.duration,
        thumbnail: video.thumbnail,
        videoUrl: video.localPath || video.remoteUrl || '',
        relatedVideos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true,
        accessLevel: video.accessLevel as 'free' | 'premium',
        authorId: 'system',
        views: parseInt(video.views?.replace(/[^0-9]/g, '') || '0'),
        tags: [video.category],
        language: 'ar' as const,
        priority: index
      }));

      // تحويل النصائح للشكل الجديد
      const dynamicTips: DynamicTip[] = osmanTipsData.map((tip, index) => ({
        id: `tip-${tip.id}`,
        type: 'tip' as const,
        title: tip.title,
        category: tip.category,
        week: tip.week,
        tipCategory: 'general' as const,
        content: tip.content,
        personalNote: tip.personalNote,
        isPersonalExperience: tip.isPersonalExperience,
        audioUrl: tip.audioUrl,
        imageUrl: tip.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true,
        accessLevel: 'free' as const,
        authorId: 'system',
        views: 0,
        tags: [tip.category],
        language: 'ar' as const,
        priority: index
      }));

      // حفظ في الكاش
      [...dynamicArticles, ...dynamicVideos, ...dynamicTips].forEach(content => {
        this.cache.set(content.id, content);
      });

      // حفظ في التخزين المحلي
      const allContent = Array.from(this.cache.values());
      localStorage.setItem('dynamic_content', JSON.stringify(allContent));

    } catch (error) {
      console.error('Error loading default content:', error);
    }
  }

  // ========== تتبع الإحصائيات ==========

  async trackContentView(contentId: string): Promise<void> {
    try {
      // زيادة عدد المشاهدات في الكاش
      const content = this.cache.get(contentId);
      if (content) {
        content.views += 1;
        this.cache.set(contentId, content);
        await this.saveContentToLocalStorage(content);
      }

      // حفظ في التخزين المحلي للمزامنة لاحقاً
      const viewData = {
        contentId,
        timestamp: new Date(),
        userId: 'anonymous' // سيتم تحديثه عند ربط المصادقة
      };
      
      const pendingViews = JSON.parse(localStorage.getItem('pending_views') || '[]');
      pendingViews.push(viewData);
      localStorage.setItem('pending_views', JSON.stringify(pendingViews));

    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }

  // ========== إحصائيات المحتوى ==========

  getContentStats(): any {
    return {
      totalContent: this.cache.size,
      publishedContent: Array.from(this.cache.values()).filter(c => c.isPublished).length,
      totalViews: Array.from(this.cache.values()).reduce((sum, c) => sum + c.views, 0),
      categories: Array.from(this.categories.values()).length
    };
  }

  // ========== نظام الإشعارات للمستخدمين ==========
  private contentUpdateCallbacks: Array<(action: string, content: DynamicContent) => void> = [];

  onContentUpdate(callback: (action: string, content: DynamicContent) => void) {
    this.contentUpdateCallbacks.push(callback);
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      const index = this.contentUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.contentUpdateCallbacks.splice(index, 1);
      }
    };
  }

  private notifyContentUpdate(action: string, content: DynamicContent) {
    console.log(`📢 Notifying ${this.contentUpdateCallbacks.length} subscribers about ${action}:`, content.title);
    this.contentUpdateCallbacks.forEach(callback => {
      try {
        callback(action, content);
      } catch (error) {
        console.error('Error in content update callback:', error);
      }
    });
  }

  // ========== إعادة تحميل محسنة ==========
  
  async refreshContent(): Promise<void> {
    try {
      this.syncStatus.isSyncing = true;
      console.log('🔄 Refreshing content from cache and defaults...');
      
      // إعادة تحميل البيانات الافتراضية
      await this.loadDefaultContent();
      
      // تحديث التخزين المحلي
      const allContent = Array.from(this.cache.values());
      localStorage.setItem('dynamic_content', JSON.stringify(allContent));
      
      this.syncStatus.lastSuccessfulSync = new Date();
      this.syncStatus.isSyncing = false;
      
      console.log(`✅ Content refreshed: ${allContent.length} items loaded`);
    } catch (error) {
      console.error('❌ Error refreshing content:', error);
      this.syncStatus.isSyncing = false;
      throw error;
    }
  }

  // ========== إدارة محسنة للبيانات ==========
  
  async validateContent(content: Partial<DynamicContent>): Promise<boolean> {
    if (!content.title || content.title.trim().length < 3) {
      throw new Error('العنوان مطلوب ويجب أن يكون 3 أحرف على الأقل');
    }
    
    if (!content.category || content.category.trim().length === 0) {
      throw new Error('الفئة مطلوبة');
    }
    
    if (content.type === 'article' && (!content.summary || content.summary.length < 10)) {
      throw new Error('الملخص مطلوب للمقالات ويجب أن يكون 10 أحرف على الأقل');
    }
    
    return true;
  }

  async importBulkContent(contentList: Partial<DynamicContent>[]): Promise<DynamicContent[]> {
    const importedContent: DynamicContent[] = [];
    
    for (const contentData of contentList) {
      try {
        await this.validateContent(contentData);
        const newContent = await this.saveContent(contentData);
        importedContent.push(newContent);
      } catch (error) {
        console.error(`Failed to import content: ${contentData.title}`, error);
      }
    }
    
    return importedContent;
  }

  async exportAllContent(): Promise<DynamicContent[]> {
    return Array.from(this.cache.values());
  }

  // ========== إحصائيات محسنة ==========
  
  getDetailedStats() {
    const content = Array.from(this.cache.values());
    const categories = Array.from(this.categories.values());
    
    const statsByType = content.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const statsByCategory = content.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalViews = content.reduce((sum, item) => sum + item.views, 0);
    const publishedCount = content.filter(item => item.isPublished).length;
    
    return {
      total: content.length,
      published: publishedCount,
      draft: content.length - publishedCount,
      totalViews,
      averageViews: content.length > 0 ? Math.round(totalViews / content.length) : 0,
      byType: statsByType,
      byCategory: statsByCategory,
      categories: categories.length,
      lastUpdate: new Date().toISOString(),
      cacheSize: this.cache.size,
      isHealthy: content.length > 0 && categories.length > 0
    };
  }
}

export const contentService = ContentService.getInstance();