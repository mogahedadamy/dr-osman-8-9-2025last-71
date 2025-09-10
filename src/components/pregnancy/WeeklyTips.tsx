import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Dumbbell, Heart, Star } from 'lucide-react';

interface WeeklyTipsProps {
  tips: {
    nutrition: string[];
    exercise: string[];
    lifestyle: string[];
    preparations: string[];
  };
  week: number;
}

const WeeklyTips: React.FC<WeeklyTipsProps> = ({ tips, week }) => {
  return (
    <div dir="rtl" className="text-right">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-600">
          <Star className="w-5 h-5" />
          نصائح الأسبوع {week}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nutrition" className="text-xs">
              <Apple className="w-4 h-4 ml-1" />
              تغذية
            </TabsTrigger>
            <TabsTrigger value="exercise" className="text-xs">
              <Dumbbell className="w-4 h-4 ml-1" />
              رياضة
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-xs">
              <Heart className="w-4 h-4 ml-1" />
              نمط حياة
            </TabsTrigger>
            <TabsTrigger value="preparations" className="text-xs">
              <Star className="w-4 h-4 ml-1" />
              تحضيرات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="mt-4 space-y-3">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                <Apple className="w-4 h-4" />
                نصائح التغذية
              </h4>
              <div className="space-y-2">
                {tips.nutrition.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">🥗</span>
                    <p className="text-sm text-green-700 dark:text-green-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exercise" className="mt-4 space-y-3">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                الرياضة والنشاط
              </h4>
              <div className="space-y-2">
                {tips.exercise.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">🏃‍♀️</span>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-4 space-y-3">
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                نمط الحياة الصحي
              </h4>
              <div className="space-y-2">
                {tips.lifestyle.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">💖</span>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preparations" className="mt-4 space-y-3">
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                التحضيرات المهمة
              </h4>
              <div className="space-y-2">
                {tips.preparations.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-orange-500 mt-1">⭐</span>
                    <p className="text-sm text-orange-700 dark:text-orange-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* نصيحة خاصة من د.عثمان */}
        <div className="mt-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-rose-200 dark:border-rose-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">👨‍⚕️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                نصيحة د.عثمان الأسبوعية
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {week <= 12 
                  ? "في الثلث الأول، الصبر هو مفتاح النجاح. جسمك يعمل بجد لبناء المعجزة الصغيرة، فلا تقسي على نفسك."
                  : week <= 28 
                  ? "استمتعي بهذه الفترة الذهبية! طاقتك عادت وطفلك ينمو بقوة. وقت مثالي للتحضير والاستعداد."
                  : "المرحلة الأخيرة تتطلب صبر وحكمة. طفلك يستعد للخروج للعالم، وأنت تستعدين لتصبحي أماً رائعة."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default WeeklyTips;