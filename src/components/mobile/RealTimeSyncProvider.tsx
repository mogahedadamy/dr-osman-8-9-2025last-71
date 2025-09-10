// مزود المزامنة الفورية للتطبيق
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseContentService } from '@/services/supabaseContentService';
import { useToast } from '@/hooks/use-toast';

interface RealTimeSyncContextType {
  isConnected: boolean;
  lastUpdate: Date;
  connectedUsers: number;
  syncStatus: 'connected' | 'disconnected' | 'syncing';
}

const RealTimeSyncContext = createContext<RealTimeSyncContextType | undefined>(undefined);

interface RealTimeSyncProviderProps {
  children: React.ReactNode;
}

export function RealTimeSyncProvider({ children }: RealTimeSyncProviderProps) {
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected');
  const { toast } = useToast();

  useEffect(() => {
    // تحميل البيانات من التخزين المحلي عند البدء
    supabaseContentService.loadFromLocalStorage();

    // الاشتراك في تحديثات المحتوى الفورية
    const unsubscribe = supabaseContentService.onContentUpdate(() => {
      setLastUpdate(new Date());
      setSyncStatus('syncing');
      
      // إظهار إشعار للمستخدم عن التحديث
      toast({
        title: "محتوى جديد متاح",
        description: "تم تحديث المحتوى تلقائياً",
        duration: 3000
      });

      // إعادة تعيين الحالة بعد ثانية
      setTimeout(() => {
        setSyncStatus('connected');
      }, 1000);
    });

    // مراقبة حالة الاتصال بالإنترنت
    const handleOnline = () => {
      setIsConnected(true);
      setSyncStatus('connected');
      toast({
        title: "تم استعادة الاتصال",
        description: "سيتم مزامنة المحتوى الآن",
      });
    };

    const handleOffline = () => {
      setIsConnected(false);
      setSyncStatus('disconnected');
      toast({
        title: "انقطع الاتصال",
        description: "ستعمل من البيانات المحفوظة محلياً",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // محاكاة عدد المستخدمين المتصلين
    const userInterval = setInterval(() => {
      setConnectedUsers(Math.floor(Math.random() * 50) + 10);
    }, 30000);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(userInterval);
    };
  }, [toast]);

  const contextValue: RealTimeSyncContextType = {
    isConnected,
    lastUpdate,
    connectedUsers,
    syncStatus
  };

  return (
    <RealTimeSyncContext.Provider value={contextValue}>
      {children}
    </RealTimeSyncContext.Provider>
  );
}

export function useRealTimeSync() {
  const context = useContext(RealTimeSyncContext);
  if (context === undefined) {
    throw new Error('useRealTimeSync must be used within a RealTimeSyncProvider');
  }
  return context;
}