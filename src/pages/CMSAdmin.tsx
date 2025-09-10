// صفحة إدارة نظام المحتوى للأطباء والإداريين
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import { CMSAdminDashboard } from '@/components/cms/CMSAdminDashboard';
import { Shield, Settings } from 'lucide-react';

export default function CMSAdmin() {
  return (
    <MobileLayout>
      <MobileHeader 
        title="إدارة المحتوى" 
        subtitle="نظام إدارة المحتوى للأطباء"
        showBackButton
      />
      
      <div className="flex-1 p-4">
        <CMSAdminDashboard />
      </div>
    </MobileLayout>
  );
}