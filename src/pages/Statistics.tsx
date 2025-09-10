import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Heart, Activity, Weight, Target } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useDailyLogs } from "@/hooks/useDailyLogs";
import { useReminders } from "@/hooks/useReminders";
import { useFavorites } from "@/hooks/useFavorites";

const Statistics = () => {
  const { logs, getAverageStats } = useDailyLogs();
  const { reminders } = useReminders();
  const { favorites } = useFavorites();

  const weeklyStats = getAverageStats(7);
  const monthlyStats = getAverageStats(30);

  const completedReminders = reminders.filter(r => r.completed).length;
  const totalReminders = reminders.length;
  const reminderProgress = totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0;

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const moodTrend = getTrend(weeklyStats.avgMood, monthlyStats.avgMood);
  const energyTrend = getTrend(weeklyStats.avgEnergy, monthlyStats.avgEnergy);
  const weightTrend = getTrend(weeklyStats.avgWeight, monthlyStats.avgWeight);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string, isWeight: boolean = false) => {
    // For weight, stable/controlled increase is good
    if (isWeight) {
      switch (trend) {
        case 'up': return 'text-yellow-600';
        case 'down': return 'text-red-600';
        default: return 'text-green-600';
      }
    }
    // For mood and energy, up is good
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const weeklyLogCount = logs.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  }).length;

  const consistencyScore = (weeklyLogCount / 7) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageHeader title="الإحصائيات والتقارير" />

      <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{logs.length}</div>
              <div className="text-sm text-muted-foreground">تسجيل يومي</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{completedReminders}</div>
              <div className="text-sm text-muted-foreground">تذكير مكتمل</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-wellness">{favorites.length}</div>
              <div className="text-sm text-muted-foreground">مفضلة</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{Math.round(consistencyScore)}%</div>
              <div className="text-sm text-muted-foreground">الالتزام</div>
            </CardContent>
          </Card>
        </div>

        {/* Health Trends */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              اتجاهات الصحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Trend */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-wellness" />
                <div>
                  <div className="font-medium">المزاج العام</div>
                  <div className="text-sm text-muted-foreground">
                    متوسط الأسبوع: {weeklyStats.avgMood}/7
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${getTrendColor(moodTrend)}`}>
                {getTrendIcon(moodTrend)}
                <span className="font-medium">
                  {moodTrend === 'up' ? 'تحسن' : moodTrend === 'down' ? 'انخفاض' : 'مستقر'}
                </span>
              </div>
            </div>

            {/* Energy Trend */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-secondary" />
                <div>
                  <div className="font-medium">مستوى الطاقة</div>
                  <div className="text-sm text-muted-foreground">
                    متوسط الأسبوع: {weeklyStats.avgEnergy}/10
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${getTrendColor(energyTrend)}`}>
                {getTrendIcon(energyTrend)}
                <span className="font-medium">
                  {energyTrend === 'up' ? 'تحسن' : energyTrend === 'down' ? 'انخفاض' : 'مستقر'}
                </span>
              </div>
            </div>

            {/* Weight Trend */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Weight className="w-6 h-6 text-accent" />
                <div>
                  <div className="font-medium">الوزن</div>
                  <div className="text-sm text-muted-foreground">
                    متوسط الأسبوع: {weeklyStats.avgWeight} كيلو
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${getTrendColor(weightTrend, true)}`}>
                {getTrendIcon(weightTrend)}
                <span className="font-medium">
                  {weightTrend === 'up' ? 'زيادة' : weightTrend === 'down' ? 'نقص' : 'مستقر'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Common Symptoms */}
        {weeklyStats.commonSymptoms.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>الأعراض الأكثر شيوعاً هذا الأسبوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {weeklyStats.commonSymptoms.map((symptom, index) => (
                  <Badge 
                    key={symptom} 
                    variant={index === 0 ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {symptom}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Goals */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              تقدم الأهداف
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Logging Consistency */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">التسجيل اليومي</span>
                <span className="text-sm text-muted-foreground">
                  {weeklyLogCount}/7 أيام هذا الأسبوع
                </span>
              </div>
              <Progress value={consistencyScore} className="h-3" />
              <div className="text-xs text-muted-foreground mt-1">
                هدف: تسجيل الحالة يومياً لمتابعة أفضل
              </div>
            </div>

            {/* Reminders Completion */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">إكمال التذكيرات</span>
                <span className="text-sm text-muted-foreground">
                  {completedReminders}/{totalReminders}
                </span>
              </div>
              <Progress value={reminderProgress} className="h-3" />
              <div className="text-xs text-muted-foreground mt-1">
                هدف: إكمال جميع التذكيرات الطبية
              </div>
            </div>

            {/* Wellness Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">نقاط الصحة العامة</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((weeklyStats.avgMood + weeklyStats.avgEnergy) / 2 * 10)}/100
                </span>
              </div>
              <Progress 
                value={(weeklyStats.avgMood + weeklyStats.avgEnergy) / 2 * 10} 
                className="h-3" 
              />
              <div className="text-xs text-muted-foreground mt-1">
                يُحسب من متوسط المزاج والطاقة
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="shadow-card bg-gradient-card">
          <CardHeader>
            <CardTitle>نصائح مخصصة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {consistencyScore < 50 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">
                  💡 اجعلي التسجيل اليومي عادة
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  حددي وقتاً ثابتاً كل يوم لتسجيل حالتك، مثل قبل النوم
                </div>
              </div>
            )}
            
            {weeklyStats.avgMood < 4 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-200">
                  💙 اعتني بصحتك النفسية
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  مارسي تمارين الاسترخاء وتحدثي مع طبيبك إذا استمر انخفاض المزاج
                </div>
              </div>
            )}
            
            {weeklyStats.avgEnergy < 4 && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="font-medium text-green-800 dark:text-green-200">
                  ⚡ تحسين مستوى الطاقة
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  تأكدي من النوم الكافي وتناول وجبات متوازنة صغيرة ومتكررة
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;