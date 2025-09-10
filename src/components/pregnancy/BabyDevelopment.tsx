import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Baby, Heart, Brain, Ruler, Weight } from 'lucide-react';

interface BabyDevelopmentProps {
  development: {
    size: string;
    sizeComparison: string;
    weight: string;
    majorDevelopments: string[];
    organs: string[];
    abilities: string[];
  };
  week: number;
}

const BabyDevelopment: React.FC<BabyDevelopmentProps> = ({ development, week }) => {
  return (
    <div dir="rtl" className="text-right">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-600">
          <Baby className="w-5 h-5" />
          نمو طفلك - الأسبوع {week}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* الحجم والوزن */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Ruler className="w-6 h-6 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">الطول</p>
                <p className="text-lg font-bold text-pink-600">{development.size}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Weight className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">الوزن</p>
                <p className="text-lg font-bold text-purple-600">{development.weight}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 text-2xl">🍓</div>
              <div>
                <p className="text-sm text-muted-foreground">يشبه حجم</p>
                <p className="text-lg font-bold text-orange-600">{development.sizeComparison}</p>
              </div>
            </div>
          </div>
        </div>

        {/* التطورات الرئيسية */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            التطورات الرئيسية هذا الأسبوع
          </h4>
          <div className="grid gap-2">
            {development.majorDevelopments.map((dev, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-800"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{dev}</span>
              </div>
            ))}
          </div>
        </div>

        {/* الأعضاء المتطورة */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-500" />
            الأعضاء والأجهزة
          </h4>
          <div className="flex flex-wrap gap-2">
            {development.organs.map((organ, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200"
              >
                {organ}
              </Badge>
            ))}
          </div>
        </div>

        {/* القدرات الجديدة */}
        <div className="space-y-3">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <span className="text-lg">⭐</span>
            قدرات جديدة مذهلة
          </h4>
          <div className="space-y-2">
            {development.abilities.map((ability, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-md"
              >
                <span className="text-yellow-500 text-lg">✨</span>
                <span className="text-sm font-medium">{ability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* رسالة تشجيعية */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💚</span>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                معجزة الخلق تحدث الآن
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                طفلك الصغير ينمو بسرعة مذهلة! كل يوم يجلب تطوراً جديداً في رحلة الخلق العجيبة هذه.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default BabyDevelopment;