// مؤشر حالة المزامنة
import React from 'react';
import { SyncStatus } from '@/types/cms';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface SyncIndicatorProps {
  syncStatus: SyncStatus;
}

export function SyncIndicator({ syncStatus }: SyncIndicatorProps) {
  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="h-4 w-4 text-destructive" />;
    }
    
    if (syncStatus.isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
    }
    
    if (syncStatus.errors.length > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'غير متصل';
    }
    
    if (syncStatus.isSyncing) {
      return 'جاري المزامنة...';
    }
    
    if (syncStatus.errors.length > 0) {
      return 'خطأ في المزامنة';
    }
    
    return 'متزامن';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!syncStatus.isOnline) return 'destructive';
    if (syncStatus.isSyncing) return 'secondary';
    if (syncStatus.errors.length > 0) return 'outline';
    return 'default';
  };

  const getTooltipContent = () => {
    const lastSync = new Date(syncStatus.lastSuccessfulSync).toLocaleString('ar-SA');
    
    return (
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>الحالة:</span>
          <span>{getStatusText()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>آخر مزامنة:</span>
          <span>{lastSync}</span>
        </div>
        
        {syncStatus.pendingChanges > 0 && (
          <div className="flex items-center justify-between">
            <span>تغييرات معلقة:</span>
            <span>{syncStatus.pendingChanges}</span>
          </div>
        )}
        
        {syncStatus.isSyncing && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>التقدم:</span>
              <span>{Math.round(syncStatus.syncProgress)}%</span>
            </div>
            <Progress value={syncStatus.syncProgress} className="h-1" />
          </div>
        )}
        
        {syncStatus.errors.length > 0 && (
          <div className="space-y-1">
            <span className="text-destructive">أخطاء:</span>
            {syncStatus.errors.slice(0, 3).map((error, index) => (
              <div key={index} className="text-destructive">
                • {error}
              </div>
            ))}
            {syncStatus.errors.length > 3 && (
              <div className="text-muted-foreground">
                ...و {syncStatus.errors.length - 3} أخطاء أخرى
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getStatusVariant()} 
            className="cursor-help flex items-center gap-2"
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
            {syncStatus.pendingChanges > 0 && (
              <span className="bg-background text-foreground rounded-full px-1 text-xs">
                {syncStatus.pendingChanges}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}