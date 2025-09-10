# 🚀 تعليمات إعداد قاعدة البيانات للنظام الفوري

## 📋 المطلوب:

### 1️⃣ إنشاء مشروع Supabase جديد

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ حساب
2. أنشئ مشروع جديد
3. انسخ `Project URL` و `anon key`

### 2️⃣ إعداد متغيرات البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3️⃣ إنشاء قاعدة البيانات

في Supabase Dashboard > SQL Editor، قم بتشغيل هذا الكود:

```sql
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

-- الفهارس للأداء
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

CREATE TRIGGER update_dynamic_content_updated_at 
BEFORE UPDATE ON dynamic_content 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_categories_updated_at 
BEFORE UPDATE ON content_categories 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لزيادة المشاهدات
CREATE OR REPLACE FUNCTION increment_content_views(content_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE dynamic_content 
    SET views = views + 1 
    WHERE id = content_id;
END;
$$ language 'plpgsql';

-- إدراج فئات افتراضية
INSERT INTO content_categories (name, name_en, description, color, icon, "order") VALUES
('صحة', 'Health', 'نصائح ومعلومات صحية', '#ef4444', '🏥', 1),
('تغذية', 'Nutrition', 'نصائح التغذية الصحية', '#22c55e', '🥗', 2),
('تمارين', 'Exercise', 'تمارين آمنة للحوامل', '#3b82f6', '🤸‍♀️', 3),
('نفسية', 'Psychology', 'الصحة النفسية والعاطفية', '#8b5cf6', '🧠', 4),
('تطوير الطفل', 'Child Development', 'تطوير ونمو الطفل', '#f59e0b', '👶', 5);
```

### 4️⃣ إعداد Row Level Security (RLS)

```sql
-- تفعيل RLS
ALTER TABLE dynamic_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة
CREATE POLICY "Everyone can view published content" ON dynamic_content
    FOR SELECT USING (is_published = true);

CREATE POLICY "Everyone can view active categories" ON content_categories
    FOR SELECT USING (is_active = true);

-- سياسات الكتابة للمديرين (يحتاج تخصيص حسب نظام المصادقة)
CREATE POLICY "Admins can manage content" ON dynamic_content
    FOR ALL USING (true); -- سيتم تحديثها عند إضافة المصادقة

CREATE POLICY "Anyone can insert analytics" ON content_analytics
    FOR INSERT WITH CHECK (true);
```

### 5️⃣ تفعيل Realtime

في Supabase Dashboard > Database > Replication:

✅ تفعيل `dynamic_content`
✅ تفعيل `content_categories`

---

## 🎯 كيف يعمل النظام الآن:

### ✨ **للمدير:**
1. يدخل على `/content-management`
2. يضيف/يحرر/يحذف المحتوى
3. **التغيير يظهر فوراً** على جميع الأجهزة المتصلة

### ✨ **للمستخدمين:**
1. يستخدمون التطبيق عادي
2. **عند أي تحديث:** يصلهم إشعار "محتوى جديد متاح"
3. **المحتوى يتحدث فوراً** بدون إعادة فتح التطبيق
4. **يعمل حتى أوفلاين** من البيانات المحفوظة

### 🔄 **المزامنة الفورية:**
- **Real-time WebSockets** عبر Supabase
- **Auto-sync** عند عودة الاتصال
- **Local caching** للعمل أوفلاين
- **Background updates** بدون تدخل المستخدم

---

## 🚀 النتيجة النهائية:

> **"أي تحديث في لوحة التحكم يظهر فوراً على جميع الأجهزة دون الحاجة لتحديث التطبيق من المتجر!"**

**تماماً مثل WhatsApp, Instagram, وجميع التطبيقات الحديثة! 🎉**