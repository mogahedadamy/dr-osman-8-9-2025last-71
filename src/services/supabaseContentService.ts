import { supabase, Database } from '@/lib/supabase';
import { DynamicContent, ContentCategory, SyncStatus } from '@/types/cms';

type ContentRow = Database['public']['Tables']['dynamic_content']['Row'];
type ContentInsert = Database['public']['Tables']['dynamic_content']['Insert'];
type ContentUpdate = Database['public']['Tables']['dynamic_content']['Update'];

type CategoryRow = Database['public']['Tables']['content_categories']['Row'];

/**
 * خدمة إدارة المحتوى مع Supabase
 * تتيح المزامنة التلقائية والفورية للمحتوى عبر جميع الأجهزة
 */
export class SupabaseContentService {
  private static instance: SupabaseContentService;
  private cache: Map<string, DynamicContent> = new Map();
  private categories: Map<string, ContentCategory> = new Map();
  private syncCallbacks: Array<() => void> = [];
  private realtimeSubscription: any = null;

  public static getInstance(): SupabaseContentService {
    if (!SupabaseContentService.instance) {
      SupabaseContentService.instance = new SupabaseContentService();
    }
    return SupabaseContentService.instance;
  }

  constructor() {
    this.initializeRealtimeSync();
  }

  // ========== المزامنة الفورية والريال تايم ==========

  /**
   * تهيئة نظام المزامنة الفورية
   * يستمع للتغييرات في قاعدة البيانات ويحدث المحتوى فوراً
   */
  private initializeRealtimeSync() {
    if (this.realtimeSubscription) {
      return;
    }

    // الاستماع للتغييرات الفورية في المحتوى
    this.realtimeSubscription = supabase
      .channel('dynamic_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // جميع الأحداث (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'dynamic_content'
        },
        (payload) => {
          console.log('🔄 Real-time content update received:', payload);
          this.handleRealtimeUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_categories'
        },
        (payload) => {
          console.log('🔄 Real-time category update received:', payload);
          this.handleRealtimeCategoryUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });
  }

  /**
   * معالجة التحديثات الفورية للمحتوى
   */
  private handleRealtimeUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        if (newRecord) {
          const content = this.transformRowToContent(newRecord);
          this.cache.set(content.id, content);
          this.saveToLocalStorage();
          this.notifySubscribers();
        }
        break;
      
      case 'DELETE':
        if (oldRecord) {
          this.cache.delete(oldRecord.id);
          this.saveToLocalStorage();
          this.notifySubscribers();
        }
        break;
    }
  }

  /**
   * معالجة التحديثات الفورية للفئات
   */
  private handleRealtimeCategoryUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        if (newRecord) {
          const category = this.transformRowToCategory(newRecord);
          this.categories.set(category.id, category);
          this.notifySubscribers();
        }
        break;
      
      case 'DELETE':
        if (oldRecord) {
          this.categories.delete(oldRecord.id);
          this.notifySubscribers();
        }
        break;
    }
  }

  /**
   * إشعار جميع المشتركين بالتحديثات
   */
  private notifySubscribers() {
    this.syncCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  /**
   * الاشتراك في تحديثات المحتوى
   */
  onContentUpdate(callback: () => void) {
    this.syncCallbacks.push(callback);
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  // ========== جلب المحتوى ==========

  /**
   * جلب جميع المحتوى مع المرشحات
   */
  async getAllContent(options?: {
    type?: string;
    category?: string;
    accessLevel?: 'free' | 'premium';
    published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<DynamicContent[]> {
    try {
      let query = supabase
        .from('dynamic_content')
        .select('*');

      // تطبيق المرشحات
      if (options?.type) {
        query = query.eq('type', options.type);
      }
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.accessLevel) {
        query = query.eq('access_level', options.accessLevel);
      }
      if (options?.published !== undefined) {
        query = query.eq('is_published', options.published);
      }

      // ترتيب وتحديد النتائج
      query = query
        .order('priority', { ascending: false })
        .order('updated_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching content:', error);
        return this.getFromCache(options);
      }

      // تحديث الكاش
      const content = data.map(row => this.transformRowToContent(row));
      content.forEach(item => this.cache.set(item.id, item));
      this.saveToLocalStorage();

      return content;
    } catch (error) {
      console.error('Error in getAllContent:', error);
      return this.getFromCache(options);
    }
  }

  /**
   * جلب محتوى واحد بالمعرف
   */
  async getContentById(id: string): Promise<DynamicContent | null> {
    try {
      // البحث في الكاش أولاً
      if (this.cache.has(id)) {
        return this.cache.get(id)!;
      }

      const { data, error } = await supabase
        .from('dynamic_content')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching content by ID:', error);
        return null;
      }

      const content = this.transformRowToContent(data);
      this.cache.set(id, content);
      this.saveToLocalStorage();

      return content;
    } catch (error) {
      console.error('Error in getContentById:', error);
      return this.cache.get(id) || null;
    }
  }

  /**
   * البحث في المحتوى
   */
  async searchContent(query: string, type?: string): Promise<DynamicContent[]> {
    try {
      let supabaseQuery = supabase
        .from('dynamic_content')
        .select('*')
        .or(`title.ilike.%${query}%,content->>title.ilike.%${query}%`)
        .eq('is_published', true);

      if (type) {
        supabaseQuery = supabaseQuery.eq('type', type);
      }

      const { data, error } = await supabaseQuery
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching content:', error);
        return [];
      }

      return data.map(row => this.transformRowToContent(row));
    } catch (error) {
      console.error('Error in searchContent:', error);
      return [];
    }
  }

  // ========== إدارة الفئات ==========

  /**
   * جلب جميع الفئات
   */
  async getCategories(): Promise<ContentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return Array.from(this.categories.values());
      }

      const categories = data.map(row => this.transformRowToCategory(row));
      categories.forEach(cat => this.categories.set(cat.id, cat));

      return categories;
    } catch (error) {
      console.error('Error in getCategories:', error);
      return Array.from(this.categories.values());
    }
  }

  // ========== إدارة المحتوى (للمدير) ==========

  /**
   * حفظ محتوى جديد
   */
  async saveContent(content: Partial<DynamicContent>): Promise<DynamicContent | null> {
    try {
      const contentData: ContentInsert = {
        type: content.type!,
        title: content.title!,
        category: content.category!,
        content: JSON.stringify(content),
        is_published: content.isPublished || false,
        access_level: content.accessLevel || 'free',
        author_id: content.authorId || 'system',
        views: content.views || 0,
        tags: content.tags || [],
        language: content.language || 'ar',
        priority: content.priority || 0
      };

      const { data, error } = await supabase
        .from('dynamic_content')
        .insert(contentData)
        .select()
        .single();

      if (error) {
        console.error('Error saving content:', error);
        throw error;
      }

      const savedContent = this.transformRowToContent(data);
      this.cache.set(savedContent.id, savedContent);
      this.saveToLocalStorage();

      return savedContent;
    } catch (error) {
      console.error('Error in saveContent:', error);
      return null;
    }
  }

  /**
   * تحديث المحتوى
   */
  async updateContent(id: string, updates: Partial<DynamicContent>): Promise<DynamicContent | null> {
    try {
      const updateData: ContentUpdate = {
        ...(updates.type && { type: updates.type }),
        ...(updates.title && { title: updates.title }),
        ...(updates.category && { category: updates.category }),
        ...(updates && { content: JSON.stringify(updates) }),
        ...(updates.isPublished !== undefined && { is_published: updates.isPublished }),
        ...(updates.accessLevel && { access_level: updates.accessLevel }),
        ...(updates.tags && { tags: updates.tags }),
        ...(updates.priority !== undefined && { priority: updates.priority })
      };

      const { data, error } = await supabase
        .from('dynamic_content')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating content:', error);
        return null;
      }

      const updatedContent = this.transformRowToContent(data);
      this.cache.set(id, updatedContent);
      this.saveToLocalStorage();

      return updatedContent;
    } catch (error) {
      console.error('Error in updateContent:', error);
      return null;
    }
  }

  /**
   * حذف المحتوى
   */
  async deleteContent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dynamic_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting content:', error);
        return false;
      }

      this.cache.delete(id);
      this.saveToLocalStorage();

      return true;
    } catch (error) {
      console.error('Error in deleteContent:', error);
      return false;
    }
  }

  /**
   * تبديل حالة النشر
   */
  async toggleContentStatus(id: string): Promise<DynamicContent | null> {
    try {
      const current = await this.getContentById(id);
      if (!current) return null;

      return await this.updateContent(id, {
        isPublished: !current.isPublished
      });
    } catch (error) {
      console.error('Error in toggleContentStatus:', error);
      return null;
    }
  }

  // ========== تتبع الإحصائيات ==========

  /**
   * تسجيل مشاهدة المحتوى
   */
  async trackContentView(contentId: string, userId?: string): Promise<void> {
    try {
      // تحديث عداد المشاهدات
      await supabase.rpc('increment_content_views', { content_id: contentId });

      // تسجيل الحدث في الإحصائيات
      await supabase
        .from('content_analytics')
        .insert({
          content_id: contentId,
          user_id: userId || null,
          event_type: 'view',
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        });

      // تحديث الكاش المحلي
      const content = this.cache.get(contentId);
      if (content) {
        content.views += 1;
        this.cache.set(contentId, content);
        this.saveToLocalStorage();
      }
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }

  // ========== تحويل البيانات ==========

  private transformRowToContent(row: ContentRow): DynamicContent {
    return {
      id: row.id,
      type: row.type as any,
      title: row.title,
      category: row.category,
      isPublished: row.is_published,
      accessLevel: row.access_level as 'free' | 'premium',
      authorId: row.author_id,
      views: row.views,
      tags: row.tags,
      language: row.language as 'ar' | 'en',
      priority: row.priority,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      // إضافة خصائص المحتوى المحددة
      ...row.content
    } as DynamicContent;
  }

  private transformRowToCategory(row: CategoryRow): ContentCategory {
    return {
      id: row.id,
      name: row.name,
      nameEn: row.name_en,
      description: row.description,
      color: row.color,
      icon: row.icon,
      order: row.order,
      isActive: row.is_active
    };
  }

  // ========== التخزين المحلي ==========

  private getFromCache(options?: any): DynamicContent[] {
    let content = Array.from(this.cache.values());

    if (options?.type) {
      content = content.filter(item => item.type === options.type);
    }
    if (options?.category) {
      content = content.filter(item => item.category === options.category);
    }
    if (options?.published !== undefined) {
      content = content.filter(item => item.isPublished === options.published);
    }

    return content.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  private saveToLocalStorage() {
    try {
      const contentArray = Array.from(this.cache.values());
      localStorage.setItem('supabase_content_cache', JSON.stringify(contentArray));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async loadFromLocalStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('supabase_content_cache');
      if (stored) {
        const content: DynamicContent[] = JSON.parse(stored);
        content.forEach(item => this.cache.set(item.id, item));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // ========== معلومات النظام ==========

  getCacheSize(): number {
    return this.cache.size;
  }

  getSyncStatus(): SyncStatus {
    return {
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSyncAttempt: new Date(),
      lastSuccessfulSync: new Date(),
      pendingChanges: 0,
      syncProgress: 100,
      errors: []
    };
  }

  /**
   * تنظيف الموارد
   */
  cleanup() {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
    this.syncCallbacks = [];
  }
}

export const supabaseContentService = SupabaseContentService.getInstance();