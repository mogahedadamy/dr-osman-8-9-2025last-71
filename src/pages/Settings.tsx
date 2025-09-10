import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Globe, Shield, Download, Trash2, Settings as SettingsIcon, FileText, HelpCircle, Zap, Upload, LogIn, Users, Database, ChevronRight } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNotificationSettings from "@/components/settings/MobileNotificationSettings";
import { PushNotificationSettings } from "@/components/settings/PushNotificationSettings";
import { DataManager } from "@/components/shared/DataManager";
import { AnimatedPage, FadeIn, ScaleIn, AnimatedList, AnimatedListItem } from "@/components/mobile/AnimatedPage";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import { useToast } from "@/hooks/use-toast";
import { usePerformance } from "@/hooks/usePerformance";
import { useSettingsContext } from "@/providers/SettingsProvider";

const Settings = () => {
  const { toast } = useToast();
  const { metrics, optimizeImages, preloadCriticalResources } = usePerformance();
  const navigate = useNavigate();
  const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettingsContext();
  const { isAuthenticated, isAdmin, currentUser } = useAuth();

  const exportData = () => {
    const data = {
      profile: JSON.parse(localStorage.getItem('pregnancyProfile') || '{}'),
      settings: settings,
      reminders: JSON.parse(localStorage.getItem('reminders') || '[]'),
      dailyLogs: JSON.parse(localStorage.getItem('dailyLogs') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pregnancy-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "تم تصدير البيانات",
      description: "تم حفظ بياناتك في ملف JSON",
    });
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importSettings(file);
      }
    };
    input.click();
  };

  const optimizeApp = () => {
    optimizeImages();
    preloadCriticalResources([
      '/favicon.ico',
      // Add other critical resources
    ]);
    
    toast({
      title: "تم تحسين الأداء",
      description: "تم تحسين الصور وتحميل الموارد المهمة مسبقاً"
    });
  };

  const clearAllData = () => {
    if (confirm('هل أنت متأكدة من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      localStorage.clear();
      toast({
        title: "تم حذف البيانات",
        description: "تم حذف جميع بياناتك من التطبيق",
        variant: "destructive"
      });
    }
  };

  const settingsSections = [
    { id: "notifications", name: "الإشعارات", icon: Bell, color: "text-primary" },
    { id: "appearance", name: "المظهر", icon: Moon, color: "text-secondary" },
    { id: "privacy", name: "الخصوصية", icon: Shield, color: "text-wellness" },
    { id: "data", name: "البيانات", icon: Download, color: "text-accent" },
  ];

  return (
    <MobileLayout>
      <AnimatedPage>
        {/* Mobile Header */}
        <MobileHeader 
          title="الإعدادات"
          subtitle="تخصيص تجربتك"
          showBackButton={true}
          onBack={() => navigate(-1)}
        />

        <div className="px-4 py-6 space-y-6">
          {/* Settings Status Banner */}
          <FadeIn delay={0.05}>
            <Card className="shadow-card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <SettingsIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">الإعدادات المطبقة</p>
                      <div className="flex gap-2 mt-1">
                        {settings.darkMode && <Badge variant="secondary" className="text-xs">🌙 ليلي</Badge>}
                        {settings.notifications && <Badge variant="secondary" className="text-xs">🔔 إشعارات</Badge>}
                        {settings.language === 'ar' && <Badge variant="secondary" className="text-xs">🇸🇦 عربي</Badge>}
                        {settings.dataBackup && <Badge variant="secondary" className="text-xs">💾 نسخ احتياطي</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    آخر تحديث: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
          {/* Enhanced Notification Settings */}
          <FadeIn delay={0.1}>
            <MobileNotificationSettings />
          </FadeIn>

          {/* Quick Settings Overview */}
          <ScaleIn delay={0.2}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {settingsSections.map((section, index) => (
                <TouchFeedback key={section.id}>
                  <Card className="cursor-pointer transition-all duration-300 hover:shadow-soft hover:scale-105 touch-target">
                    <CardContent className="p-4 text-center space-y-2">
                      <section.icon className={`w-6 h-6 mx-auto ${section.color}`} />
                      <p className="text-sm font-medium text-foreground">{section.name}</p>
                    </CardContent>
                  </Card>
                </TouchFeedback>
              ))}
            </div>
          </ScaleIn>

          {/* Notifications Settings */}
          <FadeIn delay={0.3}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  إعدادات الإشعارات التفصيلية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TouchFeedback>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <Label className="font-medium">تفعيل الإشعارات</Label>
                      <p className="text-sm text-muted-foreground">إشعارات عامة للتطبيق</p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', checked)}
                    />
                  </div>
                </TouchFeedback>
            
            <div className="flex items-center justify-between">
              <Label className="font-medium">التذكير اليومي</Label>
              <Switch
                checked={settings.dailyReminders}
                onCheckedChange={(checked) => updateSetting('dailyReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="font-medium">تذكير المواعيد</Label>
              <Switch
                checked={settings.appointmentReminders}
                onCheckedChange={(checked) => updateSetting('appointmentReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="font-medium">تذكير الأدوية</Label>
              <Switch
                checked={settings.medicationReminders}
                onCheckedChange={(checked) => updateSetting('medicationReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="font-medium">تذكير التمارين</Label>
              <Switch
                checked={settings.exerciseReminders}
                onCheckedChange={(checked) => updateSetting('exerciseReminders', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">وقت التذكير اليومي</Label>
              <Select 
                value={settings.reminderTime} 
                onValueChange={(value) => updateSetting('reminderTime', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">07:00 صباحاً</SelectItem>
                  <SelectItem value="08:00">08:00 صباحاً</SelectItem>
                  <SelectItem value="09:00">09:00 صباحاً</SelectItem>
                  <SelectItem value="10:00">10:00 صباحاً</SelectItem>
                </SelectContent>
              </Select>
            </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Appearance Settings */}
          <FadeIn delay={0.4}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-secondary" />
                  المظهر والعرض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">الوضع الليلي</Label>
                    <p className="text-sm text-muted-foreground">تبديل بين الوضع الفاتح والداكن</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">اللغة</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting('language', value as 'ar' | 'en')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Privacy Settings */}
          <FadeIn delay={0.5}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-wellness" />
                  الخصوصية والأمان
                </CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">النسخ الاحتياطي التلقائي</Label>
                <p className="text-sm text-muted-foreground">حفظ البيانات محلياً</p>
              </div>
              <Switch
                checked={settings.dataBackup}
                onCheckedChange={(checked) => updateSetting('dataBackup', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">مشاركة إحصائيات الاستخدام</Label>
                <p className="text-sm text-muted-foreground">مساعدة في تطوير التطبيق</p>
              </div>
              <Switch
                checked={settings.shareAnalytics}
                onCheckedChange={(checked) => updateSetting('shareAnalytics', checked)}
              />
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Label className="font-medium">الحساب والاشتراك</Label>
              </div>
              
              <Link to="/premium-access">
                <Button variant="default" className="w-full justify-start text-sm bg-gradient-to-r from-primary to-secondary">
                  👑 الاشتراك المدفوع
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="outline" className="w-full justify-start text-sm">
                  🔐 تسجيل الدخول
                </Button>
              </Link>
              
              {/* Admin Login Section */}
              <div className="flex items-center gap-2 mb-3 mt-6">
                <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                <Label className="font-medium text-red-700 dark:text-red-300">إدارة النظام</Label>
              </div>
              
              <Link to="/admin-login">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100"
                >
                  <LogIn className="w-4 h-4 ml-2" />
                  تسجيل دخول المدير
                </Button>
              </Link>
              
              {/* Admin Panel - Only show if admin is logged in */}
              {isAuthenticated && isAdmin() && (
                <div className="space-y-2 mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
                      مرحباً {currentUser?.fullName}
                    </Badge>
                  </div>
                  
                  <Link to="/admin">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-sm text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        لوحة تحكم المدير
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Link to="/admin">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-sm text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        إدارة المستخدمين
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Link to="/content-management">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-sm text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50"
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        إدارة المحتوى
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-3 mt-6">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Label className="font-medium">المستندات القانونية</Label>
              </div>
              
              <Link to="/privacy-policy">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Shield className="w-4 h-4 ml-2" />
                  سياسة الخصوصية
                </Button>
              </Link>
              
              <Link to="/terms-of-service">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <FileText className="w-4 h-4 ml-2" />
                  شروط الاستخدام
                </Button>
              </Link>
              
              <Link to="/instructions">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <HelpCircle className="w-4 h-4 ml-2" />
                  دليل الاستخدام
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

          {/* Enhanced Data Management - New Local Database */}
          <FadeIn delay={0.6}>
            <Card className="shadow-card border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  قاعدة البيانات المحلية المتقدمة
                  <Badge className="bg-primary text-primary-foreground">جديد</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataManager />
              </CardContent>
            </Card>
          </FadeIn>

          {/* Legacy Data Management */}
          <FadeIn delay={0.7}>
            <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-accent" />
              إدارة البيانات والأداء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.memoryUsage && (
              <div className="p-3 bg-muted/50 rounded">
                <div className="flex justify-between text-sm">
                  <span>استخدام الذاكرة:</span>
                  <span className="font-mono">{metrics.memoryUsage.toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>وقت التحميل:</span>
                  <span className="font-mono">{metrics.loadTime.toFixed(0)} ms</span>
                </div>
                {metrics.isSlowConnection && (
                  <Badge variant="outline" className="mt-2 text-yellow-600">
                    اتصال بطيء - تم تحسين المحتوى
                  </Badge>
                )}
              </div>
            )}
            
            <TouchFeedback>
              <Button 
                onClick={optimizeApp}
                variant="outline" 
                className="w-full justify-start touch-target"
              >
                <Zap className="w-4 h-4 ml-2" />
                تحسين أداء التطبيق
              </Button>
            </TouchFeedback>
            
            <TouchFeedback>
              <Button 
                onClick={importData}
                variant="outline" 
                className="w-full justify-start touch-target"
              >
                <Upload className="w-4 h-4 ml-2" />
                استيراد الإعدادات
              </Button>
            </TouchFeedback>
            
            <TouchFeedback>
              <Button 
                onClick={exportSettings}
                variant="outline" 
                className="w-full justify-start touch-target"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير الإعدادات
              </Button>
            </TouchFeedback>
            
            <TouchFeedback>
              <Button 
                onClick={resetSettings}
                variant="outline" 
                className="w-full justify-start touch-target"
              >
                <SettingsIcon className="w-4 h-4 ml-2" />
                إعادة تعيين الإعدادات
              </Button>
            </TouchFeedback>
            
            <TouchFeedback>
              <Button 
                onClick={exportData}
                variant="outline" 
                className="w-full justify-start touch-target"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير البيانات
              </Button>
            </TouchFeedback>
            
            <TouchFeedback>
              <Button 
                onClick={clearAllData}
                variant="destructive" 
                className="w-full justify-start touch-target"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف جميع البيانات
              </Button>
            </TouchFeedback>
          </CardContent>
        </Card>
      </FadeIn>

      {/* App Info */}
      <FadeIn delay={0.8}>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <Badge variant="secondary">الإصدار 1.0.0</Badge>
              <p className="text-sm text-muted-foreground">
                تطبيق رفيقة الحمل - مساعدك الذكي في رحلة الأمومة
              </p>
              <p className="text-xs text-muted-foreground">
                © 2024 جميع الحقوق محفوظة
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
        </div>
      </AnimatedPage>
    </MobileLayout>
  );
};

export default Settings;