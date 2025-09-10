import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, TestTube, Clock, Baby, Calendar } from 'lucide-react';
import { useSmartPregnancyNotifications } from '@/hooks/useSmartPregnancyNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

export const PushNotificationSettings = () => {
  const {
    pregnancyWeek,
    isEnabled,
    notifications,
    enableSmartNotifications,
    disableSmartNotifications,
    getWeeklyTips,
    getUpcomingCheckups,
    dueDate,
    setDueDate
  } = useSmartPregnancyNotifications();

  const {
    permission,
    isSupported,
    isRegistered,
    sendTestNotification
  } = usePushNotifications();

  const { toast } = useToast();

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const success = await enableSmartNotifications();
      if (success) {
        toast({
          title: "تم تفعيل الإشعارات الذكية",
          description: "ستتلقين إشعارات مخصصة حسب أسبوع الحمل"
        });
      } else {
        toast({
          title: "فشل في تفعيل الإشعارات",
          description: "تأكدي من منح الإذن للإشعارات",
          variant: "destructive"
        });
      }
    } else {
      disableSmartNotifications();
      toast({
        title: "تم إيقاف الإشعارات",
        description: "لن تتلقي إشعارات تلقائية بعد الآن"
      });
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_tip': return <Clock className="h-4 w-4" />;
      case 'weekly_milestone': return <Baby className="h-4 w-4" />;
      case 'checkup_reminder': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'daily_tip': return 'نصيحة يومية';
      case 'weekly_milestone': return 'معلم أسبوعي';
      case 'checkup_reminder': return 'تذكير فحص';
      case 'medication': return 'دواء';
      case 'custom': return 'مخصص';
      default: return 'عام';
    }
  };

  const formatScheduledTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('ar-SA', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            الإشعارات غير مدعومة
          </CardTitle>
          <CardDescription>
            جهازك أو متصفحك لا يدعم الإشعارات
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات الذكية للحمل
          </CardTitle>
          <CardDescription>
            إشعارات مخصصة حسب أسبوع الحمل الحالي ({pregnancyWeek})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">تفعيل الإشعارات الذكية</p>
              <p className="text-xs text-muted-foreground">
                نصائح يومية وتذكيرات الفحوصات
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={permission !== 'granted'}
            />
          </div>

          {permission !== 'granted' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                يجب منح إذن الإشعارات أولاً
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant={isRegistered ? "default" : "secondary"}>
              {isRegistered ? "مسجل" : "غير مسجل"}
            </Badge>
            <Badge variant={permission === 'granted' ? "default" : "destructive"}>
              {permission === 'granted' ? "مصرح" : "غير مصرح"}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            disabled={!isRegistered || permission !== 'granted'}
            className="w-full"
          >
            <TestTube className="h-4 w-4 mr-2" />
            إرسال إشعار تجريبي
          </Button>
        </CardContent>
      </Card>

      {/* Due Date Setting */}
      <Card>
        <CardHeader>
          <CardTitle>تاريخ الولادة المتوقع</CardTitle>
          <CardDescription>
            لحساب أسبوع الحمل وجدولة الإشعارات المناسبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-background"
          />
          {dueDate && (
            <p className="text-sm text-muted-foreground mt-2">
              أنت حالياً في الأسبوع {pregnancyWeek} من الحمل
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Notifications */}
      {isEnabled && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الإشعارات المجدولة</CardTitle>
            <CardDescription>
              الإشعارات النشطة المجدولة حسب أسبوع الحمل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getNotificationTypeIcon(notification.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatScheduledTime(notification.scheduledTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getNotificationTypeLabel(notification.type)}
                    </Badge>
                    {notification.recurring !== 'none' && (
                      <Badge variant="secondary">
                        {notification.recurring === 'daily' ? 'يومي' : 'أسبوعي'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Tips Preview */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>نصائح الأسبوع {pregnancyWeek}</CardTitle>
            <CardDescription>
              نصائح مخصصة لأسبوع الحمل الحالي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getWeeklyTips().map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Checkups */}
      {isEnabled && getUpcomingCheckups().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الفحوصات المطلوبة</CardTitle>
            <CardDescription>
              الفحوصات الطبية المناسبة لأسبوع الحمل الحالي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getUpcomingCheckups().map((checkup, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{checkup}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};