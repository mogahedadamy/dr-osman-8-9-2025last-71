import React from 'react';
import { Badge } from '@/components/ui/badge';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // إخفاء المؤشر إذا كان المستخدم متصل
  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <Badge
        variant="destructive"
        className="flex items-center gap-1 px-2 py-1 text-xs"
      >
        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
        غير متصل
      </Badge>
    </div>
  );
};

export default OfflineIndicator;