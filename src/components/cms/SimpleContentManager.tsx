// مدير المحتوى البسيط المدمج في لوحة التحكم
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  BookOpen,
  Video,
  Lightbulb,
  FileText,
  TrendingUp
} from 'lucide-react';

interface Content {
  id: string;
  type: 'article' | 'video' | 'tip' | 'encyclopedia';
  title: string;
  category: string;
  content: string;
  isPublished: boolean;
  accessLevel: 'free' | 'premium';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const categories = [
  { id: 'health', name: 'صحة', icon: '🏥' },
  { id: 'nutrition', name: 'تغذية', icon: '🥗' },
  { id: 'exercise', name: 'تمارين', icon: '🤸‍♀️' },
  { id: 'psychology', name: 'نفسية', icon: '🧠' },
  { id: 'child-development', name: 'تطوير الطفل', icon: '👶' }
];

export function SimpleContentManager() {
  const [content, setContent] = useState<Content[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // تحميل المحتوى من localStorage
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    try {
      const stored = localStorage.getItem('admin_content');
      if (stored) {
        const parsed = JSON.parse(stored);
        setContent(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })));
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const saveContent = (newContent: Content[]) => {
    try {
      localStorage.setItem('admin_content', JSON.stringify(newContent));
      setContent(newContent);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleCreateContent = (contentData: Partial<Content>) => {
    const newContent: Content = {
      id: `content_${Date.now()}`,
      type: contentData.type || 'article',
      title: contentData.title || '',
      category: contentData.category || 'health',
      content: contentData.content || '',
      isPublished: contentData.isPublished || false,
      accessLevel: contentData.accessLevel || 'free',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedContent = [...content, newContent];
    saveContent(updatedContent);
    setShowAddForm(false);
    
    toast({
      title: "تم إنشاء المحتوى",
      description: `تم إنشاء "${newContent.title}" بنجاح وسيظهر للمستخدمين فوراً`,
    });
  };

  const handleDeleteContent = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    
    const updatedContent = content.filter(item => item.id !== id);
    saveContent(updatedContent);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف المحتوى وسيختفي من التطبيق فوراً",
    });
  };

  const handleTogglePublish = (id: string) => {
    const updatedContent = content.map(item => 
      item.id === id 
        ? { ...item, isPublished: !item.isPublished, updatedAt: new Date() }
        : item
    );
    
    saveContent(updatedContent);
    const item = updatedContent.find(c => c.id === id);
    
    toast({
      title: item?.isPublished ? "تم النشر" : "تم الإخفاء",
      description: `المحتوى ${item?.isPublished ? 'مرئي' : 'مخفي'} الآن لجميع المستخدمين`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'video': return <Video className="h-4 w-4 text-red-600" />;
      case 'tip': return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'encyclopedia': return <BookOpen className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'article': return 'مقال';
      case 'video': return 'فيديو';
      case 'tip': return 'نصيحة';
      case 'encyclopedia': return 'موسوعة';
      default: return 'محتوى';
    }
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {content.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                إجمالي المحتوى
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {content.filter(c => c.isPublished).length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                منشور
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {content.filter(c => !c.isPublished).length}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                مسودة
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {content.reduce((sum, c) => sum + c.views, 0)}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                مشاهدات
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* زر إضافة محتوى */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة محتوى جديد
        </Button>
      </div>

      {/* نموذج إضافة محتوى */}
      {showAddForm && (
        <AddContentForm
          onSave={handleCreateContent}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* قائمة المحتوى */}
      <div className="space-y-4">
        {content.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">لا يوجد محتوى متاح</p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة أول محتوى
              </Button>
            </CardContent>
          </Card>
        ) : (
          content.map((item) => {
            const categoryInfo = categories.find(c => c.id === item.category);
            return (
              <Card 
                key={item.id} 
                className={`transition-all ${item.isPublished ? 'border-green-200 bg-green-50/30 dark:bg-green-950/30' : 'border-gray-200'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(item.type)}
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                          {item.isPublished ? 'منشور' : 'مسودة'}
                        </Badge>
                        <Badge variant="outline">{getTypeName(item.type)}</Badge>
                        <Badge variant="outline">{categoryInfo?.icon} {categoryInfo?.name}</Badge>
                        {item.accessLevel === 'premium' && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            بريميوم
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {item.views} مشاهدة
                        </span>
                        <span>آخر تحديث: {item.updatedAt.toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePublish(item.id)}
                        className="gap-1"
                      >
                        {item.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteContent(item.id)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// نموذج إضافة محتوى
interface AddContentFormProps {
  onSave: (content: Partial<Content>) => void;
  onCancel: () => void;
}

function AddContentForm({ onSave, onCancel }: AddContentFormProps) {
  const [form, setForm] = useState({
    type: 'article' as const,
    title: '',
    category: 'health',
    content: '',
    isPublished: false,
    accessLevel: 'free' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    onSave(form);
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>إضافة محتوى جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع المحتوى</Label>
              <Select
                value={form.type}
                onValueChange={(value: any) => setForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="نوع المحتوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">📄 مقال</SelectItem>
                  <SelectItem value="video">🎥 فيديو</SelectItem>
                  <SelectItem value="tip">💡 نصيحة</SelectItem>
                  <SelectItem value="encyclopedia">📚 موسوعة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
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
            </div>
          </div>

          <div className="space-y-2">
            <Label>عنوان المحتوى *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="أدخل عنوان المحتوى"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>المحتوى *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="أدخل محتوى المقال أو الوصف"
              rows={4}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">نشر فوراً</Label>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPublished: checked }))}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              حفظ المحتوى
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