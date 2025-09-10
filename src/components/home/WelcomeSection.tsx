import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, Heart, TrendingUp, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancyTracking } from "@/hooks/usePregnancyTracking";
import { useUserProfile } from "@/hooks/useLocalStorage";
import heroImage from "@/assets/hero-pregnant-woman.jpg";

const WelcomeSection = () => {
  const { currentUser, isAuthenticated, isPremium } = useAuth();
  const { currentWeek, getDaysUntilDueDate, getProgressPercentage, getTrimesterInfo } = usePregnancyTracking();
  const { profile, loading } = useUserProfile();
  
  // استخدام البيانات المحفوظة إذا كانت متاحة
  const userName = profile?.name || currentUser?.fullName || 'أمي العزيزة';
  const savedDueDate = profile?.dueDate;
  const savedLastPeriod = profile?.lastPeriod;
  
  // حساب الأسابيع والأيام المتبقية من البيانات المحفوظة
  let calculatedWeek = currentWeek;
  let calculatedDaysLeft = getDaysUntilDueDate();
  let calculatedProgress = getProgressPercentage();
  
  if (savedLastPeriod) {
    const lastPeriod = new Date(savedLastPeriod);
    const now = new Date();
    const diffTime = now.getTime() - lastPeriod.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    calculatedWeek = Math.max(0, Math.min(40, diffWeeks));
  }
  
  if (savedDueDate) {
    const dueDate = new Date(savedDueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    calculatedDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    calculatedProgress = Math.min(100, Math.max(0, ((40 - (calculatedDaysLeft / 7)) / 40) * 100));
  }
  
  const trimesterInfo = getTrimesterInfo();

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Welcome Card */}
      <Card className="shadow-card mb-6 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-0">
          <div className="relative">
            <img 
              src={heroImage} 
              alt="امرأة حامل سعيدة" 
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">
                  أسبوع {calculatedWeek} - {trimesterInfo.name}
                </span>
              </div>
              <h2 className="text-xl font-bold leading-tight">
                🩷 أهلاً بك في رفيق الحمل الذكي {userName}
              </h2>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {calculatedWeek > 0 ? (
                <>د. عثمان يتابع رحلتك: طفلك ينمو بصحة في {trimesterInfo.description}. </>
              ) : null}
              {isAuthenticated ? 'كيف تشعرين اليوم؟' : 'Osman Pregnancy companion - رعاية متخصصة لك ولطفلك'}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-primary/10 rounded-xl">
                <div className="icon-3d icon-3d-primary p-2 rounded-lg mx-auto w-fit mb-2">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-lg font-bold text-primary">{calculatedWeek}</div>
                <div className="text-xs text-muted-foreground">أسبوع</div>
              </div>
              <div className="text-center p-3 bg-wellness/10 rounded-xl">
                <div className="icon-3d icon-3d-wellness p-2 rounded-lg mx-auto w-fit mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-lg font-bold text-wellness">
                  {Math.round(calculatedProgress)}%
                </div>
                <div className="text-xs text-muted-foreground">مكتمل</div>
              </div>
              <div className="text-center p-3 bg-secondary/10 rounded-xl">
                <div className="icon-3d icon-3d-secondary p-2 rounded-lg mx-auto w-fit mb-2">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-lg font-bold text-secondary">
                  {calculatedDaysLeft || '--'}
                </div>
                <div className="text-xs text-muted-foreground">يوم متبقي</div>
              </div>
            </div>

            {/* Primary Action - Most Important */}
            <div className="mb-3">
              <Link to="/daily-log" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-button text-sm py-3 font-semibold">
                  📝 تسجيل اليوم
                  <span className="text-xs opacity-90 block">سجلي حالتك اليومية</span>
                </Button>
              </Link>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/calendar" className="block">
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-button text-sm py-3 flex flex-col items-center gap-1">
                  <div className="icon-3d icon-3d-wellness p-2 rounded-lg">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  حجز موعد
                </Button>
              </Link>
              <Link to="/chat" className="block">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 text-sm py-3">
                  🤖 اسألي سؤال
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Badge */}
      {isPremium() && (
        <div className="flex justify-center mb-4">
          <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1">
            ✨ عضوية مميزة نشطة
          </Badge>
        </div>
      )}
    </div>
  );
};

export default WelcomeSection;