import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePregnancyTracking } from "@/hooks/usePregnancyTracking";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Baby, Heart, Star, Crown, Lock } from "lucide-react";

const WeeklyTipsCard = () => {
  const { currentWeek, getTrimesterInfo } = usePregnancyTracking();
  const { isPremium, canAccessContent } = useAuth();
  const trimesterInfo = getTrimesterInfo();

  // نصائح أسبوعية مبنية على الأسبوع الحالي
  const getWeeklyTips = (week: number) => {
    const tips = {
      free: [],
      premium: []
    };

    if (week <= 12) {
      // الثلث الأول
      tips.free = [
        "تناولي حمض الفوليك يومياً",
        "تجنبي الكافيين والكحول",
        "اشربي كمية كافية من الماء"
      ];
      tips.premium = [
        "خطة غذائية متخصصة للثلث الأول",
        "تمارين آمنة للحمل المبكر",
        "مكملات غذائية موصى بها طبياً"
      ];
    } else if (week <= 26) {
      // الثلث الثاني  
      tips.free = [
        "ابدئي في ممارسة التمارين المناسبة",
        "اهتمي بتناول الكالسيوم",
        "راقبي زيادة الوزن"
      ];
      tips.premium = [
        "برنامج تمارين مخصص للثلث الثاني",
        "نصائح للتعامل مع تغيرات الجسم",
        "خطة للتحضير للولادة"
      ];
    } else {
      // الثلث الثالث
      tips.free = [
        "احضري حقيبة المستشفى",
        "مارسي تمارين التنفس",
        "احصلي على راحة كافية"
      ];
      tips.premium = [
        "دليل شامل للتحضير للولادة",
        "تقنيات إدارة الألم المتقدمة",
        "خطة ما بعد الولادة"
      ];
    }

    return tips;
  };

  const weeklyTips = getWeeklyTips(currentWeek);

  return (
    <Card className="shadow-card bg-gradient-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="text-2xl">{trimesterInfo.emoji}</div>
            <div>
              <h3 className="text-lg font-bold">نصائح الأسبوع {currentWeek}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {trimesterInfo.name} ({trimesterInfo.weeks})
              </p>
            </div>
          </CardTitle>
          <Badge className={trimesterInfo.color}>
            {trimesterInfo.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* نصائح مجانية */}
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-wellness" />
            نصائح أساسية
          </h4>
          <div className="space-y-2">
            {weeklyTips.free.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-wellness rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* نصائح مدفوعة */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            نصائح متقدمة
            {!isPremium() && <Lock className="w-3 h-3 text-muted-foreground" />}
          </h4>
          
          {isPremium() ? (
            <div className="space-y-2">
              {weeklyTips.premium.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="text-sm text-primary font-medium mb-2">
                احصلي على نصائح متخصصة أكثر
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                نصائح طبية متقدمة، خطط غذائية، وتمارين مخصصة لحملك
              </div>
              <Link to="/premium-access">
                <Button size="sm" className="w-full">
                  <Crown className="w-3 h-3 mr-2" />
                  اشتراك مدفوع
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* رابط للمزيد */}
        <div className="border-t pt-4">
          <Link to="/tips">
            <Button variant="outline" className="w-full" size="sm">
              <Star className="w-4 h-4 mr-2" />
              عرض جميع النصائح
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyTipsCard;