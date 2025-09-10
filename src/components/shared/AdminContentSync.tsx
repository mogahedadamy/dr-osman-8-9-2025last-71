// مكون مزامنة محتوى المدير مع المستخدمين
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDynamicContent } from '@/hooks/useDynamicContent';
import { contentService } from '@/services/contentService';
import { toast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Eye, 
  TrendingUp,
  Database,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

export function AdminContentSync() {
  const {
    content,
    loading,
    syncStatus,
    syncContent,
    loadContent
  } = useDynamicContent({
    autoSync: true,
    syncInterval: 5 // كل 5 دقائق للمدير
  });

  const [lastUserSync, setLastUserSync] = useState<Date | null>(null);
  const [userSyncProgress, setUserSyncProgress] = useState(0);
  const [isSyncingToUsers, setIsSyncingToUsers] = useState(false);

  // مزامنة المحتوى للمستخدمين
  const syncToUsers = async () => {
    try {
      setIsSyncingToUsers(true);
      setUserSyncProgress(0);

      // محاكاة عملية المزامنة
      const publishedContent = content.filter(item => item.isPublished);
      
      for (let i = 0; i < publishedContent.length; i++) {
        // محاكاة عملية نشر للمستخدمين
        await new Promise(resolve => setTimeout(resolve, 100));
        setUserSyncProgress(((i + 1) / publishedContent.length) * 100);
      }

      setLastUserSync(new Date());
      
      toast({
        title: "تم المزامنة بنجاح",
        description: `تم مزامنة ${publishedContent.length} عنصر مع المستخدمين`
      });

    } catch (error) {
      toast({
        title: "خطأ في المزامنة",
        description: "فشل في مزامنة المحتوى مع المستخدمين",
        variant: "destructive"
      });
    } finally {
      setIsSyncingToUsers(false);
    }
  };

  // إحصائيات سريعة
  const stats = contentService.getContentStats();

  return (
    <div className="space-y-6">
      {/* حالة الاتصال والمزامنة */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة الاتصال</CardTitle>
            {syncStatus.isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus.isOnline ? 'متصل' : 'غير متصل'}
            </div>
            <p className="text-xs text-muted-foreground">
              {syncStatus.isOnline ? 'جاهز للمزامنة' : 'سيتم المزامنة عند الاتصال'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر مزامنة</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus.lastSuccessfulSync ? 
                new Date(syncStatus.lastSuccessfulSync).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'لم تتم'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {syncStatus.lastSuccessfulSync ? 
                new Date(syncStatus.lastSuccessfulSync).toLocaleDateString('ar-EG') : 
                'لم يتم إجراء مزامنة بعد'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محتوى منشور</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              من أصل {stats.total} عنصر
            </p>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات تفصيلية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            إحصائيات المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.articles}</div>
              <p className="text-sm text-muted-foreground">مقالات</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.videos}</div>
              <p className="text-sm text-muted-foreground">فيديوهات</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.tips}</div>
              <p className="text-sm text-muted-foreground">نصائح</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
              <p className="text-sm text-muted-foreground">مشاهدات إجمالية</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* عمليات المزامنة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            مزامنة المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* مزامنة من الخادم */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">مزامنة من الخادم</h4>
              <p className="text-sm text-muted-foreground">
                جلب آخر التحديثات من قاعدة البيانات
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => syncContent(true)}
              disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              {syncStatus.isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
            </Button>
          </div>

          {syncStatus.isSyncing && (
            <div className="space-y-2">
              <Progress value={syncStatus.syncProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(syncStatus.syncProgress)}% مكتمل
              </p>
            </div>
          )}

          {/* مزامنة للمستخدمين */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">نشر للمستخدمين</h4>
                <p className="text-sm text-muted-foreground">
                  نشر المحتوى المنشور لجميع المستخدمين
                </p>
              </div>
              <Button
                onClick={syncToUsers}
                disabled={isSyncingToUsers || stats.published === 0}
              >
                <Users className={`h-4 w-4 mr-2 ${isSyncingToUsers ? 'animate-pulse' : ''}`} />
                {isSyncingToUsers ? 'جاري النشر...' : 'نشر للمستخدمين'}
              </Button>
            </div>

            {isSyncingToUsers && (
              <div className="space-y-2 mt-3">
                <Progress value={userSyncProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {Math.round(userSyncProgress)}% مكتمل
                </p>
              </div>
            )}

            {lastUserSync && (
              <div className="mt-3">
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <CheckCircle className="h-3 w-3" />
                  آخر نشر: {lastUserSync.toLocaleString('ar-EG')}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* رسائل الحالة والأخطاء */}
      {syncStatus.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            حدثت أخطاء أثناء المزامنة:
            <ul className="mt-2 list-disc list-inside">
              {syncStatus.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!syncStatus.isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            لا يوجد اتصال بالإنترنت. سيتم إجراء المزامنة تلقائياً عند استعادة الاتصال.
          </AlertDescription>
        </Alert>
      )}

      {syncStatus.pendingChanges > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            يوجد {syncStatus.pendingChanges} تغيير في انتظار المزامنة.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}