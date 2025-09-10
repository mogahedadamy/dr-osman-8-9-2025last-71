import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Database, 
  WifiOff, 
  Wifi, 
  Download, 
  Upload,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useSQLiteStorage } from '@/hooks/useSQLiteStorage';
import { useDataManager } from '@/hooks/useDataManager';

const DataSyncManager = () => {
  const { syncStatus, syncWithServer, stats } = useSQLiteStorage();
  const { exportData, createFullBackup } = useDataManager();
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    if (syncStatus.syncing) {
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setSyncProgress(syncStatus.pendingItems === 0 ? 100 : 0);
    }
  }, [syncStatus.syncing, syncStatus.pendingItems]);

  const handleManualSync = async () => {
    setSyncProgress(0);
    await syncWithServer();
  };

  const handleExportBackup = async () => {
    try {
      await exportData('json');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getSyncStatusColor = () => {
    if (!syncStatus.isOnline) return 'destructive';
    if (syncStatus.syncing) return 'secondary';
    if (syncStatus.pendingItems > 0) return 'default';
    return 'default';
  };

  const getSyncStatusIcon = () => {
    if (!syncStatus.isOnline) return <WifiOff className="w-4 h-4" />;
    if (syncStatus.syncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (syncStatus.pendingItems > 0) return <AlertTriangle className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const getSyncStatusText = () => {
    if (!syncStatus.isOnline) return 'غير متصل بالإنترنت';
    if (syncStatus.syncing) return 'جاري المزامنة...';
    if (syncStatus.pendingItems > 0) return `${syncStatus.pendingItems} عنصر في انتظار المزامنة`;
    return 'البيانات محدثة';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5" />
            إدارة البيانات والمزامنة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* حالة الاتصال والمزامنة */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant={getSyncStatusColor()} className="flex items-center gap-1">
                {getSyncStatusIcon()}
                {syncStatus.isOnline ? 'متصل' : 'غير متصل'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getSyncStatusText()}
              </span>
            </div>
            
            {syncStatus.isOnline && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSync}
                disabled={syncStatus.syncing}
                className="flex items-center gap-1"
              >
                {syncStatus.syncing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                مزامنة
              </Button>
            )}
          </div>

          {/* شريط التقدم للمزامنة */}
          {syncStatus.syncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري المزامنة...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}

          {/* إحصائيات البيانات */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">نوع التخزين</span>
              </div>
              <p className="text-sm text-muted-foreground">{stats.platform}</p>
            </div>

            <div className="p-3 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-secondary-foreground" />
                <span className="text-sm font-medium">آخر مزامنة</span>
              </div>
              <p className="text-sm text-muted-foreground">{stats.lastSync}</p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBackup}
              className="flex-1 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              تصدير النسخة الاحتياطية
            </Button>
          </div>

          {/* معلومات إضافية */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-medium">ملاحظة مهمة</span>
            </div>
            <p>
              يتم حفظ البيانات محلياً حتى في حالة عدم الاتصال بالإنترنت. 
              ستتم المزامنة تلقائياً عند عودة الاتصال.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSyncManager;