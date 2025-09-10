import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { getAllAvailableWeeks } from '@/data/weeklyPregnancyData';

interface PregnancyTimelineProps {
  currentWeek: number;
  onWeekSelect: (week: number) => void;
}

const PregnancyTimeline: React.FC<PregnancyTimelineProps> = ({ 
  currentWeek, 
  onWeekSelect 
}) => {
  const availableWeeks = getAllAvailableWeeks();

  const getWeekStatus = (week: number) => {
    if (week < currentWeek) return 'completed';
    if (week === currentWeek) return 'current';
    return 'upcoming';
  };

  const getTrimesterInfo = (week: number) => {
    if (week <= 12) return { trimester: 1, name: 'الثلث الأول', color: 'red' };
    if (week <= 27) return { trimester: 2, name: 'الثلث الثاني', color: 'green' };
    return { trimester: 3, name: 'الثلث الثالث', color: 'blue' };
  };

  const groupWeeksByTrimester = () => {
    const groups: { [key: number]: number[] } = { 1: [], 2: [], 3: [] };
    availableWeeks.forEach(week => {
      const trimester = getTrimesterInfo(week).trimester;
      groups[trimester].push(week);
    });
    return groups;
  };

  const weekGroups = groupWeeksByTrimester();

  return (
    <div dir="rtl" className="text-right">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          رحلة الحمل الأسبوعية
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {[1, 2, 3].map((trimester) => {
          const weeks = weekGroups[trimester];
          if (weeks.length === 0) return null;
          
          const trimesterInfo = getTrimesterInfo(weeks[0]);
          
          return (
            <div key={trimester} className="space-y-3">
              {/* عنوان الثلث */}
              <div className="flex items-center gap-2">
                <Badge 
                  className={`bg-${trimesterInfo.color}-100 text-${trimesterInfo.color}-700 border-${trimesterInfo.color}-200 border`}
                  variant="secondary"
                >
                  {trimesterInfo.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({weeks.length} أسبوع متاح)
                </span>
              </div>

              {/* الأسابيع */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {weeks.map((week) => {
                  const status = getWeekStatus(week);
                  const isAvailable = availableWeeks.includes(week);
                  
                  return (
                    <Button
                      key={week}
                      variant={status === 'current' ? 'default' : 'outline'}
                      size="sm"
                      disabled={!isAvailable}
                      onClick={() => onWeekSelect(week)}
                      className={`
                        relative h-12 flex flex-col items-center justify-center
                        ${status === 'completed' 
                          ? `bg-${trimesterInfo.color}-100 border-${trimesterInfo.color}-300 text-${trimesterInfo.color}-700 hover:bg-${trimesterInfo.color}-200` 
                          : status === 'current' 
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/20' 
                          : 'hover:bg-muted'
                        }
                        ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {/* رقم الأسبوع */}
                      <span className="text-xs font-bold">{week}</span>
                      
                      {/* أيقونة الحالة */}
                      <div className="absolute top-1 left-1">
                        {status === 'completed' && isAvailable && (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        )}
                        {status === 'current' && (
                          <Clock className="w-3 h-3 text-white" />
                        )}
                      </div>
                      
                      {/* نقطة المحتوى المتاح */}
                      {isAvailable && (
                        <div className={`
                          absolute bottom-1 right-1/2 transform translate-x-1/2 
                          w-2 h-2 rounded-full
                          ${status === 'current' ? 'bg-white' : `bg-${trimesterInfo.color}-500`}
                        `} />
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* معلومات إضافية عن الثلث */}
              <div className={`
                bg-${trimesterInfo.color}-50 dark:bg-${trimesterInfo.color}-950/20 
                border border-${trimesterInfo.color}-200 dark:border-${trimesterInfo.color}-800
                rounded-lg p-3
              `}>
                <p className={`text-xs text-${trimesterInfo.color}-700 dark:text-${trimesterInfo.color}-300`}>
                  {trimester === 1 && "مرحلة تكوين الأعضاء الأساسية وبداية الرحلة"}
                  {trimester === 2 && "أجمل مرحلة في الحمل - طاقة عالية وحركة الطفل"}
                  {trimester === 3 && "المرحلة الأخيرة - نضج الطفل والاستعداد للولادة"}
                </p>
              </div>
            </div>
          );
        })}

        {/* إحصائيات سريعة */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">{availableWeeks.filter(w => w < currentWeek).length}</p>
              <p className="text-xs text-purple-600">أسبوع مكتمل</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">{currentWeek}</p>
              <p className="text-xs text-pink-600">الأسبوع الحالي</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{40 - currentWeek}</p>
              <p className="text-xs text-blue-600">أسبوع متبقي</p>
            </div>
          </div>
        </div>

        {/* نصيحة التنقل */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            💡 اضغطي على أي أسبوع لتستكشفي محتواه المفصل
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default PregnancyTimeline;