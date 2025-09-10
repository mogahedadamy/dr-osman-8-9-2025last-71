// محرر المحتوى المتقدم
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DynamicContent, ContentCategory } from '@/types/cms';
import { advancedContentService } from '@/services/advancedContentService';
import { 
  Save, 
  Eye, 
  X, 
  Plus, 
  Minus, 
  Upload, 
  Calendar,
  Globe,
  Lock,
  Star,
  BookOpen,
  Video,
  Lightbulb,
  FileText,
  Image,
  Tag
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdvancedContentEditorProps {
  contentId?: string | null;
  initialType?: 'article' | 'video' | 'tip' | 'encyclopedia';
  onSave?: (content: DynamicContent) => void;
  onCancel?: () => void;
  onPreview?: (content: DynamicContent) => void;
}

export function AdvancedContentEditor({ 
  contentId, 
  initialType = 'article', 
  onSave, 
  onCancel,
  onPreview 
}: AdvancedContentEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // حالة المحتوى
  const [formData, setFormData] = useState({
    type: initialType,
    title: '',
    category: '',
    content: '',
    tags: [] as string[],
    accessLevel: 'free' as 'free' | 'premium',
    isPublished: false,
    authorId: 'current-user', // سيتم استبداله بالمستخدم الحقيقي
    language: 'ar' as 'ar' | 'en',
    priority: 1,
    
    // خاص بالمقالات
    summary: '',
    readTime: '',
    emoji: '📖',
    sections: [] as any[],
    sources: [] as string[],
    seoTitle: '',
    seoDescription: '',
    featuredImage: '',
    
    // خاص بالفيديوهات
    duration: '',
    thumbnail: '',
    description: '',
    videoUrl: '',
    localPath: '',
    cdnUrl: '',
    subtitles: '',
    transcript: '',
    downloadSize: undefined as number | undefined,
    
    // خاص بالنصائح
    week: undefined as number | undefined,
    tipCategory: 'general' as 'nutrition' | 'exercise' | 'psychological' | 'medical' | 'general',
    personalNote: '',
    isPersonalExperience: false,
    audioUrl: '',
    imageUrl: '',
    
    // خاص بالموسوعة
    definition: '',
    urgencyLevel: 'low' as 'low' | 'medium' | 'high',
    symptoms: [] as string[],
    whenToSeek: '',
    letter: 'أ'
  });

  // تحميل البيانات الأولية
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // تحميل الفئات
        const categoriesData = await advancedContentService.getCategories();
        setCategories(categoriesData);

        // تحميل المحتوى للتعديل
        if (contentId) {
          const content = await advancedContentService.getContentById(contentId);
          if (content) {
            setFormData({
              ...formData,
              ...content,
              // تحويل التواريخ إلى نصوص إذا لزم الأمر
            });
          }
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في تحميل البيانات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contentId]);

  // حفظ المحتوى
  const handleSave = async (publish = false) => {
    if (!formData.title.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال عنوان المحتوى",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const contentData = {
        ...formData,
        isPublished: publish || formData.isPublished,
        publishedAt: publish ? new Date() : undefined
      };

      let savedContent: DynamicContent;

      if (contentId) {
        savedContent = await advancedContentService.updateContent(contentId, contentData) as DynamicContent;
      } else {
        savedContent = await advancedContentService.createContent(contentData);
      }

      toast({
        title: "تم الحفظ",
        description: publish ? "تم نشر المحتوى بنجاح" : "تم حفظ المحتوى بنجاح"
      });

      onSave?.(savedContent);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ المحتوى",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // إضافة تاج جديد
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // حذف تاج
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // معاينة المحتوى
  const handlePreview = () => {
    // تحويل البيانات لنوع المحتوى المطلوب للمعاينة
    const previewData = {
      ...formData,
      id: 'preview-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0
    };
    onPreview?.(previewData as DynamicContent);
  };

  const typeIcons = {
    article: BookOpen,
    video: Video,
    tip: Lightbulb,
    encyclopedia: FileText
  };

  const TypeIcon = typeIcons[formData.type];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* رأس المحرر */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TypeIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>
                  {contentId ? 'تعديل المحتوى' : 'إنشاء محتوى جديد'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formData.type === 'article' && 'مقال تعليمي'}
                  {formData.type === 'video' && 'فيديو تعليمي'}
                  {formData.type === 'tip' && 'نصيحة طبية'}
                  {formData.type === 'encyclopedia' && 'مدخل موسوعة'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!formData.title.trim()}
              >
                <Eye className="h-4 w-4 mr-2" />
                معاينة
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={saving || !formData.title.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ مسودة'}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving || !formData.title.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Globe className="h-4 w-4 mr-2" />
                نشر
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* تبويبات المحرر */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="media">الوسائط</TabsTrigger>
          <TabsTrigger value="seo">SEO والنشر</TabsTrigger>
        </TabsList>

        {/* المعلومات الأساسية */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* نوع المحتوى */}
              <div className="space-y-2">
                <Label htmlFor="type">نوع المحتوى</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        مقال
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        فيديو
                      </div>
                    </SelectItem>
                    <SelectItem value="tip">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        نصيحة
                      </div>
                    </SelectItem>
                    <SelectItem value="encyclopedia">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        موسوعة
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* العنوان */}
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="أدخل عنوان المحتوى"
                  className="text-lg"
                />
              </div>

              {/* الفئة */}
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* الملخص (للمقالات) */}
              {formData.type === 'article' && (
                <div className="space-y-2">
                  <Label htmlFor="summary">الملخص</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="ملخص مختصر للمقال"
                    rows={3}
                  />
                </div>
              )}

              {/* الوصف (للفيديوهات) */}
              {formData.type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف الفيديو"
                    rows={3}
                  />
                </div>
              )}

              {/* التاجات */}
              <div className="space-y-2">
                <Label>التاجات</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="أضف تاج جديد"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* إعدادات الوصول والنشر */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>مستوى الوصول</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.accessLevel === 'free' ? 'مجاني للجميع' : 'مدفوع فقط'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    <Switch
                      checked={formData.accessLevel === 'premium'}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, accessLevel: checked ? 'premium' : 'free' }))
                      }
                    />
                    <Lock className="h-4 w-4 text-amber-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>حالة النشر</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.isPublished ? 'منشور' : 'مسودة'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isPublished: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* المحتوى */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>محتوى {
                formData.type === 'article' ? 'المقال' :
                formData.type === 'video' ? 'الفيديو' :
                formData.type === 'tip' ? 'النصيحة' : 'الموسوعة'
              }</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">المحتوى الأساسي *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={
                    formData.type === 'article' ? 'اكتب محتوى المقال هنا...' :
                    formData.type === 'tip' ? 'اكتب النصيحة هنا...' :
                    formData.type === 'encyclopedia' ? 'اكتب تعريف المصطلح...' :
                    'اكتب وصف الفيديو...'
                  }
                  rows={12}
                  className="min-h-[300px]"
                />
              </div>

              {/* حقول إضافية حسب نوع المحتوى */}
              {formData.type === 'video' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">رابط الفيديو</Label>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">المدة</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="10:30"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'tip' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipCategory">فئة النصيحة</Label>
                    <Select 
                      value={formData.tipCategory} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipCategory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nutrition">التغذية</SelectItem>
                        <SelectItem value="exercise">التمارين</SelectItem>
                        <SelectItem value="psychological">النفسية</SelectItem>
                        <SelectItem value="medical">الطبية</SelectItem>
                        <SelectItem value="general">عامة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="week">الأسبوع (اختياري)</Label>
                    <Input
                      id="week"
                      type="number"
                      min="1"
                      max="42"
                      value={formData.week || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        week: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="رقم الأسبوع"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* الوسائط */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الصور والوسائط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featuredImage">الصورة المميزة</Label>
                <div className="flex gap-2">
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="رابط الصورة أو رفع محلي"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    رفع
                  </Button>
                </div>
              </div>

              {formData.type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">صورة مصغرة للفيديو</Label>
                  <div className="flex gap-2">
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                      placeholder="رابط الصورة المصغرة"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      رفع
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO والنشر */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحسين محركات البحث (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">عنوان SEO</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="عنوان محسّن لمحركات البحث"
                />
                <p className="text-xs text-muted-foreground">
                  الطول المثالي: 50-60 حرف (الحالي: {formData.seoTitle.length})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">وصف SEO</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="وصف مختصر لمحركات البحث"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  الطول المثالي: 150-160 حرف (الحالي: {formData.seoDescription.length})
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priority">أولوية العرض</Label>
                <Select 
                  value={formData.priority.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">عادي</SelectItem>
                    <SelectItem value="2">مهم</SelectItem>
                    <SelectItem value="3">عاجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">اللغة</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}