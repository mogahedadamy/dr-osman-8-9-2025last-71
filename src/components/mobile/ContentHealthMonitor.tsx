// مراقب صحة نظام المحتوى
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { contentService } from '@/services/contentService';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Users,
  Eye,
  Zap
} from 'lucide-react';

interface HealthStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
  averageViews: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  categories: number;
  lastUpdate: string;
  cacheSize: number;
  isHealthy: boolean;
}

export function ContentHealthMonitor() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const healthStats = contentService.getDetailedStats();
      setStats(healthStats);
      setLastCheck(new Date());
      
      // اختبار إضافي للتأكد من عمل النظام
      const testContent = await contentService.getAllContent({ limit: 1 });
      console.log('🩺 Health check - Sample content:', testContent.length > 0 ? '✅' : '❌');
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // فحص دوري كل دقيقة
    const healthInterval = setInterval(checkHealth, 60000);
    
    // مراقبة حالة الاتصال
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(healthInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        جاري فحص صحة النظام...
      </div>
    );
  }

  const getHealthStatus = () => {
    if (!stats.isHealthy) return { icon: XCircle, color: 'text-red-500', label: 'خطأ', variant: 'destructive' as const };
    if (stats.total < 10) return { icon: AlertCircle, color: 'text-yellow-500', label: 'تحذير', variant: 'secondary' as const };
    return { icon: CheckCircle, color: 'text-green-500', label: 'سليم', variant: 'default' as const };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <HealthIcon className={`h-4 w-4 ${healthStatus.color}`} />
            صحة نظام المحتوى
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={checkHealth}
            disabled={loading}
            className="h-6 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* حالة النظام العامة */}
        <div className="flex items-center justify-between">
          <span className="text-sm">حالة النظام</span>
          <Badge variant={healthStatus.variant} className="text-xs">
            {healthStatus.label}
          </Badge>
        </div>

        {/* الاتصال */}
        <div className="flex items-center justify-between">
          <span className="text-sm">الاتصال</span>
          <Badge variant={isOnline ? 'default' : 'destructive'} className="text-xs">
            {isOnline ? 'متصل' : 'غير متصل'}
          </Badge>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3 text-blue-500" />
            <span>{stats.total} محتوى</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-green-500" />
            <span>{stats.totalViews.toLocaleString()} مشاهدة</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-purple-500" />
            <span>{stats.categories} فئة</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-orange-500" />
            <span>{stats.published} منشور</span>
          </div>
        </div>

        {/* آخر فحص */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          آخر فحص: {lastCheck.toLocaleTimeString('ar-SA')}
        </div>

        {/* تفاصيل المشاكل إن وجدت */}
        {!stats.isHealthy && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
            <p className="font-medium">مشاكل تم اكتشافها:</p>
            {stats.total === 0 && <p>• لا يوجد محتوى</p>}
            {stats.categories === 0 && <p>• لا توجد فئات</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}