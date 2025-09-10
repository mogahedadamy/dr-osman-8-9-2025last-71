// مكون قائمة المحتوى المحدث
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DynamicContent } from '@/types/cms';
import { contentService } from '@/services/contentService';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Eye, EyeOff, MoreHorizontal, Calendar, Users, Globe, Lock } from 'lucide-react';

interface ContentListProps {
  content: DynamicContent[];
  loading: boolean;
  error: string | null;
  onEdit: (contentId: string) => void;
  onRefresh: () => void;
}

export function ContentList({ content, loading, error, onEdit, onRefresh }: ContentListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (contentId: string) => {
    try {
      setDeletingId(contentId);
      await contentService.deleteContent(contentId);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المحتوى نهائياً"
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "فشل في حذف المحتوى",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (contentId: string) => {
    try {
      await contentService.toggleContentStatus(contentId);
      toast({
        title: "تم التحديث",
        description: "تم تغيير حالة النشر بنجاح"
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تغيير حالة النشر",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline">
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">لا يوجد محتوى</h3>
          <p className="text-muted-foreground">ابدأ بإنشاء محتوى جديد للمستخدمين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {content.map((item) => (
        <Card key={item.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <Badge variant="outline">
                    {item.type === 'article' ? '📄 مقال' : 
                     item.type === 'video' ? '🎥 فيديو' : 
                     item.type === 'tip' ? '💡 نصيحة' : '📚 موسوعة'}
                  </Badge>
                  <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                    {item.isPublished ? 'منشور' : 'مسودة'}
                  </Badge>
                  <Badge variant="outline">
                    {item.accessLevel === 'premium' ? (
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        مدفوع
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        مجاني
                      </span>
                    )}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm mb-3">
                  الفئة: {item.category} • الأولوية: {item.priority}
                </p>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(item.updatedAt).toLocaleDateString('ar-EG')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {item.views || 0} مشاهدة
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onEdit(item.id)}
                  title="تعديل"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleToggleStatus(item.id)}
                  title={item.isPublished ? "إخفاء" : "نشر"}
                >
                  {item.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف "{item.title}"? 
                        لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        حذف نهائياً
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}