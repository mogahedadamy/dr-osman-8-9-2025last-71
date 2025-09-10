import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Check, AlertTriangle, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAutoSync } from '@/hooks/useAutoSync';

const AutoSyncIndicator = () => {
  const { isOnline, isSyncing, pendingTasks, forcSync, syncStatus } = useAutoSync();
  const [showIndicator, setShowIndicator] = useState(false);

  // إظهار المؤشر عند وجود مهام معلقة أو عدم الاتصال
  useEffect(() => {
    setShowIndicator(!isOnline || pendingTasks > 0 || isSyncing);
  }, [isOnline, pendingTasks, isSyncing]);

  // إخفاء المؤشر بعد نجاح المزامنة
  useEffect(() => {
    if (syncStatus === 'success' && pendingTasks === 0) {
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, pendingTasks]);

  if (!showIndicator) return null;

  const getIndicatorProps = () => {
    if (!isOnline) {
      return {
        variant: 'destructive' as const,
        icon: <WifiOff className="w-3 h-3" />,
        text: 'غير متصل',
        action: null
      };
    }

    if (isSyncing) {
      return {
        variant: 'secondary' as const,
        icon: <RefreshCw className="w-3 h-3 animate-spin" />,
        text: 'جاري المزامنة...',
        action: null
      };
    }

    if (syncStatus === 'success') {
      return {
        variant: 'default' as const,
        icon: <Check className="w-3 h-3" />,
        text: 'تم التحديث',
        action: null
      };
    }

    if (syncStatus === 'error') {
      return {
        variant: 'destructive' as const,
        icon: <AlertTriangle className="w-3 h-3" />,
        text: 'فشل في المزامنة',
        action: (
          <Button
            size="sm"
            variant="ghost"
            onClick={forcSync}
            className="h-6 px-2 text-xs"
          >
            إعادة المحاولة
          </Button>
        )
      };
    }

    if (pendingTasks > 0) {
      return {
        variant: 'default' as const,
        icon: <Cloud className="w-3 h-3" />,
        text: `${pendingTasks} في انتظار المزامنة`,
        action: (
          <Button
            size="sm"
            variant="ghost"
            onClick={forcSync}
            className="h-6 px-2 text-xs"
          >
            مزامنة
          </Button>
        )
      };
    }

    return {
      variant: 'default' as const,
      icon: <Wifi className="w-3 h-3" />,
      text: 'متصل',
      action: null
    };
  };

  const { variant, icon, text, action } = getIndicatorProps();

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <Badge
        variant={variant}
        className="flex items-center gap-1 px-3 py-1 shadow-lg"
      >
        {icon}
        <span className="text-xs">{text}</span>
      </Badge>
      {action}
    </div>
  );
};

export default AutoSyncIndicator;