import React, { useEffect } from 'react';
import { initData } from '@/lib/initData';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  useEffect(() => {
    // تهيئة البيانات الأولية والمستخدمين التجريبيين
    const initialize = async () => {
      try {
        await initData();
        console.log('تم تهيئة التطبيق وإنشاء المستخدمين التجريبيين بنجاح');
      } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
      }
    };

    initialize();
  }, []);

  return <>{children}</>;
};

export default AppInitializer;