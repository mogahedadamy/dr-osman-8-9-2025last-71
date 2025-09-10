import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Activity, User } from 'lucide-react';

interface MotherChangesProps {
  changes: {
    physicalChanges: string[];
    emotionalChanges: string[];
    symptoms: string[];
    bodyChanges: string[];
  };
  week: number;
}

const MotherChanges: React.FC<MotherChangesProps> = ({ changes, week }) => {
  return (
    <div dir="rtl" className="text-right">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-600">
          <User className="w-5 h-5" />
          التغييرات في جسمك - الأسبوع {week}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* التغييرات الجسدية */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            التغييرات الجسدية
          </h4>
          <div className="grid gap-2">
            {changes.physicalChanges.map((change, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-800"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* التغييرات العاطفية */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-500" />
            التغييرات العاطفية والنفسية
          </h4>
          <div className="grid gap-2">
            {changes.emotionalChanges.map((change, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-800"
              >
                <span className="text-indigo-500 text-lg">🧠</span>
                <span className="text-sm">{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* الأعراض الحالية */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            الأعراض المتوقعة
          </h4>
          <div className="flex flex-wrap gap-2">
            {changes.symptoms.map((symptom, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border-pink-200"
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </div>

        {/* تغييرات الجسم الداخلية */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <span className="text-lg">🔄</span>
            ما يحدث داخل جسمك
          </h4>
          <div className="space-y-2">
            {changes.bodyChanges.map((change, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-800"
              >
                <span className="text-orange-500 text-lg">⚡</span>
                <span className="text-sm font-medium">{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* نصيحة أسبوعية للأم */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💝</span>
            <div>
              <p className="text-sm font-medium text-violet-700 dark:text-violet-300 mb-1">
                تذكري دائماً
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                جسمك يقوم بعمل مذهل! كل تغيير تشعرين به هو دليل على أن طفلك ينمو بصحة وقوة. 
                استمعي لجسمك واطلبي المساعدة عند الحاجة.
              </p>
            </div>
          </div>
        </div>

        {/* مؤشر الراحة الأسبوعي */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">مستوى الراحة المتوقع</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= (week <= 12 ? 2 : week <= 28 ? 4 : 3)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {week <= 12 
              ? "الثلث الأول: قد تشعرين بتعب وغثيان - هذا طبيعي تماماً!"
              : week <= 28 
              ? "الثلث الثاني: أجمل فترة في الحمل - استمتعي بها!"
              : "الثلث الثالث: جسمك يعمل بجد للتحضير للولادة"}
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default MotherChanges;