import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Check, AlertTriangle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAutoSync } from '@/hooks/useAutoSync';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedOfflineIndicator = () => {
  const { isOnline, isSyncing, pendingTasks, forcSync, syncStatus } = useAutoSync();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // تحديث وقت آخر مزامنة
  useEffect(() => {
    if (syncStatus === 'success') {
      setLastSyncTime(new Date().toLocaleTimeString('ar'));
    }
  }, [syncStatus]);

  // إظهار/إخفاء التفاصيل تلقائياً
  useEffect(() => {
    if (!isOnline || pendingTasks > 0) {
      setIsExpanded(true);
    } else if (syncStatus === 'success') {
      const timer = setTimeout(() => setIsExpanded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingTasks, syncStatus]);

  const getConnectionStatus = () => {
    if (!isOnline) return { color: 'destructive', icon: WifiOff, text: 'غير متصل' };
    if (isSyncing) return { color: 'secondary', icon: RefreshCw, text: 'جاري المزامنة' };
    if (syncStatus === 'success') return { color: 'default', icon: Check, text: 'محدث' };
    if (syncStatus === 'error') return { color: 'destructive', icon: AlertTriangle, text: 'خطأ' };
    return { color: 'default', icon: Wifi, text: 'متصل' };
  };

  const { color, icon: Icon, text } = getConnectionStatus();

  return (
    <div className="fixed top-4 left-4 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className="shadow-lg border-0 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <CardContent className="p-3">
              {/* المؤشر الأساسي */}
              <div className="flex items-center gap-2">
                <Badge variant={color as any} className="flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {text}
                </Badge>
                
                {pendingTasks > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {pendingTasks}
                  </Badge>
                )}
              </div>

              {/* التفاصيل الموسعة */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t space-y-2">
                      
                      {/* حالة الاتصال */}
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>الحالة:</span>
                          <span className="font-medium">{text}</span>
                        </div>
                      </div>

                      {/* المهام المعلقة */}
                      {pendingTasks > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>في انتظار المزامنة:</span>
                            <span className="font-medium text-orange-500">
                              {pendingTasks} عنصر
                            </span>
                          </div>
                        </div>
                      )}

                      {/* آخر مزامنة */}
                      {lastSyncTime && (
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>آخر مزامنة:</span>
                            <span className="font-medium text-green-500">
                              {lastSyncTime}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* أزرار الإجراءات */}
                      {isOnline && (
                        <div className="flex gap-1 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              forcSync();
                            }}
                            disabled={isSyncing}
                            className="h-6 px-2 text-xs flex-1"
                          >
                            {isSyncing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Zap className="w-3 h-3 mr-1" />
                                مزامنة
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* رسالة حالة عدم الاتصال */}
                      {!isOnline && (
                        <div className="text-xs bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-2 rounded">
                          <div className="flex items-center gap-1">
                            <WifiOff className="w-3 h-3" />
                            <span>سيتم المزامنة عند عودة الاتصال</span>
                          </div>
                        </div>
                      )}

                      {/* رسالة نجح */}
                      {syncStatus === 'success' && pendingTasks === 0 && (
                        <div className="text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 p-2 rounded">
                          <div className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>جميع البيانات محدثة</span>
                          </div>
                        </div>
                      )}

                      {/* رسالة خطأ */}
                      {syncStatus === 'error' && (
                        <div className="text-xs bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-2 rounded">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>فشل في المزامنة</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedOfflineIndicator;