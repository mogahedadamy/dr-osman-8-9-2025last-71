import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Baby, ArrowLeft, Calendar, Clock } from "lucide-react";
import { useCurrentWeek } from "@/hooks/useCurrentWeek";
import { getWeeklyData } from "@/data/weeklyPregnancyData";

const WeekByWeekCard = () => {
  const { selectedWeek, trimesterInfo, pregnancyProgress } = useCurrentWeek();
  const weekData = getWeeklyData(selectedWeek);

  if (!weekData) {
    return null;
  }

  return (
    <Card className="shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold">دليل الحمل الأسبوعي</h3>
              <p className="text-sm text-muted-foreground font-normal">
                الأسبوع {selectedWeek} - {weekData.title}
              </p>
            </div>
          </CardTitle>
          <Badge className={`${
            trimesterInfo.color === 'red' ? 'bg-red-100 text-red-700 border-red-200' : 
            trimesterInfo.color === 'green' ? 'bg-green-100 text-green-700 border-green-200' : 
            'bg-blue-100 text-blue-700 border-blue-200'
          } border`}>
            {trimesterInfo.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* تطور الطفل */}
        <div className="bg-primary/10 rounded-xl p-4">
          <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <Baby className="w-4 h-4" />
            تطور طفلك
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {weekData.babyDevelopment.size && (
              <span className="font-medium">الحجم: {weekData.babyDevelopment.size}</span>
            )}
          </p>
          {weekData.babyDevelopment.majorDevelopments && weekData.babyDevelopment.majorDevelopments.length > 0 && (
            <div className="mt-2">
              <div className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground">
                  {weekData.babyDevelopment.majorDevelopments[0]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* تغيرات الأم */}
        {weekData.motherChanges.symptoms && weekData.motherChanges.symptoms.length > 0 && (
          <div className="bg-secondary/10 rounded-xl p-4">
            <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              تغيرات في جسمك
            </h4>
            <div className="flex items-start gap-2 text-sm">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-muted-foreground">
                {weekData.motherChanges.symptoms[0]}
              </span>
            </div>
          </div>
        )}

        {/* معلومات مهمة */}
        {(weekData.checkups || weekData.tests) && (
          <div className="bg-wellness/10 rounded-xl p-4">
            <h4 className="font-semibold text-wellness mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              معلومات مهمة
            </h4>
            {weekData.checkups && weekData.checkups.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-wellness rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground">
                  {weekData.checkups[0]}
                </span>
              </div>
            )}
          </div>
        )}

        {/* شريط التقدم */}
        <div className="bg-background/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">تقدم الحمل</span>
            <span className="text-sm text-primary font-bold">{Math.round(pregnancyProgress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${pregnancyProgress}%` }}
            ></div>
          </div>
        </div>

        {/* رابط للمزيد */}
        <Link to={`/weekly-pregnancy?week=${selectedWeek}`}>
          <Button className="w-full bg-primary hover:bg-primary/90">
            <span>عرض التفاصيل الكاملة</span>
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default WeekByWeekCard;