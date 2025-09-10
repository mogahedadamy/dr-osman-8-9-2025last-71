// مكون قائمة المحتوى
import React, { useState } from 'react';
import { DynamicContent } from '@/types/cms';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Edit, 
  Eye, 
  Calendar, 
  Search, 
  Filter,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentListProps {
  content: DynamicContent[];
  loading: boolean;
  error: string | null;
  onEdit: (contentId: string) => void;
  onRefresh: () => void;
}

export function ContentList({ content, loading, error, onEdit, onRefresh }: ContentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // تصفية المحتوى
  const filteredContent = content.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && item.isPublished) ||
      (filterStatus === 'draft' && !item.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'tip': return '💡';
      case 'encyclopedia': return '📚';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'مقال';
      case 'video': return 'فيديو';
      case 'tip': return 'نصيحة';
      case 'encyclopedia': return 'موسوعة';
      default: return 'محتوى';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* أدوات التصفية والبحث */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في المحتوى..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="صحة">صحة</SelectItem>
            <SelectItem value="تغذية">تغذية</SelectItem>
            <SelectItem value="تمارين">تمارين</SelectItem>
            <SelectItem value="نصائح">نصائح</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="published">منشور</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* قائمة المحتوى */}
      <div className="space-y-4">
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">لا يوجد محتوى متاح</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={onRefresh}
              >
                إعادة تحميل
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredContent.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge variant={item.isPublished ? "default" : "secondary"}>
                          {item.isPublished ? 'منشور' : 'مسودة'}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(item.type)}
                        </Badge>
                        {item.accessLevel === 'premium' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            مدفوع
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(item.updatedAt).toLocaleDateString('ar-SA')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {item.views.toLocaleString()} مشاهدة
                        </span>
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          {item.category}
                        </span>
                      </div>

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      تحرير
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          معاينة
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          نسخ
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          رابط مباشر
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="text-center text-sm text-muted-foreground">
        عرض {filteredContent.length} من أصل {content.length} عنصر
      </div>
    </div>
  );
}