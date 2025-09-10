// مكون مزامنة المحتوى للمدير
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { contentService } from '@/services/contentService';
import { useDynamicContent } from '@/hooks/useDynamicContent';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Users, Database, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export function AdminContentSync() {
  const { toast } = useToast();
  const { syncStatus, syncContent } = useDynamicContent();
  const [lastUserSync, setLastUserSync] = useState<Date | null>(null);
  const [userSyncProgress, setUserSyncProgress] = useState(0);
  const [isSyncingToUsers, setIsSyncingToUsers] = useState(false);

  // مزامنة المحتوى للمستخدمين
  const syncToUsers = async () => {
    try {
      setIsSyncingToUsers(true);
      setUserSyncProgress(0);

      // جلب المحتوى المنشور
      const publishedContent = await contentService.getAllContent({ published: true });
      
      // محاكاة عملية المزامنة
      for (let i = 0; i < publishedContent.length; i++) {
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
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {syncStatus.isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {syncStatus.isOnline ? 'متصل' : 'غير متصل'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {syncStatus.isOnline ? 'جاهز للمزامنة' : 'سيتم المزامنة عند الاتصال'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">
                  {syncStatus.lastSuccessfulSync ? 
                    new Date(syncStatus.lastSuccessfulSync).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'لم تتم'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {syncStatus.lastSuccessfulSync ? 
                    new Date(syncStatus.lastSuccessfulSync).toLocaleDateString('ar-EG') : 
                    'لم يتم إجراء مزامنة بعد'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xl font-bold">{stats.published}</p>
                <p className="text-xs text-muted-foreground">
                  من أصل {stats.total} عنصر
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات تفصيلية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            إحصائيات المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.articles}</div>
              <div className="text-sm text-muted-foreground">مقالات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.videos}</div>
              <div className="text-sm text-muted-foreground">فيديوهات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.tips}</div>
              <div className="text-sm text-muted-foreground">نصائح</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
              <div className="text-sm text-muted-foreground">مشاهدات إجمالية</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* عمليات المزامنة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            مزامنة المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* مزامنة من الخادم */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">مزامنة من الخادم</h4>
                <p className="text-sm text-muted-foreground">
                  جلب آخر التحديثات من قاعدة البيانات
                </p>
              </div>
              <Button 
                onClick={() => syncContent(true)}
                disabled={syncStatus.isSyncing || !syncStatus.isOnline}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                {syncStatus.isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
              </Button>
            </div>

            {syncStatus.isSyncing && (
              <div className="space-y-2">
                <Progress value={syncStatus.syncProgress} />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(syncStatus.syncProgress)}% مكتمل
                </p>
              </div>
            )}
          </div>

          {/* مزامنة للمستخدمين */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  نشر للمستخدمين
                </h4>
                <p className="text-sm text-muted-foreground">
                  نشر المحتوى المنشور لجميع المستخدمين
                </p>
              </div>
              <Button 
                onClick={syncToUsers}
                disabled={isSyncingToUsers}
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                {isSyncingToUsers ? 'جاري النشر...' : 'نشر للمستخدمين'}
              </Button>
            </div>

            {isSyncingToUsers && (
              <div className="space-y-2">
                <Progress value={userSyncProgress} />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(userSyncProgress)}% مكتمل
                </p>
              </div>
            )}

            {lastUserSync && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                آخر نشر: {lastUserSync.toLocaleString('ar-EG')}
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
            <ul className="list-disc list-inside mt-2">
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
          <Database className="h-4 w-4" />
          <AlertDescription>
            يوجد {syncStatus.pendingChanges} تغيير في انتظار المزامنة.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}