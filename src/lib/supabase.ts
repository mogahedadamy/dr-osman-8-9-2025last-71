import { createClient, SupabaseClient } from '@supabase/supabase-js';

// إعدادات Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// إنشاء عميل Supabase
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// أنواع قاعدة البيانات
export interface Database {
  public: {
    Tables: {
      dynamic_content: {
        Row: {
          id: string;
          type: 'article' | 'video' | 'tip' | 'encyclopedia';
          title: string;
          category: string;
          content: any; // JSON
          is_published: boolean;
          access_level: 'free' | 'premium';
          author_id: string;
          views: number;
          tags: string[];
          language: string;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'article' | 'video' | 'tip' | 'encyclopedia';
          title: string;
          category: string;
          content: any;
          is_published?: boolean;
          access_level?: 'free' | 'premium';
          author_id: string;
          views?: number;
          tags?: string[];
          language?: string;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'article' | 'video' | 'tip' | 'encyclopedia';
          title?: string;
          category?: string;
          content?: any;
          is_published?: boolean;
          access_level?: 'free' | 'premium';
          author_id?: string;
          views?: number;
          tags?: string[];
          language?: string;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_categories: {
        Row: {
          id: string;
          name: string;
          name_en: string;
          description: string;
          color: string;
          icon: string;
          order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en: string;
          description?: string;
          color?: string;
          icon?: string;
          order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string;
          description?: string;
          color?: string;
          icon?: string;
          order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_analytics: {
        Row: {
          id: string;
          content_id: string;
          user_id: string | null;
          event_type: 'view' | 'share' | 'favorite';
          timestamp: string;
          metadata: any;
        };
        Insert: {
          id?: string;
          content_id: string;
          user_id?: string | null;
          event_type: 'view' | 'share' | 'favorite';
          timestamp?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          content_id?: string;
          user_id?: string | null;
          event_type?: 'view' | 'share' | 'favorite';
          timestamp?: string;
          metadata?: any;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper لإنشاء جداول قاعدة البيانات
export const createDatabaseTables = async () => {
  console.log('Database tables should be created via Supabase Dashboard');
  console.log('SQL commands:');
  console.log(`
-- جدول المحتوى الديناميكي
CREATE TABLE dynamic_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('article', 'video', 'tip', 'encyclopedia')),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content JSONB NOT NULL,
    is_published BOOLEAN DEFAULT false,
    access_level TEXT DEFAULT 'free' CHECK (access_level IN ('free', 'premium')),
    author_id TEXT DEFAULT 'system',
    views INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'ar',
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول فئات المحتوى
CREATE TABLE content_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT '📖',
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إحصائيات المحتوى
CREATE TABLE content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES dynamic_content(id) ON DELETE CASCADE,
    user_id TEXT,
    event_type TEXT CHECK (event_type IN ('view', 'share', 'favorite')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- إنشاء الفهارس للأداء
CREATE INDEX idx_dynamic_content_type ON dynamic_content(type);
CREATE INDEX idx_dynamic_content_category ON dynamic_content(category);
CREATE INDEX idx_dynamic_content_published ON dynamic_content(is_published);
CREATE INDEX idx_dynamic_content_updated ON dynamic_content(updated_at);
CREATE INDEX idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_timestamp ON content_analytics(timestamp);

-- تحديث timestamp تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dynamic_content_updated_at BEFORE UPDATE ON dynamic_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج فئات افتراضية
INSERT INTO content_categories (name, name_en, description, color, icon, "order") VALUES
('صحة', 'Health', 'نصائح ومعلومات صحية', '#ef4444', '🏥', 1),
('تغذية', 'Nutrition', 'نصائح التغذية الصحية', '#22c55e', '🥗', 2),
('تمارين', 'Exercise', 'تمارين آمنة للحوامل', '#3b82f6', '🤸‍♀️', 3),
('نفسية', 'Psychology', 'الصحة النفسية والعاطفية', '#8b5cf6', '🧠', 4),
('تطوير الطفل', 'Child Development', 'تطوير ونمو الطفل', '#f59e0b', '👶', 5);
  `);
};

export default supabase;