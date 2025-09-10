import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import SmartReminderSystem from "@/components/reminders/SmartReminderSystem";
import { Bell } from "lucide-react";
import { AnimatedPage } from "@/components/mobile/AnimatedPage";

const SmartReminders = () => {
  const navigate = useNavigate();
  
  return (
    <MobileLayout>
      <AnimatedPage>
        <div className="flex flex-col h-full">
          <MobileHeader 
            title="التذكيرات الذكية"
            subtitle="نظام الإشعارات المخصص للحمل"
            showBackButton={true}
            onBack={() => navigate(-1)}
          />
          
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Bell className="w-16 h-16 mx-auto text-primary" />
              <h2 className="text-xl font-bold">نظام التذكيرات الذكية</h2>
              <p className="text-muted-foreground">
                سيتم تفعيل نظام التذكيرات الذكية قريباً مع إشعارات مخصصة لكل مرحلة من مراحل الحمل
              </p>
            </div>
          </div>
        </div>
      </AnimatedPage>
    </MobileLayout>
  );
};

export default SmartReminders;