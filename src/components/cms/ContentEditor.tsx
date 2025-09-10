// محرر المحتوى الديناميكي
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
import { DynamicContent, DynamicArticle, DynamicVideo, DynamicTip } from '@/types/cms';
import { contentService } from '@/services/contentService';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Eye, Upload, Plus, Trash2, Settings } from 'lucide-react';

interface ContentEditorProps {
  contentId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ContentEditor({ contentId, onSave, onCancel }: ContentEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<Partial<DynamicContent>>({
    title: '',
    category: '',
    type: 'article',
    isPublished: false,
    accessLevel: 'free',
    authorId: 'admin',
    tags: [],
    language: 'ar',
    priority: 1,
    views: 0
  });

  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (contentId) {
      loadContent(contentId);
    }
  }, [contentId]);

  const loadContent = async (id: string) => {
    try {
      setLoading(true);
      const existingContent = await contentService.getContentById(id);
      if (existingContent) {
        setContent(existingContent);
        setTags(existingContent.tags || []);
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل المحتوى",
        description: "فشل في تحميل المحتوى للتعديل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!content.title || !content.category) {
        toast({
          title: "بيانات ناقصة",
          description: "يرجى ملء العنوان والفئة على الأقل",
          variant: "destructive"
        });
        return;
      }

      const contentData = {
        ...content,
        id: contentId || `${content.type}-${Date.now()}`,
        tags: tags,
        updatedAt: new Date()
      } as DynamicContent;

      if (contentId) {
        await contentService.updateContent(contentId, contentData);
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث المحتوى بنجاح"
        });
      } else {
        await contentService.saveContent(contentData);
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم إنشاء المحتوى الجديد بنجاح"
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ المحتوى",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const updateContent = (field: string, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* رأس المحرر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {contentId ? 'تعديل المحتوى' : 'محتوى جديد'}
          </h1>
          <p className="text-muted-foreground">
            {contentId ? 'قم بتعديل المحتوى الموجود' : 'أنشئ محتوى جديد للمستخدمين'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">المحتوى الأساسي</TabsTrigger>
          <TabsTrigger value="meta">الإعدادات</TabsTrigger>
          <TabsTrigger value="preview">معاينة</TabsTrigger>
        </TabsList>

        {/* المحتوى الأساسي */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* العنوان والفئة */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان *</Label>
                  <Input
                    id="title"
                    value={content.title}
                    onChange={(e) => updateContent('title', e.target.value)}
                    placeholder="أدخل عنوان المحتوى"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Select value={content.category} onValueChange={(value) => updateContent('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">صحة</SelectItem>
                      <SelectItem value="nutrition">تغذية</SelectItem>
                      <SelectItem value="exercise">تمارين</SelectItem>
                      <SelectItem value="psychological">نفسية</SelectItem>
                      <SelectItem value="medical">طبية</SelectItem>
                      <SelectItem value="general">عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">نوع المحتوى</Label>
                  <Select value={content.type} onValueChange={(value) => updateContent('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">مقال</SelectItem>
                      <SelectItem value="video">فيديو</SelectItem>
                      <SelectItem value="tip">نصيحة</SelectItem>
                      <SelectItem value="encyclopedia">موسوعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* الوسوم */}
            <Card>
              <CardHeader>
                <CardTitle>الوسوم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="إضافة وسم جديد"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* محتوى مخصص حسب النوع */}
          {content.type === 'article' && (
            <Card>
              <CardHeader>
                <CardTitle>محتوى المقال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="summary">الملخص</Label>
                  <Textarea
                    id="summary"
                    value={(content as DynamicArticle).summary || ''}
                    onChange={(e) => updateContent('summary', e.target.value)}
                    placeholder="ملخص مختصر للمقال"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">المحتوى الكامل</Label>
                  <Textarea
                    id="content"
                    value={(content as DynamicArticle).content || ''}
                    onChange={(e) => updateContent('content', e.target.value)}
                    placeholder="المحتوى الكامل للمقال"
                    rows={10}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="readTime">وقت القراءة</Label>
                    <Input
                      id="readTime"
                      value={(content as DynamicArticle).readTime || ''}
                      onChange={(e) => updateContent('readTime', e.target.value)}
                      placeholder="5 دقائق"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emoji">الرمز التعبيري</Label>
                    <Input
                      id="emoji"
                      value={(content as DynamicArticle).emoji || ''}
                      onChange={(e) => updateContent('emoji', e.target.value)}
                      placeholder="🤰"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {content.type === 'video' && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات الفيديو</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">وصف الفيديو</Label>
                  <Textarea
                    id="description"
                    value={(content as DynamicVideo).description || ''}
                    onChange={(e) => updateContent('description', e.target.value)}
                    placeholder="وصف مفصل للفيديو"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">المدة</Label>
                    <Input
                      id="duration"
                      value={(content as DynamicVideo).duration || ''}
                      onChange={(e) => updateContent('duration', e.target.value)}
                      placeholder="10:30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">رابط الفيديو</Label>
                    <Input
                      id="videoUrl"
                      value={(content as DynamicVideo).videoUrl || ''}
                      onChange={(e) => updateContent('videoUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">رابط الصورة المصغرة</Label>
                  <Input
                    id="thumbnail"
                    value={(content as DynamicVideo).thumbnail || ''}
                    onChange={(e) => updateContent('thumbnail', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {content.type === 'tip' && (
            <Card>
              <CardHeader>
                <CardTitle>محتوى النصيحة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipContent">النصيحة</Label>
                  <Textarea
                    id="tipContent"
                    value={(content as DynamicTip).content || ''}
                    onChange={(e) => updateContent('content', e.target.value)}
                    placeholder="محتوى النصيحة"
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="week">الأسبوع</Label>
                    <Input
                      type="number"
                      id="week"
                      value={(content as DynamicTip).week || ''}
                      onChange={(e) => updateContent('week', parseInt(e.target.value))}
                      placeholder="1-40"
                      min="1"
                      max="40"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipCategory">فئة النصيحة</Label>
                    <Select 
                      value={(content as DynamicTip).tipCategory} 
                      onValueChange={(value) => updateContent('tipCategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nutrition">تغذية</SelectItem>
                        <SelectItem value="exercise">تمارين</SelectItem>
                        <SelectItem value="psychological">نفسية</SelectItem>
                        <SelectItem value="medical">طبية</SelectItem>
                        <SelectItem value="general">عام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalNote">ملاحظة شخصية (اختيارية)</Label>
                  <Textarea
                    id="personalNote"
                    value={(content as DynamicTip).personalNote || ''}
                    onChange={(e) => updateContent('personalNote', e.target.value)}
                    placeholder="ملاحظة من تجربة شخصية"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* الإعدادات */}
        <TabsContent value="meta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">منشور</Label>
                  <p className="text-sm text-muted-foreground">عرض المحتوى للمستخدمين</p>
                </div>
                <Switch
                  id="published"
                  checked={content.isPublished}
                  onCheckedChange={(checked) => updateContent('isPublished', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">مستوى الوصول</Label>
                <Select value={content.accessLevel} onValueChange={(value) => updateContent('accessLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">مجاني</SelectItem>
                    <SelectItem value="premium">مدفوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Input
                  type="number"
                  id="priority"
                  value={content.priority}
                  onChange={(e) => updateContent('priority', parseInt(e.target.value))}
                  placeholder="1"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">
                  الأرقام الأعلى تظهر أولاً (1-100)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* المعاينة */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                معاينة المحتوى
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{content.type}</Badge>
                  <Badge variant={content.accessLevel === 'premium' ? 'default' : 'secondary'}>
                    {content.accessLevel === 'premium' ? 'مدفوع' : 'مجاني'}
                  </Badge>
                  <Badge variant={content.isPublished ? 'default' : 'destructive'}>
                    {content.isPublished ? 'منشور' : 'مسودة'}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-bold">{content.title || 'عنوان المحتوى'}</h3>
                <p className="text-muted-foreground">الفئة: {content.category || 'غير محدد'}</p>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {content.type === 'article' && (content as DynamicArticle).summary && (
                  <p className="text-sm">{(content as DynamicArticle).summary}</p>
                )}

                {content.type === 'video' && (content as DynamicVideo).description && (
                  <p className="text-sm">{(content as DynamicVideo).description}</p>
                )}

                {content.type === 'tip' && (content as DynamicTip).content && (
                  <p className="text-sm">{(content as DynamicTip).content}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}