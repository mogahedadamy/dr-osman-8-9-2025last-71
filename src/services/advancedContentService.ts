// خدمة إدارة المحتوى المتقدمة
import { DynamicContent, ContentCategory, ContentUpdate, SyncStatus, ContentAnalytics, ContentRating } from '@/types/cms';

class AdvancedContentService {
  private localStorageKey = 'advanced_content_data';
  private categoriesKey = 'content_categories';
  private analyticsKey = 'content_analytics';
  private authorsKey = 'content_authors';
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncAttempt: new Date(),
    lastSuccessfulSync: new Date(),
    pendingChanges: 0,
    syncProgress: 0,
    errors: []
  };

  // =============== إدارة المحتوى ===============

  async getAllContent(filters?: {
    type?: string;
    category?: string;
    accessLevel?: 'free' | 'premium';
    published?: boolean;
    authorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<DynamicContent[]> {
    try {
      const data = this.getStoredContent();
      let filteredContent = data;

      if (filters) {
        if (filters.type) {
          filteredContent = filteredContent.filter(item => item.type === filters.type);
        }
        if (filters.category) {
          filteredContent = filteredContent.filter(item => item.category === filters.category);
        }
        if (filters.accessLevel) {
          filteredContent = filteredContent.filter(item => item.accessLevel === filters.accessLevel);
        }
        if (filters.published !== undefined) {
          filteredContent = filteredContent.filter(item => item.isPublished === filters.published);
        }
        if (filters.authorId) {
          filteredContent = filteredContent.filter(item => item.authorId === filters.authorId);
        }
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredContent = filteredContent.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            ('content' in item && item.content.toLowerCase().includes(searchTerm)) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }
        if (filters.limit) {
          const start = filters.offset || 0;
          filteredContent = filteredContent.slice(start, start + filters.limit);
        }
      }

      return filteredContent.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting content:', error);
      return [];
    }
  }

  async getContentById(id: string): Promise<DynamicContent | null> {
    try {
      const data = this.getStoredContent();
      const content = data.find(item => item.id === id);
      
      if (content) {
        // تتبع المشاهدة
        await this.trackView(id);
      }
      
      return content || null;
    } catch (error) {
      console.error('Error getting content by ID:', error);
      return null;
    }
  }

  async createContent(content: any): Promise<DynamicContent> {
    try {
      const baseContent = {
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        ...content
      };

      // إنشاء المحتوى بناءً على النوع
      const newContent = this.createTypedContent(baseContent);

      const data = this.getStoredContent();
      data.push(newContent);
      this.saveContent(data);

      // تسجيل التحديث
      await this.logContentUpdate({
        id: this.generateId(),
        contentId: newContent.id,
        updateType: 'created',
        changes: newContent,
        authorId: newContent.authorId,
        timestamp: new Date(),
        version: 1
      });

      this.updateSyncStatus({ pendingChanges: this.syncStatus.pendingChanges + 1 });
      return newContent;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  async updateContent(id: string, updates: any): Promise<DynamicContent | null> {
    try {
      const data = this.getStoredContent();
      const index = data.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error('Content not found');
      }

      const oldContent = { ...data[index] };
      const updatedContent = {
        ...data[index],
        ...updates,
        updatedAt: new Date()
      };

      data[index] = this.createTypedContent(updatedContent);
      this.saveContent(data);

      // تسجيل التحديث
      await this.logContentUpdate({
        id: this.generateId(),
        contentId: id,
        updateType: 'updated',
        changes: this.getChanges(oldContent, updatedContent),
        authorId: updatedContent.authorId,
        timestamp: new Date(),
        version: (oldContent as any).version ? (oldContent as any).version + 1 : 2
      });

      this.updateSyncStatus({ pendingChanges: this.syncStatus.pendingChanges + 1 });
      return updatedContent;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  async deleteContent(id: string): Promise<boolean> {
    try {
      const data = this.getStoredContent();
      const index = data.findIndex(item => item.id === id);
      
      if (index === -1) {
        return false;
      }

      const deletedContent = data[index];
      data.splice(index, 1);
      this.saveContent(data);

      // تسجيل التحديث
      await this.logContentUpdate({
        id: this.generateId(),
        contentId: id,
        updateType: 'deleted',
        changes: { deleted: true },
        authorId: deletedContent.authorId,
        timestamp: new Date(),
        version: 0
      });

      this.updateSyncStatus({ pendingChanges: this.syncStatus.pendingChanges + 1 });
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }

  async publishContent(id: string): Promise<boolean> {
    try {
      return await this.updateContentStatus(id, true, 'published');
    } catch (error) {
      console.error('Error publishing content:', error);
      return false;
    }
  }

  async unpublishContent(id: string): Promise<boolean> {
    try {
      return await this.updateContentStatus(id, false, 'unpublished');
    } catch (error) {
      console.error('Error unpublishing content:', error);
      return false;
    }
  }

  // =============== إدارة الفئات ===============

  async getCategories(): Promise<ContentCategory[]> {
    try {
      const stored = localStorage.getItem(this.categoriesKey);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // فئات افتراضية
      const defaultCategories: ContentCategory[] = [
        {
          id: '1',
          name: 'الحمل الصحي',
          nameEn: 'Healthy Pregnancy',
          description: 'نصائح وإرشادات للحمل الصحي',
          color: '#10B981',
          icon: '🤰',
          order: 1,
          isActive: true
        },
        {
          id: '2',
          name: 'التغذية',
          nameEn: 'Nutrition',
          description: 'التغذية السليمة أثناء الحمل',
          color: '#F59E0B',
          icon: '🥗',
          order: 2,
          isActive: true
        },
        {
          id: '3',
          name: 'التمارين',
          nameEn: 'Exercise',
          description: 'تمارين آمنة للحامل',
          color: '#EF4444',
          icon: '🤸‍♀️',
          order: 3,
          isActive: true
        },
        {
          id: '4',
          name: 'الصحة النفسية',
          nameEn: 'Mental Health',
          description: 'الدعم النفسي والعاطفي',
          color: '#8B5CF6',
          icon: '🧠',
          order: 4,
          isActive: true
        },
        {
          id: '5',
          name: 'الولادة',
          nameEn: 'Birth',
          description: 'الاستعداد للولادة والمخاض',
          color: '#06B6D4',
          icon: '👶',
          order: 5,
          isActive: true
        }
      ];

      localStorage.setItem(this.categoriesKey, JSON.stringify(defaultCategories));
      return defaultCategories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // =============== إدارة التحليلات ===============

  async trackView(contentId: string): Promise<void> {
    try {
      // تحديث عدد المشاهدات في المحتوى
      const data = this.getStoredContent();
      const contentIndex = data.findIndex(item => item.id === contentId);
      
      if (contentIndex !== -1) {
        data[contentIndex].views += 1;
        this.saveContent(data);
      }

      // تسجيل في التحليلات
      const analytics = this.getAnalytics();
      const existingAnalytics = analytics.find(a => a.contentId === contentId);

      if (existingAnalytics) {
        existingAnalytics.totalViews += 1;
        existingAnalytics.lastViewed = new Date();
      } else {
        analytics.push({
          contentId,
          totalViews: 1,
          uniqueViews: 1,
          shareCount: 0,
          averageTimeSpent: 0,
          bounceRate: 0,
          lastViewed: new Date()
        });
      }

      localStorage.setItem(this.analyticsKey, JSON.stringify(analytics));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  async getContentAnalytics(contentId?: string): Promise<ContentAnalytics[]> {
    try {
      const analytics = this.getAnalytics();
      return contentId ? analytics.filter(a => a.contentId === contentId) : analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return [];
    }
  }

  // =============== إدارة المزامنة ===============

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async syncWithServer(force: boolean = false): Promise<void> {
    try {
      this.updateSyncStatus({ 
        isSyncing: true, 
        lastSyncAttempt: new Date(),
        syncProgress: 0 
      });

      // محاكاة المزامنة مع السيرفر
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.updateSyncStatus({
        isSyncing: false,
        lastSuccessfulSync: new Date(),
        pendingChanges: 0,
        syncProgress: 100,
        errors: []
      });

      console.log('Content synced successfully');
    } catch (error) {
      this.updateSyncStatus({
        isSyncing: false,
        errors: [...this.syncStatus.errors, error instanceof Error ? error.message : 'Sync failed']
      });
      throw error;
    }
  }

  // =============== وظائف مساعدة ===============

  private getStoredContent(): DynamicContent[] {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : this.getDefaultContent();
    } catch (error) {
      console.error('Error parsing stored content:', error);
      return this.getDefaultContent();
    }
  }

  private saveContent(content: DynamicContent[]): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(content));
    } catch (error) {
      console.error('Error saving content:', error);
    }
  }

  private getAnalytics(): ContentAnalytics[] {
    try {
      const stored = localStorage.getItem(this.analyticsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing analytics:', error);
      return [];
    }
  }

  private async updateContentStatus(id: string, isPublished: boolean, updateType: 'published' | 'unpublished'): Promise<boolean> {
    const data = this.getStoredContent();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }

    const oldContent = { ...data[index] };
    data[index].isPublished = isPublished;
    data[index].publishedAt = isPublished ? new Date() : undefined;
    data[index].updatedAt = new Date();

    this.saveContent(data);

    // تسجيل التحديث
    await this.logContentUpdate({
      id: this.generateId(),
      contentId: id,
      updateType,
      changes: { isPublished, publishedAt: data[index].publishedAt },
      authorId: data[index].authorId,
      timestamp: new Date(),
      version: (oldContent as any).version ? (oldContent as any).version + 1 : 2
    });

    this.updateSyncStatus({ pendingChanges: this.syncStatus.pendingChanges + 1 });
    return true;
  }

  private async logContentUpdate(update: ContentUpdate): Promise<void> {
    try {
      const updates = JSON.parse(localStorage.getItem('content_updates') || '[]');
      updates.push(update);
      
      // الاحتفاظ بآخر 1000 تحديث فقط
      if (updates.length > 1000) {
        updates.splice(0, updates.length - 1000);
      }
      
      localStorage.setItem('content_updates', JSON.stringify(updates));
    } catch (error) {
      console.error('Error logging content update:', error);
    }
  }

  private getChanges(oldContent: any, newContent: any): Record<string, any> {
    const changes: Record<string, any> = {};
    
    Object.keys(newContent).forEach(key => {
      if (oldContent[key] !== newContent[key]) {
        changes[key] = {
          old: oldContent[key],
          new: newContent[key]
        };
      }
    });
    
    return changes;
  }

  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private createTypedContent(baseContent: any): DynamicContent {
    // إنشاء محتوى مُطابق للنوع المحدد
    const { type } = baseContent;
    
    switch (type) {
      case 'article':
        return {
          ...baseContent,
          type: 'article',
          summary: baseContent.summary || '',
          content: baseContent.content || '',
          readTime: baseContent.readTime || '5 دقائق',
          emoji: baseContent.emoji || '📖',
          sections: baseContent.sections || [],
          sources: baseContent.sources || [],
          relatedArticles: baseContent.relatedArticles || [],
          seoTitle: baseContent.seoTitle,
          seoDescription: baseContent.seoDescription,
          featuredImage: baseContent.featuredImage,
        } as DynamicContent;
        
      case 'video':
        return {
          ...baseContent,
          type: 'video',
          duration: baseContent.duration || '0:00',
          thumbnail: baseContent.thumbnail || '',
          description: baseContent.description || '',
          videoUrl: baseContent.videoUrl || '',
          localPath: baseContent.localPath,
          cdnUrl: baseContent.cdnUrl,
          subtitles: baseContent.subtitles,
          transcript: baseContent.transcript,
          relatedVideos: baseContent.relatedVideos || [],
          downloadSize: baseContent.downloadSize,
        } as DynamicContent;
        
      case 'tip':
        return {
          ...baseContent,
          type: 'tip',
          week: baseContent.week,
          tipCategory: baseContent.tipCategory || 'general',
          content: baseContent.content || '',
          personalNote: baseContent.personalNote,
          isPersonalExperience: baseContent.isPersonalExperience || false,
          audioUrl: baseContent.audioUrl,
          imageUrl: baseContent.imageUrl,
        } as DynamicContent;
        
      case 'encyclopedia':
        return {
          ...baseContent,
          type: 'encyclopedia',
          definition: baseContent.definition || baseContent.content || '',
          urgencyLevel: baseContent.urgencyLevel || 'low',
          symptoms: baseContent.symptoms || [],
          whenToSeek: baseContent.whenToSeek || '',
          letter: baseContent.letter || 'أ',
          relatedEntries: baseContent.relatedEntries || [],
        } as DynamicContent;
        
      default:
        // افتراضي كمقال
        return {
          ...baseContent,
          type: 'article',
          summary: baseContent.summary || '',
          content: baseContent.content || '',
          readTime: baseContent.readTime || '5 دقائق',
          emoji: baseContent.emoji || '📖',
          sections: baseContent.sections || [],
          sources: baseContent.sources || [],
          relatedArticles: baseContent.relatedArticles || [],
        } as DynamicContent;
    }
  }

  private getDefaultContent(): DynamicContent[] {
    // محتوى تجريبي للاختبار
    return [];
  }
}

export const advancedContentService = new AdvancedContentService();