// مزامنة محسنة للمحتوى مع إدارة الأخطاء
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { contentService } from '@/services/contentService';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff,
  Download,
  Upload
} from 'lucide-react';

interface SyncStats {
  lastSync: Date | null;
  nextSync: Date | null;
  totalContent: number;
  pendingChanges: number;
  errors: string[];
  isOnline: boolean;
  isSyncing: boolean;
}

export function EnhancedContentSync() {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    lastSync: null,
    nextSync: null,
    totalContent: 0,
    pendingChanges: 0,
    errors: [],
    isOnline: navigator.onLine,
    isSyncing: false
  });
  
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();

  // تحديث إحصائيات المزامنة
  const updateSyncStats = useCallback(() => {
    const status = contentService.getSyncStatus();
    const stats = contentService.getDetailedStats();
    
    setSyncStats({
      lastSync: status.lastSuccessfulSync,
      nextSync: null, // سيتم حسابها لاحقاً
      totalContent: stats.total,
      pendingChanges: status.pendingChanges,
      errors: status.errors,
      isOnline: navigator.onLine,
      isSyncing: status.isSyncing
    });
    
    setSyncProgress(status.syncProgress);
  }, []);

  // مزامنة يدوية
  const handleManualSync = async () => {
    try {
      await contentService.refreshContent();
      updateSyncStats();
      
      toast({
        title: "تم تحديث المحتوى",
        description: "تم تحديث جميع البيانات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث المحتوى",
        variant: "destructive"
      });
    }
  };

  // إعادة محاولة في حالة الأخطاء
  const handleRetrySync = async () => {
    try {
      await contentService.syncContent(true); // إجبار المزامنة
      updateSyncStats();
      
      toast({
        title: "تم إصلاح المشاكل",
        description: "تم حل مشاكل المزامنة",
      });
    } catch (error) {
      toast({
        title: "فشل في إعادة المحاولة",
        description: "يرجى المحاولة مرة أخرى لاحقاً",
        variant: "destructive"
      });
    }
  };

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => {
      setSyncStats(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "تم استعادة الاتصال",
        description: "سيتم مزامنة المحتوى تلقائياً",
      });
      
      // مزامنة تلقائية عند استعادة الاتصال
      setTimeout(handleManualSync, 2000);
    };

    const handleOffline = () => {
      setSyncStats(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // تحديث دوري للإحصائيات
  useEffect(() => {
    updateSyncStats();
    const interval = setInterval(updateSyncStats, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, [updateSyncStats]);

  const getSyncStatusBadge = () => {
    if (!syncStats.isOnline) {
      return <Badge variant="destructive" className="text-xs">غير متصل</Badge>;
    }
    if (syncStats.isSyncing) {
      return <Badge variant="secondary" className="text-xs">جاري المزامنة...</Badge>;
    }
    if (syncStats.errors.length > 0) {
      return <Badge variant="destructive" className="text-xs">خطأ في المزامنة</Badge>;
    }
    return <Badge variant="default" className="text-xs">متزامن</Badge>;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        {/* شريط الحالة */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {syncStats.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">مزامنة المحتوى</span>
          </div>
          {getSyncStatusBadge()}
        </div>

        {/* شريط التقدم أثناء المزامنة */}
        {syncStats.isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>جاري المزامنة...</span>
              <span>{Math.round(syncProgress)}%</span>
            </div>
            <Progress value={syncProgress} className="h-1" />
          </div>
        )}

        {/* معلومات المزامنة */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3 text-blue-500" />
            <span>{syncStats.totalContent} عنصر محتوى</span>
          </div>
          
          {syncStats.pendingChanges > 0 && (
            <div className="flex items-center gap-1">
              <Upload className="h-3 w-3 text-orange-500" />
              <span>{syncStats.pendingChanges} تغيير معلق</span>
            </div>
          )}
          
          {syncStats.lastSync && (
            <div className="col-span-2 text-muted-foreground">
              آخر مزامنة: {syncStats.lastSync.toLocaleString('ar-SA')}
            </div>
          )}
        </div>

        {/* رسائل الأخطاء */}
        {syncStats.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <div className="flex items-center gap-1 text-red-700 text-xs font-medium mb-1">
              <AlertCircle className="h-3 w-3" />
              أخطاء المزامنة ({syncStats.errors.length})
            </div>
            <div className="space-y-1">
              {syncStats.errors.slice(0, 2).map((error, index) => (
                <p key={index} className="text-xs text-red-600">
                  • {error}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* أزرار التحكم */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={syncStats.isSyncing}
            className="flex-1 text-xs h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${syncStats.isSyncing ? 'animate-spin' : ''}`} />
            تحديث الآن
          </Button>
          
          {syncStats.errors.length > 0 && (
            <Button
              size="sm"
              variant="default"
              onClick={handleRetrySync}
              disabled={syncStats.isSyncing}
              className="flex-1 text-xs h-8"
            >
              إعادة المحاولة
            </Button>
          )}
        </div>

        {/* مؤشر النجاح */}
        {syncStats.isOnline && !syncStats.isSyncing && syncStats.errors.length === 0 && (
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <CheckCircle className="h-3 w-3" />
            النظام يعمل بسلاسة
          </div>
        )}
      </CardContent>
    </Card>
  );
}