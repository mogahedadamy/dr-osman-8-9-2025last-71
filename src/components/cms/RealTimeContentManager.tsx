// مدير المحتوى الفوري مع مزامنة ريال تايم
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { contentService } from '@/services/contentService';
import { DynamicContent, ContentCategory } from '@/types/cms';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Globe, 
  Wifi,
  Users,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export function RealTimeContentManager() {
  const [content, setContent] = useState<DynamicContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<DynamicContent | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // ========== تحميل البيانات الأولية ==========

  useEffect(() => {
    loadInitialData();
    
    // الاشتراك في التحديثات الفورية
    const unsubscribe = contentService.onContentUpdate((action, content) => {
      console.log('📡 Content updated in real-time', action, content);
      setLastUpdate(new Date());
      loadContent();
      
      toast({
        title: "تحديث فوري",
        description: "تم تحديث المحتوى تلقائياً",
        duration: 2000
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadContent(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const data = await contentService.getAllContent({
        limit: 100
      });
      setContent(data);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await contentService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // ========== إدارة المحتوى ==========

  const handleCreateContent = async (contentData: Partial<DynamicContent>) => {
    try {
      console.log('🆕 Creating new content:', contentData);
      const newContent = await contentService.saveContent({
        ...contentData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        authorId: 'admin'
      });

      if (newContent) {
        toast({
          title: "تم إنشاء المحتوى",
          description: `تم إنشاء "${newContent.title}" بنجاح وسيظهر فوراً لجميع المستخدمين`,
        });
        setShowAddForm(false);
      }
    } catch (error) {
      toast({
        title: "خطأ في الإنشاء",
        description: "فشل في إنشاء المحتوى",
        variant: "destructive"
      });
    }
  };

  const handleUpdateContent = async (id: string, updates: Partial<DynamicContent>) => {
    try {
      const updated = await contentService.updateContent(id, updates);
      if (updated) {
        toast({
          title: "تم التحديث",
          description: `تم تحديث المحتوى وسيصل فوراً لجميع الأجهزة`,
        });
        setEditingContent(null);
      }
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث المحتوى",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;

    try {
      const success = await contentService.deleteContent(id);
      if (success) {
        toast({
          title: "تم الحذف",
          description: "تم حذف المحتوى وسيختفي فوراً من جميع الأجهزة",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "فشل في حذف المحتوى",
        variant: "destructive"
      });
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const updated = await contentService.toggleContentStatus(id);
      if (updated) {
        const status = updated.isPublished ? 'منشور' : 'مخفي';
        toast({
          title: `المحتوى ${status}`,
          description: `التغيير ساري فوراً على جميع الأجهزة`,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في التبديل",
        description: "فشل في تغيير حالة النشر",
        variant: "destructive"
      });
    }
  };

  // ========== إحصائيات فورية ==========

  const totalViews = content.reduce((sum, item) => sum + item.views, 0);
  const publishedCount = content.filter(item => item.isPublished).length;
  const draftCount = content.filter(item => !item.isPublished).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل لوحة التحكم...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* لوحة المعلومات الفورية */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              لوحة التحكم الفورية
            </span>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                متصل
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {connectedUsers} مستخدم نشط
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{content.length}</div>
              <div className="text-sm text-muted-foreground">إجمالي المحتوى</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
              <div className="text-sm text-muted-foreground">منشور</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{draftCount}</div>
              <div className="text-sm text-muted-foreground">مسودة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">إجمالي المشاهدات</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              مزامنة فورية نشطة
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* أزرار الإدارة */}
      <div className="flex gap-2">
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة محتوى جديد
        </Button>
        <Button variant="outline" onClick={loadContent} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {/* قائمة المحتوى */}
      <div className="grid gap-4">
        {content.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            categories={categories}
            onEdit={setEditingContent}
            onDelete={handleDeleteContent}
            onTogglePublish={handleTogglePublish}
            isEditing={editingContent?.id === item.id}
            onSave={handleUpdateContent}
            onCancel={() => setEditingContent(null)}
          />
        ))}
      </div>

      {/* نموذج إضافة محتوى جديد */}
      {showAddForm && (
        <AddContentModal
          categories={categories}
          onSave={handleCreateContent}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

// مكون بطاقة المحتوى
interface ContentCardProps {
  content: DynamicContent;
  categories: ContentCategory[];
  onEdit: (content: DynamicContent) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
  isEditing: boolean;
  onSave: (id: string, updates: Partial<DynamicContent>) => void;
  onCancel: () => void;
}

function ContentCard({ 
  content, 
  categories, 
  onEdit, 
  onDelete, 
  onTogglePublish,
  isEditing,
  onSave,
  onCancel
}: ContentCardProps) {
  const [editForm, setEditForm] = useState({
    title: content.title,
    category: content.category,
    isPublished: content.isPublished,
    accessLevel: content.accessLevel,
    priority: content.priority
  });

  if (isEditing) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-lg">تحرير المحتوى</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={editForm.title}
            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="عنوان المحتوى"
          />
          
          <Select
            value={editForm.category}
            onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">منشور</label>
            <Switch
              checked={editForm.isPublished}
              onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isPublished: checked }))}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => onSave(content.id, editForm)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              حفظ
            </Button>
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all ${content.isPublished ? 'border-green-200' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{content.title}</h3>
              <Badge variant={content.isPublished ? 'default' : 'secondary'}>
                {content.isPublished ? 'منشور' : 'مسودة'}
              </Badge>
              <Badge variant="outline">{content.type}</Badge>
              {content.accessLevel === 'premium' && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  بريميوم
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center gap-4">
              <span>الفئة: {content.category}</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {content.views.toLocaleString()} مشاهدة
              </span>
              <span>آخر تحديث: {new Date(content.updatedAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTogglePublish(content.id)}
              className="gap-1"
            >
              {content.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(content)}
              className="gap-1"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(content.id)}
              className="gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// مكون نموذج إضافة محتوى
interface AddContentModalProps {
  categories: ContentCategory[];
  onSave: (content: Partial<DynamicContent>) => void;
  onCancel: () => void;
}

function AddContentModal({ categories, onSave, onCancel }: AddContentModalProps) {
  const [form, setForm] = useState({
    type: 'article' as 'article' | 'video' | 'tip' | 'encyclopedia',
    title: '',
    category: '',
    content: '',
    summary: '',
    duration: '',
    emoji: '',
    readTime: '',
    thumbnail: '',
    week: 1,
    definition: '',
    urgencyLevel: 'low' as const,
    letter: 'أ',
    isPublished: false,
    accessLevel: 'free' as const,
    priority: 0,
    tags: [] as string[]
  });

  // فئات ثابتة متطابقة مع البيانات الحالية
  const staticCategories: Record<string, string[]> = {
    article: ['صحة', 'تغذية', 'تمارين', 'نفسية', 'استعداد'],
    video: ['أساسيات', 'تمارين', 'تغذية', 'صحة', 'ولادة'],
    tip: ['nutrition', 'exercise', 'psychological', 'medical', 'general'],
    encyclopedia: ['حالات طبية', 'فحوصات طبية', 'أعراض طارئة', 'أعراض طبيعية', 'أعراض شائعة', 'نمو الجنين', 'تغذية', 'مضاعفات', 'إجراءات طبية', 'ما بعد الولادة']
  };

  const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category) return;

    let contentData: any = {
      type: form.type,
      title: form.title,
      category: form.category,
      isPublished: form.isPublished,
      accessLevel: form.accessLevel,
      priority: form.priority,
      tags: form.tags.length > 0 ? form.tags : [form.category]
    };

    // إضافة البيانات الخاصة بكل نوع
    if (form.type === 'article') {
        contentData = {
          ...contentData,
          summary: form.summary || 'ملخص المقال',
          content: form.content,
          readTime: form.readTime || '5 دقائق',
          emoji: form.emoji || '📖',
          sections: form.content ? [{
            id: 'section-1',
            title: 'المحتوى الرئيسي',
            content: form.content,
            type: 'paragraph' as const,
            order: 1
          }] : [],
          sources: ['مصدر طبي موثق'],
          relatedArticles: []
        };
    } else if (form.type === 'video') {
        contentData = {
          ...contentData,
          duration: form.duration || '5:00',
          thumbnail: form.emoji || '🎥',
          description: form.content,
          videoUrl: '',
          relatedVideos: []
        };
    } else if (form.type === 'tip') {
        contentData = {
          ...contentData,
          week: form.week,
          tipCategory: form.category,
          content: form.content,
          personalNote: form.summary || '',
          isPersonalExperience: true
        };
    } else if (form.type === 'encyclopedia') {
        contentData = {
          ...contentData,
          definition: form.content,
          urgencyLevel: form.urgencyLevel,
          symptoms: form.summary ? form.summary.split('،').map(s => s.trim()) : [],
          whenToSeek: 'استشيري الطبيب عند الحاجة',
          letter: form.letter,
          relatedEntries: []
        };
    }

    onSave(contentData);
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>إضافة محتوى جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            value={form.type}
            onValueChange={(value: any) => setForm(prev => ({ ...prev, type: value, category: '' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="نوع المحتوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">📖 مقال</SelectItem>
              <SelectItem value="video">🎥 فيديو</SelectItem>
              <SelectItem value="tip">💡 نصيحة</SelectItem>
              <SelectItem value="encyclopedia">📚 موسوعة</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={form.category}
            onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {staticCategories[form.type]?.map((cat, index) => (
                <SelectItem key={index} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="عنوان المحتوى"
            required
          />

          {/* حقول خاصة بكل نوع */}
          {form.type === 'article' && (
            <>
              <Input
                value={form.summary}
                onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="ملخص المقال"
              />
              <Input
                value={form.readTime}
                onChange={(e) => setForm(prev => ({ ...prev, readTime: e.target.value }))}
                placeholder="وقت القراءة (مثل: 5 دقائق)"
              />
              <Input
                value={form.emoji}
                onChange={(e) => setForm(prev => ({ ...prev, emoji: e.target.value }))}
                placeholder="رمز تعبيري للمقال"
              />
            </>
          )}

          {form.type === 'video' && (
            <>
              <Input
                value={form.duration}
                onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="مدة الفيديو (مثل: 3:45)"
              />
              <Input
                value={form.thumbnail}
                onChange={(e) => setForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="صورة مصغرة أو رمز تعبيري"
              />
            </>
          )}

          {form.type === 'tip' && (
            <>
              <Input
                type="number"
                value={form.week}
                onChange={(e) => setForm(prev => ({ ...prev, week: parseInt(e.target.value) || 1 }))}
                placeholder="أسبوع الحمل"
                min="1"
                max="42"
              />
              <Input
                value={form.summary}
                onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="ملاحظة شخصية من الطبيب"
              />
            </>
          )}

          {form.type === 'encyclopedia' && (
            <>
              <Select
                value={form.urgencyLevel}
                onValueChange={(value: any) => setForm(prev => ({ ...prev, urgencyLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="مستوى الإلحاح" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={form.letter}
                onValueChange={(value) => setForm(prev => ({ ...prev, letter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="الحرف الأبجدي" />
                </SelectTrigger>
                <SelectContent>
                  {arabicLetters.map(letter => (
                    <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={form.summary}
                onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="الأعراض (مفصولة بفواصل)"
              />
            </>
          )}

          <Textarea
            value={form.content}
            onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder={
              form.type === 'article' ? 'محتوى المقال التفصيلي' :
              form.type === 'video' ? 'وصف الفيديو' :
              form.type === 'tip' ? 'نص النصيحة' :
              'التعريف الطبي'
            }
            rows={4}
          />

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">نشر فوراً</label>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPublished: checked }))}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              حفظ ونشر
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}