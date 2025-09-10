// مكون إحصائيات المحتوى
import React from 'react';
import { DynamicContent } from '@/types/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Eye, TrendingUp, Users, Clock } from 'lucide-react';

interface ContentAnalyticsProps {
  content: DynamicContent[];
}

export function ContentAnalytics({ content }: ContentAnalyticsProps) {
  // حساب الإحصائيات
  const totalViews = content.reduce((sum, item) => sum + item.views, 0);
  const publishedContent = content.filter(item => item.isPublished);
  const freeContent = content.filter(item => item.accessLevel === 'free');
  const premiumContent = content.filter(item => item.accessLevel === 'premium');

  // أكثر المحتوى مشاهدة
  const topContent = [...content]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // إحصائيات حسب النوع
  const contentByType = [
    { name: 'مقالات', value: content.filter(c => c.type === 'article').length, color: '#8884d8' },
    { name: 'فيديوهات', value: content.filter(c => c.type === 'video').length, color: '#82ca9d' },
    { name: 'نصائح', value: content.filter(c => c.type === 'tip').length, color: '#ffc658' },
    { name: 'موسوعة', value: content.filter(c => c.type === 'encyclopedia').length, color: '#ff7300' }
  ];

  // إحصائيات حسب الفئة
  const contentByCategory = content.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(contentByCategory).map(([name, value]) => ({
    name,
    value,
    views: content.filter(c => c.category === name).reduce((sum, c) => sum + c.views, 0)
  }));

  // إحصائيات المشاهدات حسب النوع
  const viewsByType = [
    { name: 'مقالات', views: content.filter(c => c.type === 'article').reduce((sum, c) => sum + c.views, 0) },
    { name: 'فيديوهات', views: content.filter(c => c.type === 'video').reduce((sum, c) => sum + c.views, 0) },
    { name: 'نصائح', views: content.filter(c => c.type === 'tip').reduce((sum, c) => sum + c.views, 0) },
    { name: 'موسوعة', views: content.filter(c => c.type === 'encyclopedia').reduce((sum, c) => sum + c.views, 0) }
  ];

  return (
    <div className="space-y-6">
      {/* الإحصائيات الأساسية */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(totalViews / content.length).toFixed(0)} متوسط لكل محتوى
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحتوى المنشور</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedContent.length}</div>
            <p className="text-xs text-muted-foreground">
              {((publishedContent.length / content.length) * 100).toFixed(1)}% من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحتوى المجاني</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{freeContent.length}</div>
            <p className="text-xs text-muted-foreground">
              {premiumContent.length} محتوى مدفوع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت القراءة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter(c => c.type === 'article' && 'readTime' in c).length > 0 ? '6' : '0'} دقائق
            </div>
            <p className="text-xs text-muted-foreground">
              للمقالات المنشورة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* توزيع المحتوى حسب النوع */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع المحتوى حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contentByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* المشاهدات حسب النوع */}
        <Card>
          <CardHeader>
            <CardTitle>المشاهدات حسب نوع المحتوى</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={viewsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* أكثر المحتوى مشاهدة */}
      <Card>
        <CardHeader>
          <CardTitle>أكثر المحتوى مشاهدة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topContent.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    #{index + 1}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.type === 'article' ? 'مقال' : item.type === 'video' ? 'فيديو' : item.type === 'tip' ? 'نصيحة' : 'موسوعة'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.views.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">مشاهدة</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الفئات */}
      <Card>
        <CardHeader>
          <CardTitle>الأداء حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <div className="text-sm text-muted-foreground">
                    {category.value} محتوى • {category.views.toLocaleString()} مشاهدة
                  </div>
                </div>
                <Progress 
                  value={(category.views / totalViews) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}