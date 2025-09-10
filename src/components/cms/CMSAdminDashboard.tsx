// لوحة تحكم إدارة المحتوى المتقدمة
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DynamicContent, ContentCategory } from '@/types/cms';
import { advancedContentService } from '@/services/advancedContentService';
import { AdvancedContentEditor } from './AdvancedContentEditor';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Globe, 
  Lock,
  TrendingUp,
  Users,
  FileText,
  Video,
  Lightbulb,
  BookOpen,
  BarChart3,
  Calendar,
  Star,
  MessageSquare,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface CMSAdminDashboardProps {
  className?: string;
}

export function CMSAdminDashboard({ className }: CMSAdminDashboardProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<DynamicContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<DynamicContent | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all',
    accessLevel: 'all'
  });

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contentData, categoriesData] = await Promise.all([
        advancedContentService.getAllContent(),
        advancedContentService.getCategories()
      ]);
      
      setContent(contentData);
      setCategories(categoriesData);
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

  // تطبيق الفلاتر
  const filteredContent = content.filter(item => {
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && item.type !== filters.type) {
      return false;
    }
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }
    if (filters.status !== 'all') {
      if (filters.status === 'published' && !item.isPublished) return false;
      if (filters.status === 'draft' && item.isPublished) return false;
    }
    if (filters.accessLevel !== 'all' && item.accessLevel !== filters.accessLevel) {
      return false;
    }
    return true;
  });

  // إحصائيات سريعة
  const stats = {
    total: content.length,
    published: content.filter(c => c.isPublished).length,
    draft: content.filter(c => !c.isPublished).length,
    free: content.filter(c => c.accessLevel === 'free').length,
    premium: content.filter(c => c.accessLevel === 'premium').length,
    totalViews: content.reduce((sum, c) => sum + c.views, 0),
    articles: content.filter(c => c.type === 'article').length,
    videos: content.filter(c => c.type === 'video').length,
    tips: content.filter(c => c.type === 'tip').length,
    encyclopedia: content.filter(c => c.type === 'encyclopedia').length
  };

  // إنشاء محتوى جديد
  const handleCreateNew = (type?: string) => {
    setEditingId(null);
    setShowEditor(true);
  };

  // تعديل محتوى
  const handleEdit = (contentId: string) => {
    setEditingId(contentId);
    setShowEditor(true);
  };

  // حذف محتوى
  const handleDelete = async (contentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;

    try {
      await advancedContentService.deleteContent(contentId);
      toast({
        title: "تم الحذف",
        description: "تم حذف المحتوى بنجاح"
      });
      loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المحتوى",
        variant: "destructive"
      });
    }
  };

  // نشر/إلغاء نشر محتوى
  const togglePublish = async (contentId: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await advancedContentService.unpublishContent(contentId);
        toast({
          title: "تم إلغاء النشر",
          description: "تم إلغاء نشر المحتوى"
        });
      } else {
        await advancedContentService.publishContent(contentId);
        toast({
          title: "تم النشر",
          description: "تم نشر المحتوى بنجاح"
        });
      }
      loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تغيير حالة النشر",
        variant: "destructive"
      });
    }
  };

  // حفظ المحتوى من المحرر
  const handleSaveContent = () => {
    setShowEditor(false);
    setEditingId(null);
    loadData();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      case 'encyclopedia': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'tip': return 'bg-yellow-100 text-yellow-800';
      case 'encyclopedia': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showEditor) {
    return (
      <AdvancedContentEditor
        contentId={editingId}
        onSave={handleSaveContent}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام إدارة المحتوى</h1>
          <p className="text-muted-foreground">
            إدارة شاملة للمحتوى مع إمكانيات متقدمة
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء محتوى
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleCreateNew('article')}>
                <FileText className="h-4 w-4 mr-2" />
                مقال جديد
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateNew('video')}>
                <Video className="h-4 w-4 mr-2" />
                فيديو جديد
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateNew('tip')}>
                <Lightbulb className="h-4 w-4 mr-2" />
                نصيحة جديدة
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateNew('encyclopedia')}>
                <BookOpen className="h-4 w-4 mr-2" />
                مدخل موسوعة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المحتوى</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published} منشور، {stats.draft} مسودة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              عبر جميع المحتوى
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحتوى المجاني</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.free}</div>
            <p className="text-xs text-muted-foreground">
              متاح للجميع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحتوى المدفوع</CardTitle>
            <Lock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premium}</div>
            <p className="text-xs text-muted-foreground">
              للمشتركين فقط
            </p>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المحتوى..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.type} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="article">المقالات</SelectItem>
                  <SelectItem value="video">الفيديوهات</SelectItem>
                  <SelectItem value="tip">النصائح</SelectItem>
                  <SelectItem value="encyclopedia">الموسوعة</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.accessLevel} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, accessLevel: value }))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="الوصول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="premium">مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول المحتوى */}
      <Card>
        <CardHeader>
          <CardTitle>المحتوى ({filteredContent.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا يوجد محتوى</h3>
              <p className="text-muted-foreground mb-4">ابدأ بإنشاء محتوى جديد</p>
              <Button onClick={() => handleCreateNew()}>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء محتوى
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <Badge className={getTypeColor(item.type)}>
                        {item.type === 'article' && 'مقال'}
                        {item.type === 'video' && 'فيديو'}
                        {item.type === 'tip' && 'نصيحة'}
                        {item.type === 'encyclopedia' && 'موسوعة'}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.views} مشاهدة</span>
                        <span>•</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString('ar')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={item.isPublished ? "default" : "secondary"}>
                        {item.isPublished ? "منشور" : "مسودة"}
                      </Badge>
                      <Badge variant={item.accessLevel === 'free' ? "outline" : "default"}>
                        {item.accessLevel === 'free' ? (
                          <><Globe className="h-3 w-3 mr-1" />مجاني</>
                        ) : (
                          <><Lock className="h-3 w-3 mr-1" />مدفوع</>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(item.id, item.isPublished)}>
                        {item.isPublished ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            إلغاء النشر
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            نشر
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}