import React from 'react';
import { contentService } from '@/services/contentService';
import { useDynamicContent } from '@/hooks/useDynamicContent';
import { useToast } from '@/hooks/use-toast';

interface ContentSyncManagerProps {
  children: React.ReactNode;
}

export function ContentSyncManager({ children }: ContentSyncManagerProps) {
  const { toast } = useToast();
  const { syncStatus, syncContent } = useDynamicContent();
  const [lastSyncCheck, setLastSyncCheck] = React.useState<Date>(new Date());

  // فحص وتزامن المحتوى تلقائياً
  React.useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const stats = contentService.getContentStats();
        
        // إذا كان هناك محتوى جديد منذ آخر فحص
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastSyncCheck.getTime();
        const oneHour = 60 * 60 * 1000; // ساعة واحدة

        if (timeDiff > oneHour && navigator.onLine) {
          await syncContent();
          setLastSyncCheck(currentTime);
          
          toast({
            title: "تحديث المحتوى",
            description: "تم تحديث المحتوى تلقائياً",
          });
        }
      } catch (error) {
        console.error('Auto sync error:', error);
      }
    };

    // فحص كل 30 دقيقة
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    // فحص عند تحميل المكون
    checkForUpdates();

    return () => clearInterval(interval);
  }, [lastSyncCheck, syncContent, toast]);

  // مراقبة الاتصال بالإنترنت
  React.useEffect(() => {
    const handleOnline = () => {
      syncContent();
      toast({
        title: "تم استعادة الاتصال",
        description: "سيتم مزامنة المحتوى الآن",
      });
    };

    const handleOffline = () => {
      toast({
        title: "انقطع الاتصال",
        description: "سيتم مزامنة المحتوى عند استعادة الاتصال",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncContent, toast]);

  return <>{children}</>;
}