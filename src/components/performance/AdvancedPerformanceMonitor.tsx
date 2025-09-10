import { useEffect, useState } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceWarning {
  type: 'memory' | 'speed' | 'battery' | 'network';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

const AdvancedPerformanceMonitor = () => {
  const { metrics, optimizations, cleanupMemory } = useAdvancedPerformance();
  const [warnings, setWarnings] = useState<PerformanceWarning[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // تحليل المقاييس وإنشاء التحذيرات
  useEffect(() => {
    const newWarnings: PerformanceWarning[] = [];

    // تحذيرات الذاكرة
    if (metrics.memoryUsage > 100) {
      newWarnings.push({
        type: 'memory',
        message: `استهلاك ذاكرة عالي: ${metrics.memoryUsage.toFixed(1)}MB`,
        severity: metrics.memoryUsage > 200 ? 'high' : 'medium'
      });
    }

    // تحذيرات السرعة
    if (metrics.loadTime > 3000) {
      newWarnings.push({
        type: 'speed',
        message: `وقت تحميل بطيء: ${(metrics.loadTime / 1000).toFixed(1)}s`,
        severity: metrics.loadTime > 5000 ? 'high' : 'medium'
      });
    }

    // تحذيرات الشبكة
    if (metrics.networkSpeed === 'slow') {
      newWarnings.push({
        type: 'network',
        message: 'شبكة بطيئة - تم تفعيل التحسينات',
        severity: 'medium'
      });
    }

    // تحذيرات البطارية
    if (metrics.batteryLevel && metrics.batteryLevel < 20) {
      newWarnings.push({
        type: 'battery',
        message: `بطارية منخفضة: ${metrics.batteryLevel.toFixed(0)}%`,
        severity: 'low'
      });
    }

    setWarnings(newWarnings);
  }, [metrics]);

  // إذا كان هناك مشاكل في الأداء، اعرض المونيتور
  const shouldShow = warnings.length > 0 || showDetails;

  if (!shouldShow && process.env.NODE_ENV === 'production') {
    return null;
  }

  const getStatusColor = () => {
    const highSeverityWarnings = warnings.filter(w => w.severity === 'high').length;
    if (highSeverityWarnings > 0) return 'destructive';
    if (warnings.length > 0) return 'warning';
    return 'success';
  };

  const getPerformanceScore = () => {
    let score = 100;
    
    // خصم نقاط بناءً على المشاكل
    warnings.forEach(warning => {
      switch (warning.severity) {
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    return Math.max(0, score);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              ⚡ مراقب الأداء
              <Badge variant={getStatusColor() as any} className="text-xs">
                {getPerformanceScore()}%
              </Badge>
            </CardTitle>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showDetails ? 'إخفاء' : 'تفاصيل'}
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* شريط الأداء العام */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>الأداء العام</span>
              <span>{getPerformanceScore()}%</span>
            </div>
            <Progress value={getPerformanceScore()} className="h-2" />
          </div>

          {/* التحذيرات */}
          {warnings.length > 0 && (
            <div className="space-y-1">
              {warnings.slice(0, showDetails ? warnings.length : 2).map((warning, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    warning.severity === 'high' ? 'bg-destructive' :
                    warning.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-muted-foreground">{warning.message}</span>
                </div>
              ))}
              {warnings.length > 2 && !showDetails && (
                <div className="text-xs text-muted-foreground">
                  +{warnings.length - 2} تحذيرات أخرى
                </div>
              )}
            </div>
          )}

          {/* معلومات تفصيلية */}
          {showDetails && (
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">الذاكرة:</span>
                  <br />
                  <span className="font-mono">{metrics.memoryUsage.toFixed(1)}MB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">التحميل:</span>
                  <br />
                  <span className="font-mono">{(metrics.loadTime / 1000).toFixed(1)}s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">العناصر:</span>
                  <br />
                  <span className="font-mono">{metrics.domElements}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الشبكة:</span>
                  <br />
                  <span className="font-mono">{metrics.networkSpeed}</span>
                </div>
              </div>

              {/* أزرار التحسين */}
              <div className="flex gap-2">
                <button
                  onClick={cleanupMemory}
                  className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs py-1 px-2 rounded transition-colors"
                >
                  تنظيف الذاكرة
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground text-xs py-1 px-2 rounded transition-colors"
                >
                  إعادة تحميل
                </button>
              </div>
            </div>
          )}

          {/* مؤشر التحسينات المفعلة */}
          {(optimizations.shouldLazyLoad || optimizations.shouldUseVirtualScroll) && (
            <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded">
              ✓ تم تفعيل تحسينات الأداء تلقائياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPerformanceMonitor;