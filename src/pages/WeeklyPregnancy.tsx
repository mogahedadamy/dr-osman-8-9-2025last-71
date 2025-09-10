import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import { AnimatedPage, FadeIn, ScaleIn } from '@/components/mobile/AnimatedPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// المكونات المنفصلة
import BabyDevelopment from '@/components/pregnancy/BabyDevelopment';
import MotherChanges from '@/components/pregnancy/MotherChanges';
import WeeklyTips from '@/components/pregnancy/WeeklyTips';
import RedFlags from '@/components/pregnancy/RedFlags';
import WeekNavigator from '@/components/pregnancy/WeekNavigator';
import PregnancyTimeline from '@/components/pregnancy/PregnancyTimeline';

// البيانات والهوك المخصص
import { getWeeklyData, getAllAvailableWeeks } from '@/data/weeklyPregnancyData';
import { useCurrentWeek } from '@/hooks/useCurrentWeek';

// الأيقونات
import { 
  Baby, 
  Heart, 
  Lightbulb, 
  AlertTriangle, 
  Calendar,
  Clock,
  Settings,
  BookOpen
} from 'lucide-react';

const WeeklyPregnancy = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    selectedWeek, 
    setSelectedWeek, 
    currentWeek, 
    trimesterInfo, 
    pregnancyProgress,
    isPregnancyInfoSet,
    updatePregnancyInfo 
  } = useCurrentWeek();

  // أخذ الأسبوع من URL أو استخدام الافتراضي
  useEffect(() => {
    const weekFromUrl = searchParams.get('week');
    if (weekFromUrl) {
      const week = parseInt(weekFromUrl);
      if (week && week >= 1 && week <= 42) {
        setSelectedWeek(week);
      }
    }
  }, [searchParams, setSelectedWeek]);

  // تحديث URL عند تغيير الأسبوع
  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    setSearchParams({ week: week.toString() });
  };

  // الحصول على بيانات الأسبوع
  const weekData = getWeeklyData(selectedWeek);
  const availableWeeks = getAllAvailableWeeks();

  // إذا لم تكن هناك بيانات للأسبوع المحدد
  if (!weekData) {
    return (
      <MobileLayout>
        <div dir="rtl" className="text-right">
        <MobileHeader 
          title="دليل الحمل الأسبوعي" 
          showBackButton
        />
        
        <div className="flex-1 p-4 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-bold mb-2">محتوى الأسبوع {selectedWeek} قيد التحضير</h3>
              <p className="text-sm text-muted-foreground mb-4">
                نعمل على إعداد محتوى مفصل لهذا الأسبوع. 
                يمكنك تصفح الأسابيع المتاحة في الوقت الحالي.
              </p>
              
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">الأسابيع المتاحة:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableWeeks.map(week => (
                    <Button
                      key={week}
                      variant="outline"
                      size="sm"
                      onClick={() => handleWeekChange(week)}
                    >
                      {week}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div dir="rtl" className="text-right">
      <AnimatedPage>
        {/* الهيدر */}
        <FadeIn>
          <MobileHeader 
            title="دليل الحمل الأسبوعي" 
            subtitle={`${weekData.title} - الأسبوع ${selectedWeek}`}
            showBackButton
            actions={
              <div className="flex items-center gap-2">
                <Badge 
                  className={`
                    ${trimesterInfo.color === 'red' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                    ${trimesterInfo.color === 'green' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                    ${trimesterInfo.color === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                    border text-xs
                  `}
                  variant="secondary"
                >
                  {trimesterInfo.name}
                </Badge>
              </div>
            }
          />
        </FadeIn>

        <div className="flex-1 space-y-4 p-4">
          {/* تحذير إعداد معلومات الحمل */}
          {!isPregnancyInfoSet && (
            <FadeIn delay={0.05}>
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">اضبطي معلومات حملك للحصول على تجربة شخصية</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const lastPeriod = prompt('أدخلي تاريخ آخر دورة شهرية (YYYY-MM-DD)');
                        if (lastPeriod) {
                          updatePregnancyInfo(lastPeriod);
                        }
                      }}
                    >
                      إعداد الآن
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </FadeIn>
          )}

          {/* التنقل بين الأسابيع */}
          <FadeIn delay={0.1}>
            <WeekNavigator 
              currentWeek={selectedWeek}
              onWeekChange={handleWeekChange}
            />
          </FadeIn>

          {/* المحتوى الرئيسي */}
          <FadeIn delay={0.2}>
            <Tabs defaultValue="baby" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="baby" className="text-xs">
                  <Baby className="w-4 h-4 ml-1" />
                  الطفل
                </TabsTrigger>
                <TabsTrigger value="mother" className="text-xs">
                  <Heart className="w-4 h-4 ml-1" />
                  الأم
                </TabsTrigger>
                <TabsTrigger value="tips" className="text-xs">
                  <Lightbulb className="w-4 h-4 ml-1" />
                  نصائح
                </TabsTrigger>
                <TabsTrigger value="alerts" className="text-xs">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  تنبيهات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="baby" className="mt-4">
                <ScaleIn delay={0.1}>
                  <BabyDevelopment 
                    development={weekData.babyDevelopment}
                    week={selectedWeek}
                  />
                </ScaleIn>
              </TabsContent>

              <TabsContent value="mother" className="mt-4">
                <ScaleIn delay={0.1}>
                  <MotherChanges 
                    changes={weekData.motherChanges}
                    week={selectedWeek}
                  />
                </ScaleIn>
              </TabsContent>

              <TabsContent value="tips" className="mt-4">
                <ScaleIn delay={0.1}>
                  <WeeklyTips 
                    tips={weekData.weeklyTips}
                    week={selectedWeek}
                  />
                </ScaleIn>
              </TabsContent>

              <TabsContent value="alerts" className="mt-4">
                <ScaleIn delay={0.1}>
                  <RedFlags 
                    redFlags={weekData.redFlags}
                    week={selectedWeek}
                  />
                </ScaleIn>
              </TabsContent>
            </Tabs>
          </FadeIn>

          {/* الفحوصات والمعالم المهمة */}
          {(weekData.checkups || weekData.tests || weekData.milestones) && (
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                    معلومات مهمة هذا الأسبوع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {weekData.checkups && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        الفحوصات المطلوبة
                      </h4>
                      <div className="space-y-1">
                        {weekData.checkups.map((checkup, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {checkup}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {weekData.tests && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        التحاليل والفحوصات
                      </h4>
                      <div className="space-y-1">
                        {weekData.tests.map((test, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            {test}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {weekData.milestones && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span className="text-yellow-500">🌟</span>
                        معالم مهمة
                      </h4>
                      <div className="space-y-1">
                        {weekData.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-yellow-500">✨</span>
                            {milestone}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* الجدول الزمني للحمل */}
          <FadeIn delay={0.4}>
            <PregnancyTimeline 
              currentWeek={selectedWeek}
              onWeekSelect={handleWeekChange}
            />
          </FadeIn>

        </div>
      </AnimatedPage>
      </div>
    </MobileLayout>
  );
};

export default WeeklyPregnancy;