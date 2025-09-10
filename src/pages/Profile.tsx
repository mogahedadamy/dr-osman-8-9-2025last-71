import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, User, Baby, Heart, Settings, Activity, Smile, Crown, LogOut, Edit3 } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import PremiumPrompt from "@/components/shared/PremiumPrompt";
import { AnimatedPage, FadeIn, ScaleIn, AnimatedList, AnimatedListItem } from "@/components/mobile/AnimatedPage";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import { useToast } from "@/hooks/use-toast";
import { useDailyLogs } from "@/hooks/useDailyLogs";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancyTracking } from "@/hooks/usePregnancyTracking";
import { useUserProfile } from "@/hooks/useLocalStorage";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logs, getTodayLog, getAverageStats } = useDailyLogs();
  const { currentUser, isAuthenticated, isPremium, getDaysLeft, logout } = useAuth();
  const { currentWeek, pregnancyInfo, getTrimesterInfo } = usePregnancyTracking();
  const { profile, loading, saveProfile } = useUserProfile();
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    lastPeriod: "",
    dueDate: "",
    currentWeek: currentWeek,
    babyName: "لم يتم اختياره بعد",
    doctorName: "لم يتم تحديده",
    hospitalName: "لم يتم تحديده",
    emergencyContact: ""
  });

  const trimesterInfo = getTrimesterInfo();
  const daysLeft = getDaysLeft();

  const [isEditing, setIsEditing] = useState(false);
  const [healthStats, setHealthStats] = useState(getAverageStats(7));

  // تحميل البيانات من قاعدة البيانات المحلية أو البيانات الافتراضية
  useEffect(() => {
    if (!loading) {
      const savedData = profile || {};
      setProfileData({
        name: savedData.name || currentUser?.fullName || "ضيف",
        email: savedData.email || currentUser?.email || "",
        phone: savedData.phone || currentUser?.phoneNumber || "",
        lastPeriod: savedData.lastPeriod || pregnancyInfo?.lastPeriodDate || "",
        dueDate: savedData.dueDate || pregnancyInfo?.dueDate || "",
        currentWeek: currentWeek,
        babyName: savedData.babyName || "لم يتم اختياره بعد",
        doctorName: savedData.doctorName || "لم يتم تحديده",
        hospitalName: savedData.hospitalName || "لم يتم تحديده",
        emergencyContact: savedData.emergencyContact || ""
      });
    }
  }, [loading, profile, currentUser, pregnancyInfo, currentWeek]);

  useEffect(() => {
    setHealthStats(getAverageStats(7));
  }, [logs, getAverageStats]);

  const handleSave = async () => {
    try {
      await saveProfile(profileData);
      
      // للمستخدمين المدفوعين، حفظ في قاعدة البيانات أيضاً
      if (currentUser && (isPremium() || currentUser.type === 'admin')) {
        // هنا يمكن إضافة كود للحفظ في Supabase مستقبلاً
        console.log('حفظ بيانات المستخدم المدفوع في قاعدة البيانات:', profileData);
      }
      
      setIsEditing(false);
      
      const saveMethod = (isPremium() || (currentUser && currentUser.type === 'admin')) 
        ? "محلياً وفي قاعدة البيانات" 
        : "محلياً";
        
      toast({
        title: "تم حفظ البيانات ✅",
        description: `تم تحديث ملفك الشخصي بنجاح وحفظه ${saveMethod}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const calculateWeeksRemaining = () => {
    if (!pregnancyInfo?.dueDate) return 0;
    const due = new Date(pregnancyInfo.dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(0, diffWeeks);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <MobileLayout>
      <AnimatedPage>
        {/* Mobile Header */}
        <MobileHeader 
          title="الملف الشخصي"
          subtitle="معلوماتك الشخصية"
          showBackButton={true}
          onBack={() => navigate(-1)}
          actions={
            <div className="flex gap-2">
              {isAuthenticated && (
                <TouchFeedback>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="w-10 h-10 p-0 touch-target"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TouchFeedback>
              )}
              <TouchFeedback>
                <Button 
                  variant={isEditing ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-10 h-10 p-0 touch-target"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </TouchFeedback>
            </div>
          }
        />

        <div className="px-4 py-6 space-y-6">
          {/* User Status Card */}
          <FadeIn delay={0.1}>
            {!isAuthenticated ? (
              <Card className="shadow-card bg-gradient-secondary border-2 border-secondary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold text-foreground mb-2">👋 مرحباً بالضيف</h3>
                  <p className="text-muted-foreground mb-4">سجلي دخولك أو احصلي على اشتراك للحصول على ملف شخصي كامل</p>
                  <div className="flex gap-3 justify-center">
                    <TouchFeedback>
                      <Link to="/login">
                        <Button variant="outline" size="sm" className="touch-target">تسجيل دخول</Button>
                      </Link>
                    </TouchFeedback>
                    <TouchFeedback>
                      <Link to="/premium-access">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 touch-target">اشتراك مدفوع</Button>
                      </Link>
                    </TouchFeedback>
                  </div>
                </CardContent>
              </Card>
            ) : isPremium() ? (
              <Card className="shadow-card bg-gradient-primary border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                    <div>
                      <h3 className="font-bold text-primary-foreground">عضوة مدفوعة</h3>
                      <p className="text-sm text-primary-foreground/80">
                        {daysLeft ? `${daysLeft} يوم متبقي في الاشتراك` : 'اشتراك نشط'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PremiumPrompt 
                message="تقارير تطور شاملة ومتابعة دقيقة"
                description="احصلي على تقارير مفصلة وتحليل شامل لتطور الحمل"
              />
            )}
          </FadeIn>
          
          {/* Profile Header */}
          <ScaleIn delay={0.2}>
            <TouchFeedback>
              <Card className="shadow-card bg-gradient-card hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      {isEditing ? (
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="text-lg font-semibold mb-2"
                        />
                      ) : (
                        <h2 className="text-xl font-bold text-foreground">{profileData.name}</h2>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Baby className="w-4 h-4" />
                        <span>الأسبوع {profileData.currentWeek} من الحمل</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {calculateWeeksRemaining()} أسبوع متبقي
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TouchFeedback>
          </ScaleIn>

          {/* Pregnancy Info */}
          <FadeIn delay={0.3}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  معلومات الحمل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">آخر دورة شهرية</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={profileData.lastPeriod}
                        onChange={(e) => setProfileData({...profileData, lastPeriod: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium mt-1">{new Date(profileData.lastPeriod).toLocaleDateString('ar')}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">تاريخ الولادة المتوقع</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={profileData.dueDate}
                        onChange={(e) => setProfileData({...profileData, dueDate: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium mt-1">{new Date(profileData.dueDate).toLocaleDateString('ar')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">اسم الطفل المختار</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.babyName}
                      onChange={(e) => setProfileData({...profileData, babyName: e.target.value})}
                      placeholder="اختر اسماً جميلاً"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium mt-1">{profileData.babyName || "لم يتم الاختيار بعد"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

        {/* Health Summary from Daily Logs */}
        <Card className="shadow-card bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-wellness" />
              ملخص الحالة الصحية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Smile className="w-5 h-5 text-wellness" />
                </div>
                <div className="text-2xl font-bold text-wellness">
                  {healthStats.avgMood > 0 ? healthStats.avgMood.toFixed(1) : "--"}
                </div>
                <div className="text-xs text-muted-foreground">المزاج</div>
                <Progress 
                  value={healthStats.avgMood * (100/7)} 
                  className="h-2 mt-1" 
                />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-secondary">
                  {healthStats.avgEnergy > 0 ? healthStats.avgEnergy.toFixed(1) : "--"}
                </div>
                <div className="text-xs text-muted-foreground">الطاقة</div>
                <Progress 
                  value={healthStats.avgEnergy * 10} 
                  className="h-2 mt-1" 
                />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="text-2xl font-bold text-accent">{logs.length}</div>
                <div className="text-xs text-muted-foreground">تسجيل</div>
                <Progress 
                  value={Math.min(logs.length * 10, 100)} 
                  className="h-2 mt-1" 
                />
              </div>
            </div>
            
            {getTodayLog() && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <div className="text-sm font-medium text-primary">تسجيل اليوم</div>
                <div className="text-xs text-muted-foreground mt-1">
                  الوزن: {getTodayLog()?.weight} كيلو - 
                  المزاج: {getTodayLog()?.mood}/7 - 
                  الطاقة: {getTodayLog()?.energy}/10
                </div>
                {getTodayLog()?.symptoms && getTodayLog()!.symptoms.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    الأعراض: {getTodayLog()!.symptoms.join(', ')}
                  </div>
                )}
              </div>
            )}
            
            {!getTodayLog() && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  لم تسجلي حالتك اليوم بعد
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  اضغطي على "تسجيل الحالة" لمتابعة تطور حملك
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>معلومات الاتصال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              ) : (
                <p className="font-medium">{profileData.email}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">رقم الهاتف</Label>
              {isEditing ? (
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              ) : (
                <p className="font-medium">{profileData.phone}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">جهة الاتصال في الطوارئ</Label>
              {isEditing ? (
                <Input
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                />
              ) : (
                <p className="font-medium">{profileData.emergencyContact}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>المعلومات الطبية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">اسم الطبيب</Label>
              {isEditing ? (
                <Input
                  value={profileData.doctorName}
                  onChange={(e) => setProfileData({...profileData, doctorName: e.target.value})}
                />
              ) : (
                <p className="font-medium">{profileData.doctorName}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">المستشفى</Label>
              {isEditing ? (
                <Input
                  value={profileData.hospitalName}
                  onChange={(e) => setProfileData({...profileData, hospitalName: e.target.value})}
                />
              ) : (
                <p className="font-medium">{profileData.hospitalName}</p>
              )}
            </div>
          </CardContent>
        </Card>

          {/* Save Button */}
          {isEditing && (
            <ScaleIn delay={0.6}>
              <TouchFeedback>
                <Button 
                  onClick={handleSave}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-semibold shadow-button touch-target"
                >
                  حفظ التغييرات
                </Button>
              </TouchFeedback>
            </ScaleIn>
          )}
        </div>
      </AnimatedPage>
    </MobileLayout>
  );
};

export default Profile;