import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Bell, Settings, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useAdvancedNotifications } from "@/hooks/useAdvancedNotifications";
import { useToast } from "@/hooks/use-toast";

const MobileNotificationSettings = () => {
  const { 
    settings, 
    hasPermission, 
    loading, 
    requestPermission, 
    updateSettings,
    scheduleNotification 
  } = useAdvancedNotifications();
  const { toast } = useToast();

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      // إرسال إشعار تجريبي
      await scheduleNotification({
        id: 9999,
        title: "🎉 تم تفعيل الإشعارات بنجاح!",
        body: "ستصلك الآن جميع التذكيرات والمواعيد المهمة مباشرة على هاتفك",
        schedule: new Date(Date.now() + 3000), // بعد 3 ثوان
        extra: { type: 'test' }
      });
      
      toast({
        title: "تم تفعيل الإشعارات المحلية",
        description: "ستصلك إشعارات فورية على الهاتف حتى لو كان التطبيق مغلق"
      });
    }
  };

  const handleTestNotification = async () => {
    await scheduleNotification({
      id: 9998,
      title: "📱 إشعار تجريبي",
      body: "هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح",
      schedule: new Date(Date.now() + 2000), // بعد ثانيتين
      extra: { type: 'test' }
    });

    toast({
      title: "تم إرسال إشعار تجريبي",
      description: "ستصلك رسالة خلال ثوانٍ قليلة"
    });
  };

  const getPermissionStatus = () => {
    if (hasPermission) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: "مفعلة ✓",
        variant: "secondary" as const,
        bgColor: "bg-green-50 border-green-200",
        textColor: "text-green-700"
      };
    } else {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        text: "غير مفعلة ✗",
        variant: "destructive" as const,
        bgColor: "bg-red-50 border-red-200", 
        textColor: "text-red-700"
      };
    }
  };

  const statusInfo = getPermissionStatus();

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">جاري تحميل إعدادات الإشعارات...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* بطاقة حالة الإشعارات */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            إشعارات التطبيق المحلية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusInfo.icon}
              <span className="font-medium">حالة الإشعارات:</span>
            </div>
            <Badge variant={statusInfo.variant}>
              {statusInfo.text}
            </Badge>
          </div>

          {hasPermission ? (
            <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  الإشعارات المحلية مفعلة بنجاح
                </span>
              </div>
              <p className="text-sm text-green-600">
                ستصلك التذكيرات والمواعيد مباشرة على هاتفك حتى لو كان التطبيق مغلق
              </p>
            </div>
          ) : (
            <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  الإشعارات غير مفعلة
                </span>
              </div>
              <p className="text-sm text-red-600">
                لتفعيل الإشعارات على هاتفك، اضغطي على زر "تفعيل الإشعارات" أدناه
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!hasPermission ? (
              <Button 
                onClick={handlePermissionRequest}
                className="flex-1"
                size="lg"
              >
                <Bell className="w-4 h-4 mr-2" />
                تفعيل الإشعارات المحلية
              </Button>
            ) : (
              <Button 
                onClick={handleTestNotification}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                إرسال إشعار تجريبي
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
            <strong>ملاحظة مهمة:</strong> الإشعارات المحلية تعمل على الهاتف بشكل أصلي مثل تطبيقات واتساب وفيسبوك، 
            وتصل حتى لو كان التطبيق مغلق بالكامل.
          </div>
        </CardContent>
      </Card>

      {/* بطاقة إعدادات أنواع الإشعارات */}
      {hasPermission && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              إعدادات أنواع الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التذكيرات اليومية</p>
                  <p className="text-sm text-muted-foreground">تذكيرات الأدوية والفيتامينات</p>
                </div>
                <Switch
                  checked={settings.reminders}
                  onCheckedChange={(checked) => updateSettings({ reminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">المواعيد الطبية</p>
                  <p className="text-sm text-muted-foreground">تذكيرات المواعيد والفحوصات</p>
                </div>
                <Switch
                  checked={settings.appointments}
                  onCheckedChange={(checked) => updateSettings({ appointments: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">السجل اليومي</p>
                  <p className="text-sm text-muted-foreground">تذكير تسجيل الحالة اليومية</p>
                </div>
                <Switch
                  checked={settings.dailyLogs}
                  onCheckedChange={(checked) => updateSettings({ dailyLogs: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">النصائح الأسبوعية</p>
                  <p className="text-sm text-muted-foreground">نصائح د.عثمان الأسبوعية</p>
                </div>
                <Switch
                  checked={settings.weeklyTips}
                  onCheckedChange={(checked) => updateSettings({ weeklyTips: checked })}
                />
              </div>

              <hr className="my-4" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الصوت</p>
                  <p className="text-sm text-muted-foreground">تشغيل صوت مع الإشعارات</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الاهتزاز</p>
                  <p className="text-sm text-muted-foreground">اهتزاز الهاتف مع الإشعارات</p>
                </div>
                <Switch
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileNotificationSettings;