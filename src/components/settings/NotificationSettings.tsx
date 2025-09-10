import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const { permission, isSupported, requestPermission, showNotification } = useNotifications();
  const { toast } = useToast();

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: "مفعلة",
          variant: "secondary" as const,
          color: "text-green-600"
        };
      case 'denied':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: "مرفوضة",
          variant: "destructive" as const,
          color: "text-red-600"
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          text: "غير محددة",
          variant: "outline" as const,
          color: "text-yellow-600"
        };
    }
  };

  const handleTestNotification = async () => {
    const notification = await showNotification({
      title: "تجربة الإشعارات",
      body: "تم تفعيل الإشعارات بنجاح! ستتلقين تذكيرات للمواعيد والأدوية المهمة.",
      requireInteraction: true
    });

    if (notification) {
      toast({
        title: "تم إرسال الإشعار",
        description: "تحققي من إشعارات المتصفح"
      });
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      handleTestNotification();
    }
  };

  if (!isSupported) {
    return (
      <Card className="shadow-card border-yellow-200">
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-muted-foreground">
            متصفحك لا يدعم إشعارات الويب
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getPermissionStatus();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          حالة الإشعارات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className="font-medium">حالة الإذن:</span>
          </div>
          <Badge variant={statusInfo.variant} className={statusInfo.color}>
            {statusInfo.text}
          </Badge>
        </div>

        {permission === 'granted' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                الإشعارات مفعلة بنجاح
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              ستتلقين تذكيرات للمواعيد والأدوية في الوقت المحدد
            </p>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                الإشعارات مرفوضة
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              لتفعيل الإشعارات، اذهبي لإعدادات المتصفح وأعطي الإذن لهذا الموقع
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {permission !== 'granted' && (
            <Button 
              onClick={handleRequestPermission}
              className="flex-1"
            >
              طلب إذن الإشعارات
            </Button>
          )}
          
          {permission === 'granted' && (
            <Button 
              onClick={handleTestNotification}
              variant="outline"
              className="flex-1"
            >
              تجربة الإشعار
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <strong>معلومة:</strong> الإشعارات تعمل فقط عندما يكون التطبيق مفتوحاً في المتصفح. 
          لإشعارات دائمة، يمكنك إضافة التطبيق لشاشتك الرئيسية.
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;