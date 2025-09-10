import { useState, useEffect } from 'react';
import { useLightningPerformance } from '@/hooks/useLightningPerformance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const LightningSpeedMonitor = () => {
  const { speedScore, speedStatus, boost, metrics, isLightningFast } = useLightningPerformance();
  const [showMonitor, setShowMonitor] = useState(false);
  const [hasShownBoost, setHasShownBoost] = useState(false);

  // عرض المونيتور عند البطء أو عند الطلب
  useEffect(() => {
    if (speedScore < 70 && !hasShownBoost) {
      setShowMonitor(true);
      setHasShownBoost(true);
    }
  }, [speedScore, hasShownBoost]);

  // إخفاء تلقائي عند تحسن الأداء
  useEffect(() => {
    if (isLightningFast && showMonitor) {
      const timer = setTimeout(() => {
        setShowMonitor(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLightningFast, showMonitor]);

  const handleBoost = () => {
    boost();
    setShowMonitor(false);
    
    // إظهار رسالة نجاح
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right';
    toast.innerHTML = '⚡ تم تسريع التطبيق بنجاح!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // عدم العرض في الإنتاج إذا كان الأداء جيد
  if (process.env.NODE_ENV === 'production' && !showMonitor && speedScore > 70) {
    return null;
  }

  return (
    <>
      {/* مؤشر سرعة عائم */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowMonitor(!showMonitor)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
            bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border shadow-lg
            hover:scale-105 transition-all duration-200
            ${speedStatus.color}
          `}
        >
          <span className="text-lg">{speedStatus.emoji}</span>
          <span>{speedScore}%</span>
        </button>
      </div>

      {/* مونيتور مفصل */}
      {showMonitor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
            <CardContent className="p-6">
              {/* عنوان */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{speedStatus.emoji}</div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  مراقب السرعة
                </h2>
                <p className="text-sm text-muted-foreground">
                  {speedStatus.level === 'lightning' && 'سريع كالرصاصة! ⚡'}
                  {speedStatus.level === 'fast' && 'سرعة جيدة 🚀'}
                  {speedStatus.level === 'normal' && 'سرعة عادية 🏃'}
                  {speedStatus.level === 'slow' && 'يحتاج تسريع 🐌'}
                </p>
              </div>

              {/* نقاط السرعة */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">نقاط السرعة</span>
                  <Badge 
                    variant={speedScore >= 90 ? 'default' : speedScore >= 70 ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {speedScore}/100
                  </Badge>
                </div>
                <Progress 
                  value={speedScore} 
                  className="h-3 mb-2"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {speedScore >= 90 && '⚡ أداء ممتاز - سريع كالرصاصة!'}
                  {speedScore >= 70 && speedScore < 90 && '🚀 أداء جيد جداً'}  
                  {speedScore >= 50 && speedScore < 70 && '🏃 أداء متوسط'}
                  {speedScore < 50 && '🐌 يحتاج تحسين'}
                </div>
              </div>

              {/* معلومات سريعة */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <div className="text-muted-foreground">الذاكرة</div>
                  <div className="font-mono font-semibold">
                    {metrics.memoryUsage.toFixed(1)}MB
                  </div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="text-muted-foreground">التحميل</div>
                  <div className="font-mono font-semibold">
                    {(metrics.loadTime / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-3">
                {speedScore < 90 && (
                  <Button 
                    onClick={handleBoost}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    size="sm"
                  >
                    ⚡ تسريع فوري
                  </Button>
                )}
                <Button 
                  onClick={() => setShowMonitor(false)}
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  إغلاق
                </Button>
              </div>

              {/* رسالة تشجيعية */}
              {isLightningFast && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <div className="text-sm text-green-700 dark:text-green-300">
                    🎉 مبروك! تطبيقك سريع كالرصاصة
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LightningSpeedMonitor;