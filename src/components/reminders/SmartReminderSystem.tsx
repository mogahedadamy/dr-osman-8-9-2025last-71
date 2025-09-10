import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, Settings, Plus, Clock, Heart, Brain, 
  Stethoscope, BookOpen, AlertTriangle, Calendar,
  Volume2, VolumeX, Check, Trash2, Edit
} from "lucide-react";
import { useSmartNotifications, ScheduledNotification, NotificationSettings } from '@/hooks/useSmartNotifications';
import { usePregnancyTracking } from '@/hooks/usePregnancyTracking';
import { AnimatedList, AnimatedListItem, FadeIn } from '@/components/mobile/AnimatedPage';
import TouchFeedback from '@/components/mobile/TouchFeedback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SmartReminderSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartReminderSystem: React.FC<SmartReminderSystemProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    scheduledNotifications,
    updateSettings,
    createCustomNotification,
    snoozeNotification,
    acknowledgeNotification,
    deleteNotification,
    getNotificationStats
  } = useSmartNotifications();

  const { currentWeek } = usePregnancyTracking();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'history'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customReminder, setCustomReminder] = useState({
    title: '',
    body: '',
    date: '',
    time: '',
    type: 'wellness' as ScheduledNotification['type'],
    priority: 'medium' as ScheduledNotification['priority']
  });

  const stats = getNotificationStats();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Stethoscope className="w-4 h-4" />;
      case 'wellness': return <Heart className="w-4 h-4" />;
      case 'educational': return <BookOpen className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-blue-100 text-blue-700';
      case 'wellness': return 'bg-green-100 text-green-700';
      case 'educational': return 'bg-purple-100 text-purple-700';
      case 'emergency': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateCustomReminder = () => {
    if (!customReminder.title || !customReminder.body || !customReminder.date || !customReminder.time) {
      return;
    }

    const scheduledTime = new Date(`${customReminder.date}T${customReminder.time}`);
    createCustomNotification(
      customReminder.title,
      customReminder.body,
      scheduledTime,
      customReminder.type,
      customReminder.priority
    );

    setCustomReminder({
      title: '',
      body: '',
      date: '',
      time: '',
      type: 'wellness',
      priority: 'medium'
    });
    setShowCreateModal(false);
  };

  const upcomingNotifications = scheduledNotifications
    .filter(n => !n.sent && n.scheduledTime > new Date())
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
    .slice(0, 5);

  const recentNotifications = scheduledNotifications
    .filter(n => n.sent)
    .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
    .slice(0, 10);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Bell className="w-6 h-6" />
            نظام التذكيرات الذكية
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                لوحة التحكم
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                الإعدادات
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                السجل
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="dashboard" className="space-y-6 mt-0">
                <FadeIn>
                  {/* إحصائيات سريعة */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground">قادمة</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                        <div className="text-sm text-muted-foreground">مُرسلة</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.acknowledged}</div>
                        <div className="text-sm text-muted-foreground">مؤكدة</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
                        <div className="text-sm text-muted-foreground">متأخرة</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* معدل الاستجابة */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">معدل الاستجابة للتذكيرات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>معدل التأكيد</span>
                          <span>{stats.acknowledgeRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={stats.acknowledgeRate} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* التذكيرات القادمة */}
                  <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">التذكيرات القادمة</CardTitle>
                      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                        <DialogTrigger asChild>
                          <TouchFeedback>
                            <Button size="sm" className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              إضافة تذكير
                            </Button>
                          </TouchFeedback>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>إنشاء تذكير مخصص</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="title">العنوان</Label>
                              <Input
                                id="title"
                                value={customReminder.title}
                                onChange={(e) => setCustomReminder(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="مثال: موعد طبي مهم"
                              />
                            </div>
                            <div>
                              <Label htmlFor="body">الرسالة</Label>
                              <Textarea
                                id="body"
                                value={customReminder.body}
                                onChange={(e) => setCustomReminder(prev => ({ ...prev, body: e.target.value }))}
                                placeholder="مثال: لا تنسي موعدك مع الطبيب اليوم في الساعة 3 مساءً"
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="date">التاريخ</Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={customReminder.date}
                                  onChange={(e) => setCustomReminder(prev => ({ ...prev, date: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="time">الوقت</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={customReminder.time}
                                  onChange={(e) => setCustomReminder(prev => ({ ...prev, time: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="type">النوع</Label>
                                <Select value={customReminder.type} onValueChange={(value: any) => setCustomReminder(prev => ({ ...prev, type: value }))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="medical">طبي</SelectItem>
                                    <SelectItem value="wellness">صحة وعافية</SelectItem>
                                    <SelectItem value="educational">تعليمي</SelectItem>
                                    <SelectItem value="emergency">طارئ</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="priority">الأولوية</Label>
                                <Select value={customReminder.priority} onValueChange={(value: any) => setCustomReminder(prev => ({ ...prev, priority: value }))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">منخفضة</SelectItem>
                                    <SelectItem value="medium">متوسطة</SelectItem>
                                    <SelectItem value="high">عالية</SelectItem>
                                    <SelectItem value="urgent">عاجلة</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleCreateCustomReminder} className="flex-1">
                                إنشاء التذكير
                              </Button>
                              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {upcomingNotifications.length > 0 ? (
                        <AnimatedList className="space-y-3">
                          {upcomingNotifications.map((notification) => (
                            <AnimatedListItem key={notification.id}>
                              <Card className="border-l-4" style={{ borderLeftColor: getPriorityColor(notification.priority) }}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getTypeIcon(notification.type)}
                                        <Badge className={getTypeColor(notification.type)}>
                                          {notification.type === 'medical' ? 'طبي' : 
                                           notification.type === 'wellness' ? 'عافية' :
                                           notification.type === 'educational' ? 'تعليمي' : 'طارئ'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          الأسبوع {notification.week}
                                        </Badge>
                                      </div>
                                      <h4 className="font-medium mb-1">{notification.title}</h4>
                                      <p className="text-sm text-muted-foreground mb-2">{notification.body}</p>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(notification.scheduledTime)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatTime(notification.scheduledTime)}
                                        </span>
                                      </div>
                                    </div>
                                    <TouchFeedback>
                                      <Button
                                        variant="outline"
                                        size="sm" 
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TouchFeedback>
                                  </div>
                                </CardContent>
                              </Card>
                            </AnimatedListItem>
                          ))}
                        </AnimatedList>
                      ) : (
                        <div className="text-center py-8">
                          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="font-medium mb-1">لا توجد تذكيرات قادمة</h3>
                          <p className="text-sm text-muted-foreground">جميع التذكيرات محدثة!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0">
                <FadeIn>
                  {/* إعدادات عامة */}
                  <Card>
                    <CardHeader>
                      <CardTitle>الإعدادات العامة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">تفعيل الإشعارات</h4>
                          <p className="text-sm text-muted-foreground">تفعيل أو إيقاف جميع الإشعارات</p>
                        </div>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                        />
                      </div>

                      <Separator />

                      {/* أوقات الإشعارات */}
                      <div className="space-y-4">
                        <h4 className="font-medium">أوقات الإشعارات</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="morning">الصباح</Label>
                            <Input
                              id="morning"
                              type="time"
                              value={settings.timing.morningTime}
                              onChange={(e) => updateSettings({
                                timing: { ...settings.timing, morningTime: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="afternoon">بعد الظهر</Label>
                            <Input
                              id="afternoon"
                              type="time"
                              value={settings.timing.afternoonTime}
                              onChange={(e) => updateSettings({
                                timing: { ...settings.timing, afternoonTime: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="evening">المساء</Label>
                            <Input
                              id="evening"
                              type="time"
                              value={settings.timing.eveningTime}
                              onChange={(e) => updateSettings({
                                timing: { ...settings.timing, eveningTime: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* إعدادات التذكيرات الطبية */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        التذكيرات الطبية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>تفعيل التذكيرات الطبية</span>
                        <Switch
                          checked={settings.medicalReminders.enabled}
                          onCheckedChange={(checked) => updateSettings({
                            medicalReminders: { ...settings.medicalReminders, enabled: checked }
                          })}
                        />
                      </div>
                      {settings.medicalReminders.enabled && (
                        <div className="space-y-3 ml-4">
                          {[
                            { key: 'prenatalCheckups', label: 'مواعيد الفحص الطبي' },
                            { key: 'vitamins', label: 'الفيتامينات والمكملات' },
                            { key: 'medications', label: 'الأدوية' },
                            { key: 'tests', label: 'الفحوصات المخبرية' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm">{label}</span>
                              <Switch
                                checked={(settings.medicalReminders as any)[key]}
                                onCheckedChange={(checked) => updateSettings({
                                  medicalReminders: { 
                                    ...settings.medicalReminders, 
                                    [key]: checked 
                                  }
                                })}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* إعدادات الصحة والعافية */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        الصحة والعافية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>تفعيل تذكيرات العافية</span>
                        <Switch
                          checked={settings.wellnessReminders.enabled}
                          onCheckedChange={(checked) => updateSettings({
                            wellnessReminders: { ...settings.wellnessReminders, enabled: checked }
                          })}
                        />
                      </div>
                      {settings.wellnessReminders.enabled && (
                        <div className="space-y-3 ml-4">
                          {[
                            { key: 'exercise', label: 'التمارين الرياضية' },
                            { key: 'hydration', label: 'شرب الماء' },
                            { key: 'nutrition', label: 'التغذية الصحية' },
                            { key: 'rest', label: 'الراحة والاسترخاء' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm">{label}</span>
                              <Switch
                                checked={(settings.wellnessReminders as any)[key]}
                                onCheckedChange={(checked) => updateSettings({
                                  wellnessReminders: { 
                                    ...settings.wellnessReminders, 
                                    [key]: checked 
                                  }
                                })}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* إعدادات المحتوى التعليمي */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        المحتوى التعليمي
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>تفعيل المحتوى التعليمي</span>
                        <Switch
                          checked={settings.educationalContent.enabled}
                          onCheckedChange={(checked) => updateSettings({
                            educationalContent: { ...settings.educationalContent, enabled: checked }
                          })}
                        />
                      </div>
                      {settings.educationalContent.enabled && (
                        <div className="space-y-3 ml-4">
                          {[
                            { key: 'weeklyTips', label: 'النصائح الأسبوعية' },
                            { key: 'newArticles', label: 'المقالات الجديدة' },
                            { key: 'osmanTips', label: 'عثمانيات الحمل' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm">{label}</span>
                              <Switch
                                checked={(settings.educationalContent as any)[key]}
                                onCheckedChange={(checked) => updateSettings({
                                  educationalContent: { 
                                    ...settings.educationalContent, 
                                    [key]: checked 
                                  }
                                })}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-0">
                <FadeIn>
                  <Card>
                    <CardHeader>
                      <CardTitle>سجل التذكيرات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentNotifications.length > 0 ? (
                        <AnimatedList className="space-y-3">
                          {recentNotifications.map((notification) => (
                            <AnimatedListItem key={notification.id}>
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getTypeIcon(notification.type)}
                                    <Badge className={getTypeColor(notification.type)}>
                                      {notification.type === 'medical' ? 'طبي' : 
                                       notification.type === 'wellness' ? 'عافية' :
                                       notification.type === 'educational' ? 'تعليمي' : 'طارئ'}
                                    </Badge>
                                    {notification.acknowledged ? (
                                      <Badge variant="outline" className="text-green-600 border-green-600">
                                        <Check className="w-3 h-3 mr-1" />
                                        مؤكدة
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-600">
                                        غير مؤكدة
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                                  <p className="text-xs text-muted-foreground">{notification.body}</p>
                                  <div className="text-xs text-muted-foreground mt-2">
                                    {formatDate(notification.scheduledTime)} - {formatTime(notification.scheduledTime)}
                                  </div>
                                </div>
                                {!notification.acknowledged && (
                                  <TouchFeedback>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => acknowledgeNotification(notification.id)}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  </TouchFeedback>
                                )}
                              </div>
                            </AnimatedListItem>
                          ))}
                        </AnimatedList>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="font-medium mb-1">لا يوجد سجل تذكيرات</h3>
                          <p className="text-sm text-muted-foreground">سيظهر هنا سجل التذكيرات المرسلة</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartReminderSystem;