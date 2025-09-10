import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getAllAvailableWeeks, trimesterInfo } from '@/data/weeklyPregnancyData';

interface WeekNavigatorProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({ currentWeek, onWeekChange }) => {
  const availableWeeks = getAllAvailableWeeks();
  const currentTrimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;
  
  const canGoPrevious = currentWeek > Math.min(...availableWeeks);
  const canGoNext = currentWeek < Math.max(...availableWeeks);
  
  const handlePreviousWeek = () => {
    const currentIndex = availableWeeks.indexOf(currentWeek);
    if (currentIndex > 0) {
      onWeekChange(availableWeeks[currentIndex - 1]);
    }
  };
  
  const handleNextWeek = () => {
    const currentIndex = availableWeeks.indexOf(currentWeek);
    if (currentIndex < availableWeeks.length - 1) {
      onWeekChange(availableWeeks[currentIndex + 1]);
    }
  };

  const getTrimesterColor = (trimester: number) => {
    switch (trimester) {
      case 1: return "bg-red-100 text-red-700 border-red-200";
      case 2: return "bg-green-100 text-green-700 border-green-200";
      case 3: return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div dir="rtl" className="text-right">
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* معلومات الثلث الحالي */}
          <div className="text-center space-y-2">
            <Badge 
              className={`${getTrimesterColor(currentTrimester)} border`}
              variant="secondary"
            >
              {trimesterInfo[currentTrimester as keyof typeof trimesterInfo].name}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {trimesterInfo[currentTrimester as keyof typeof trimesterInfo].description}
            </p>
          </div>

          {/* التنقل بين الأسابيع */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              disabled={!canGoPrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              السابق
            </Button>

            <div className="text-center flex-1 mx-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-lg font-bold text-primary">الأسبوع {currentWeek}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                أسبوع {currentWeek} من 40 أسبوع
              </p>
              
              {/* شريط التقدم */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentWeek / 40) * 100}%` }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              التالي
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* اختيار سريع للأسابيع */}
          <div className="flex flex-wrap gap-2 justify-center">
            {availableWeeks.map((week) => (
              <Button
                key={week}
                variant={week === currentWeek ? "default" : "outline"}
                size="sm"
                onClick={() => onWeekChange(week)}
                className={`w-10 h-8 text-xs ${
                  week === currentWeek 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-primary/10'
                }`}
              >
                {week}
              </Button>
            ))}
          </div>

          {/* معلومات إضافية عن الأسبوع */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3 border border-primary/10">
            <div className="text-center">
              <p className="text-sm font-medium text-primary mb-1">
                {currentWeek <= 12 
                  ? `${13 - currentWeek} أسبوع متبقي للثلث الثاني`
                  : currentWeek <= 27 
                  ? `${28 - currentWeek} أسبوع متبقي للثلث الثالث`
                  : `${41 - currentWeek} أسبوع متبقي للولادة`}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentWeek <= 12 
                  ? "مرحلة تكوين الأعضاء الأساسية"
                  : currentWeek <= 27 
                  ? "مرحلة النمو والطاقة"
                  : "مرحلة النضج والاستعداد للولادة"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default WeekNavigator;