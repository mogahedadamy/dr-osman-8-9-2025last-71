import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Scale, TrendingUp, Target, BarChart3, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart, Bar, ResponsiveContainer, Area, AreaChart, Cell } from "recharts";

const WeightTracker = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    preWeight: "",
    currentWeight: "",
    height: "",
    currentWeek: ""
  });
  const [results, setResults] = useState<any>(null);

  const calculateWeightGain = () => {
    const { preWeight, currentWeight, height, currentWeek } = formData;
    
    if (!preWeight || !currentWeight || !height || !currentWeek) {
      toast({
        title: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Calculate BMI
    const heightM = parseFloat(height) / 100;
    const bmi = parseFloat(preWeight) / (heightM * heightM);
    
    // Determine BMI category and recommended weight gain
    let category = "";
    let minGain = 0;
    let maxGain = 0;
    let weeklyGain = 0;
    
    if (bmi < 18.5) {
      category = "نقص في الوزن";
      minGain = 12.5;
      maxGain = 18;
      weeklyGain = 0.5;
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "وزن طبيعي";
      minGain = 11.5;
      maxGain = 16;
      weeklyGain = 0.4;
    } else if (bmi >= 25 && bmi < 30) {
      category = "زيادة في الوزن";
      minGain = 7;
      maxGain = 11.5;
      weeklyGain = 0.3;
    } else {
      category = "سمنة";
      minGain = 5;
      maxGain = 9;
      weeklyGain = 0.2;
    }

    const currentGain = parseFloat(currentWeight) - parseFloat(preWeight);
    const week = parseInt(currentWeek);
    const expectedGain = week > 13 ? (week - 13) * weeklyGain + 1.5 : week * 0.1;
    const remainingWeeks = 40 - week;
    const recommendedRemaining = maxGain - currentGain;

    setResults({
      bmi: bmi.toFixed(1),
      category,
      currentGain: currentGain.toFixed(1),
      expectedGain: expectedGain.toFixed(1),
      minGain,
      maxGain,
      recommendedRemaining: Math.max(0, recommendedRemaining).toFixed(1),
      weeklyTarget: (recommendedRemaining / Math.max(1, remainingWeeks)).toFixed(2),
      status: currentGain < expectedGain - 2 ? "أقل من المطلوب" : 
              currentGain > expectedGain + 3 ? "أكثر من المطلوب" : "طبيعي",
      progressPercentage: Math.min(100, (currentGain / maxGain) * 100),
      preWeight: parseFloat(preWeight),
      currentWeight: parseFloat(currentWeight),
      weeklyGain,
      week
    });

    toast({
      title: "تم حساب زيادة الوزن بنجاح",
      description: `زيادة الوزن الحالية: ${currentGain.toFixed(1)} كجم`
    });
  };

  // Generate chart data for weight progression
  const generateWeightProgressionData = () => {
    if (!results) return [];
    
    const data = [];
    const { preWeight, weeklyGain, week, maxGain, minGain } = results;
    
    // Generate data for all 40 weeks
    for (let i = 0; i <= 40; i++) {
      const expectedGain = i > 13 ? (i - 13) * weeklyGain + 1.5 : i * 0.1;
      const idealWeight = preWeight + expectedGain;
      const minWeight = preWeight + (minGain * i / 40);
      const maxWeight = preWeight + (maxGain * i / 40);
      
      data.push({
        week: i,
        idealWeight: Math.round(idealWeight * 10) / 10,
        minWeight: Math.round(minWeight * 10) / 10,
        maxWeight: Math.round(maxWeight * 10) / 10,
        currentWeight: i === week ? results.currentWeight : null
      });
    }
    
    return data;
  };

  // Generate comparison chart data
  const generateComparisonData = () => {
    if (!results) return [];
    
    return [
      {
        category: "الوزن الحالي",
        value: parseFloat(results.currentGain),
        color: "hsl(var(--primary))"
      },
      {
        category: "الهدف المتوقع",
        value: parseFloat(results.expectedGain),
        color: "hsl(var(--secondary))"
      },
      {
        category: "الحد الأدنى",
        value: results.minGain * (results.week / 40),
        color: "hsl(var(--wellness))"
      },
      {
        category: "الحد الأقصى", 
        value: results.maxGain * (results.week / 40),
        color: "hsl(var(--accent))"
      }
    ];
  };

  const chartConfig = {
    idealWeight: {
      label: "الوزن المثالي",
      color: "hsl(var(--primary))",
    },
    currentWeight: {
      label: "الوزن الحالي",
      color: "hsl(var(--secondary))",
    },
    minWeight: {
      label: "الحد الأدنى",
      color: "hsl(var(--wellness))",
    },
    maxWeight: {
      label: "الحد الأقصى",
      color: "hsl(var(--accent))",
    },
    value: {
      label: "الوزن (كجم)",
      color: "hsl(var(--primary))",
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preWeight" className="text-sm font-medium">الوزن قبل الحمل (كجم)</Label>
          <Input
            id="preWeight"
            type="number"
            value={formData.preWeight}
            onChange={(e) => setFormData({...formData, preWeight: e.target.value})}
            placeholder="55"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="currentWeight" className="text-sm font-medium">الوزن الحالي (كجم)</Label>
          <Input
            id="currentWeight"
            type="number"
            value={formData.currentWeight}
            onChange={(e) => setFormData({...formData, currentWeight: e.target.value})}
            placeholder="62"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="height" className="text-sm font-medium">الطول (سم)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({...formData, height: e.target.value})}
            placeholder="160"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="currentWeek" className="text-sm font-medium">الأسبوع الحالي من الحمل</Label>
          <Input
            id="currentWeek"
            type="number"
            value={formData.currentWeek}
            onChange={(e) => setFormData({...formData, currentWeek: e.target.value})}
            placeholder="20"
            min="1"
            max="42"
            className="mt-1"
          />
        </div>
      </div>

      <Button 
        onClick={calculateWeightGain}
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
      >
        <Scale className="w-4 h-4 ml-2" />
        احسبي زيادة الوزن المثلى
      </Button>

      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary-light border-primary/20">
              <CardContent className="p-4 text-center">
                <Scale className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-primary">مؤشر كتلة الجسم</h3>
                <p className="text-lg font-semibold text-foreground">{results.bmi}</p>
                <p className="text-sm text-muted-foreground">{results.category}</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary-soft border-secondary/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-bold text-secondary">زيادة الوزن الحالية</h3>
                <p className="text-lg font-semibold text-foreground">{results.currentGain} كجم</p>
                <p className="text-sm text-muted-foreground">الحالة: {results.status}</p>
              </CardContent>
            </Card>

            <Card className="bg-wellness-soft border-wellness/20">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-wellness mx-auto mb-2" />
                <h3 className="font-bold text-wellness">الهدف الأسبوعي</h3>
                <p className="text-lg font-semibold text-foreground">{results.weeklyTarget} كجم</p>
                <p className="text-sm text-muted-foreground">في الأسبوع</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-accent-soft border-accent/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-accent">تقدم زيادة الوزن</h3>
                <span className="text-sm text-muted-foreground">{results.progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={results.progressPercentage} className="mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>الحد الأدنى: {results.minGain} كجم</span>
                <span>الحد الأقصى: {results.maxGain} كجم</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">📊 توصيات مخصصة:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• الزيادة المتوقعة في هذا الأسبوع: {results.expectedGain} كجم</p>
              <p>• الزيادة المتبقية الموصى بها: {results.recommendedRemaining} كجم</p>
              <p>• المدى الصحي الكامل: {results.minGain} - {results.maxGain} كجم</p>
              {results.status !== "طبيعي" && (
                <p className="text-amber-600 font-medium">
                  ⚠️ ننصح بمراجعة طبيبك لوضع خطة غذائية مناسبة
                </p>
              )}
            </div>
          </div>

          {/* Charts Section */}
          <div className="space-y-6 mt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">📈 الرسوميات البيانية</h3>
              <p className="text-muted-foreground text-sm">تصور بياني لتطور الوزن ومقارنة الأهداف</p>
            </div>

            {/* Weight Progression Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  منحنى تطور الوزن خلال الحمل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={generateWeightProgressionData()}>
                    <defs>
                      <linearGradient id="idealWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="week" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => `الأسبوع ${value}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="maxWeight"
                      stroke="hsl(var(--accent))"
                      fillOpacity={0.1}
                      fill="hsl(var(--accent))"
                    />
                    <Area
                      type="monotone"
                      dataKey="minWeight"
                      stroke="hsl(var(--wellness))"
                      fillOpacity={0.1}
                      fill="hsl(var(--wellness))"
                    />
                    <Line
                      type="monotone"
                      dataKey="idealWeight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={false}
                      fill="url(#idealWeight)"
                    />
                    {results.week && (
                      <Line
                        type="monotone"
                        dataKey="currentWeight"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={4}
                        dot={{ r: 6, fill: "hsl(var(--secondary))" }}
                      />
                    )}
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Weight Comparison Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  مقارنة زيادة الوزن
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <RechartsBarChart data={generateComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => value}
                      formatter={(value) => [`${value} كجم`, "الوزن"]}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                    >
                      {generateComparisonData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Progress Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-wellness" />
                  معدل التقدم الأسبوعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-primary-light rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{results.currentGain}</div>
                    <div className="text-sm text-muted-foreground">زيادة حالية (كجم)</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-soft rounded-lg border border-secondary/20">
                    <div className="text-2xl font-bold text-secondary">{results.weeklyTarget}</div>
                    <div className="text-sm text-muted-foreground">هدف أسبوعي (كجم)</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">التقدم نحو الهدف الأقصى</span>
                    <span className="text-sm text-muted-foreground">{results.progressPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={results.progressPercentage} className="h-3" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 كجم</span>
                    <span className="text-primary font-medium">الوضع الحالي</span>
                    <span>{results.maxGain} كجم</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightTracker;