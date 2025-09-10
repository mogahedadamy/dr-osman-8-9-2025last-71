// صفحة إدارة المحتوى الديناميكي
import React from 'react';
import { RealTimeContentManager } from '@/components/cms/RealTimeContentManager';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import { ContentHealthMonitor } from '@/components/mobile/ContentHealthMonitor';
import { EnhancedContentSync } from '@/components/mobile/EnhancedContentSync';

export default function ContentManagement() {
  return (
    <MobileLayout>
      <MobileHeader 
        title="لوحة التحكم الفورية" 
      />
      
      <div className="flex-1 space-y-4 p-4">
        {/* مراقبة صحة النظام */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentHealthMonitor />
          <EnhancedContentSync />
        </div>
        
        {/* مدير المحتوى الرئيسي */}
        <RealTimeContentManager />
      </div>
    </MobileLayout>
  );
}