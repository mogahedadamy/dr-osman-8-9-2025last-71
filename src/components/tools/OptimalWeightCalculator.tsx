import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePregnancyTracking } from '@/hooks/usePregnancyTracking';
import { useToast } from '@/hooks/use-toast';
import { Scale, TrendingUp, Target, Heart } from 'lucide-react';

interface WeightData {
  week: number;
  actualWeight: number;
  optimalWeight: number;
  date: string;
}

export const OptimalWeightCalculator: React.FC = () => {
  const { pregnancyInfo, currentWeek } = usePregnancyTracking();
  const { toast } = useToast();
  
  const [prePregnancyWeight, setPrePregnancyWeight] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [weightData, setWeightData] = useState<WeightData[]>([]);

  // حساب BMI قبل الحمل
  const calculateBMI = (weight: number, height: number): number => {
    return weight / Math.pow(height / 100, 2);
  };

  // حساب الوزن المثالي حسب الأسبوع
  const calculateOptimalWeight = (week: number, preBMI: number): number => {
    let recommendedGain = 0;
    
    if (preBMI < 18.5) {
      // نحيف - يحتاج زيادة أكثر
      recommendedGain = week * 0.5; // 12.5-18 كيلو إجمالي
    } else if (preBMI >= 18.5 && preBMI < 25) {
      // وزن طبيعي
      recommendedGain = week * 0.4; // 11.5-16 كيلو إجمالي
    } else if (preBMI >= 25 && preBMI < 30) {
      // زيادة وزن
      recommendedGain = week * 0.3; // 7-11.5 كيلو إجمالي
    } else {
      // سمنة
      recommendedGain = week * 0.2; // 5-9 كيلو إجمالي
    }

    return prePregnancyWeight + recommendedGain;
  };

  // إضافة وزن جديد
  const addWeightEntry = () => {
    if (!prePregnancyWeight || !height || !currentWeight) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const preBMI = calculateBMI(prePregnancyWeight, height);
    const optimalWeight = calculateOptimalWeight(currentWeek, preBMI);

    const newEntry: WeightData = {
      week: currentWeek,
      actualWeight: currentWeight,
      optimalWeight,
      date: new Date().toISOString().split('T')[0]
    };

    setWeightData(prev => [...prev.filter(entry => entry.week !== currentWeek), newEntry]
      .sort((a, b) => a.week - b.week));

    toast({
      title: "تم حفظ الوزن ✅",
      description: `الوزن الحالي: ${currentWeight} كيلو | المثالي: ${optimalWeight.toFixed(1)} كيلو`
    });
  };

  // حساب الحالة الحالية
  const getCurrentStatus = () => {
    if (!prePregnancyWeight || !height || !currentWeight) return null;

    const preBMI = calculateBMI(prePregnancyWeight, height);
    const optimalWeight = calculateOptimalWeight(currentWeek, preBMI);
    const difference = currentWeight - optimalWeight;

    return {
      bmi: preBMI,
      optimalWeight,
      difference,
      status: Math.abs(difference) <= 2 ? 'مثالي' : 
              difference > 2 ? 'زيادة' : 'نقص',
      color: Math.abs(difference) <= 2 ? 'text-success' : 
             difference > 2 ? 'text-warning' : 'text-error'
    };
  };

  const status = getCurrentStatus();

  return (
    <div className="space-y-6">
      {/* إدخال البيانات الأساسية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            حاسبة الوزن المثالي أثناء الحمل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="preWeight">الوزن قبل الحمل (كيلو)</Label>
              <Input
                id="preWeight"
                type="number"
                value={prePregnancyWeight || ''}
                onChange={(e) => setPrePregnancyWeight(Number(e.target.value))}
                placeholder="مثال: 60"
              />
            </div>
            <div>
              <Label htmlFor="height">الطول (سم)</Label>
              <Input
                id="height"
                type="number"
                value={height || ''}
                onChange={(e) => setHeight(Number(e.target.value))}
                placeholder="مثال: 165"
              />
            </div>
            <div>
              <Label htmlFor="currentWeight">الوزن الحالي (كيلو)</Label>
              <Input
                id="currentWeight"
                type="number"
                value={currentWeight || ''}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                placeholder="مثال: 65"
              />
            </div>
          </div>
          
          <Button onClick={addWeightEntry} className="w-full">
            <Target className="h-4 w-4 mr-2" />
            حفظ الوزن الحالي
          </Button>
        </CardContent>
      </Card>

      {/* عرض الحالة الحالية */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              حالتك الحالية - الأسبوع {currentWeek}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{status.bmi.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">BMI قبل الحمل</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">{status.optimalWeight.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">الوزن المثالي (كيلو)</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${status.color}`}>
                  {status.difference > 0 ? '+' : ''}{status.difference.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">الفرق (كيلو)</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${status.color}`}>{status.status}</p>
                <p className="text-sm text-muted-foreground">الحالة</p>
              </div>
            </div>
            
            {Math.abs(status.difference) > 2 && (
              <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
                <p className="text-sm text-center">
                  {status.difference > 2 
                    ? '⚠️ وزنك أعلى من المثالي. استشيري طبيبك حول نظام غذائي صحي'
                    : '⚠️ وزنك أقل من المثالي. تأكدي من تناول غذاء متوازن ومغذي'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* الرسم البياني */}
      {weightData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              تطور الوزن عبر الأسابيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    label={{ value: 'الأسبوع', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'الوزن (كيلو)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => `الأسبوع ${label}`}
                    formatter={(value, name) => [
                      `${value} كيلو`, 
                      name === 'actualWeight' ? 'الوزن الفعلي' : 'الوزن المثالي'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optimalWeight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="optimalWeight"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actualWeight" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={3}
                    name="actualWeight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary"></div>
                <span>الوزن المثالي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-secondary"></div>
                <span>وزنك الفعلي</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* نصائح مفيدة */}
      <Card>
        <CardHeader>
          <CardTitle>نصائح للوزن الصحي أثناء الحمل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">التغذية السليمة:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• تناولي وجبات متوازنة ومتنوعة</li>
                <li>• أكثري من الخضروات والفواكه</li>
                <li>• تناولي البروتينات بانتظام</li>
                <li>• اشربي كمية كافية من الماء</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">النشاط البدني:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• مارسي رياضة خفيفة بانتظام</li>
                <li>• امشي يومياً لمدة 30 دقيقة</li>
                <li>• جربي اليوجا للحوامل</li>
                <li>• استشيري طبيبك قبل أي تمرين</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};