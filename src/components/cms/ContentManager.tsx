// مكون إدارة المحتوى الرئيسي
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDynamicContent } from '@/hooks/useDynamicContent';
import { ContentEditor } from './ContentEditor';
import { ContentList } from './ContentListUpdated';
import { SyncIndicator } from './SyncIndicator';
import { ContentAnalytics } from './ContentAnalytics';
import { Plus, RefreshCw, Settings, BarChart, RefreshCcw } from 'lucide-react';
import { AdminContentSync } from '@/components/shared/AdminContentSync';

export function ContentManager() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);

  const {
    content,
    categories,
    loading,
    error,
    syncStatus,
    syncContent,
    loadContent
  } = useDynamicContent({
    autoSync: true,
    syncInterval: 30 // كل 30 دقيقة
  });

  const handleCreateNew = () => {
    setEditingContentId(null);
    setIsEditing(true);
  };

  const handleEdit = (contentId: string) => {
    setEditingContentId(contentId);
    setIsEditing(true);
  };

  const handleSaveComplete = () => {
    setIsEditing(false);
    setEditingContentId(null);
    loadContent(); // إعادة تحميل المحتوى
  };

  if (isEditing) {
    return (
      <ContentEditor
        contentId={editingContentId}
        onSave={handleSaveComplete}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المحتوى</h1>
          <p className="text-muted-foreground">
            إدارة المقالات والفيديوهات والنصائح بشكل ديناميكي
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <SyncIndicator syncStatus={syncStatus} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncContent(true)}
            disabled={syncStatus.isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            مزامنة
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            محتوى جديد
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المحتوى</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
            <p className="text-xs text-muted-foreground">
              {content.filter(c => c.isPublished).length} منشور
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقالات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter(c => c.type === 'article').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفيديوهات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter(c => c.type === 'video').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.reduce((total, c) => total + c.views, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تبويبات المحتوى */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="articles">المقالات</TabsTrigger>
          <TabsTrigger value="videos">الفيديوهات</TabsTrigger>
          <TabsTrigger value="tips">النصائح</TabsTrigger>
          <TabsTrigger value="encyclopedia">الموسوعة</TabsTrigger>
          <TabsTrigger value="sync">
            <RefreshCcw className="h-4 w-4 mr-2" />
            المزامنة
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" />
            الإحصائيات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ContentList
            content={content}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={loadContent}
          />
        </TabsContent>

        <TabsContent value="articles">
          <ContentList
            content={content.filter(c => c.type === 'article')}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={loadContent}
          />
        </TabsContent>

        <TabsContent value="videos">
          <ContentList
            content={content.filter(c => c.type === 'video')}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={loadContent}
          />
        </TabsContent>

        <TabsContent value="tips">
          <ContentList
            content={content.filter(c => c.type === 'tip')}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={loadContent}
          />
        </TabsContent>

        <TabsContent value="encyclopedia">
          <ContentList
            content={content.filter(c => c.type === 'encyclopedia')}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={loadContent}
          />
        </TabsContent>

        <TabsContent value="sync">
          <AdminContentSync />
        </TabsContent>

        <TabsContent value="analytics">
          <ContentAnalytics content={content} />
        </TabsContent>
      </Tabs>

      {/* رسائل الخطأ */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={loadContent}
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}