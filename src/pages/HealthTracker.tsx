import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HealthMetricCard from "@/components/health/HealthMetricCard";
import QuickActionButton from "@/components/health/QuickActionButton";
import HealthInsight from "@/components/health/HealthInsight";
import { 
  Activity, 
  Heart, 
  Baby, 
  Weight, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  AlertTriangle,
  Stethoscope,
  Thermometer,
  BarChart3,
  Clock,
  Target,
  Shield,
  Info,
  Download,
  Share2,
  Bell
} from "lucide-react";
import MobileHeader from "@/components/layout/MobileHeader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useHealthTracking } from "@/hooks/useHealthTracking";

const HealthTracker = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // استخدام البيانات الحقيقية من نظام التتبع
  const {
    weightEntries,
    bpEntries,
    movementEntries,
    symptomEntries,
    currentWeek,
    getHealthMetrics,
    getStats,
    isInitialized
  } = useHealthTracking();

  // إعداد البيانات للرسوم البيانية من البيانات الحقيقية
  const weightData = weightEntries
    .slice(0, 10)
    .reverse()
    .map(entry => ({
      week: entry.week,
      weight: entry.weight,
      date: entry.date
    }));

  const bpData = bpEntries
    .slice(0, 10)
    .reverse()
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('ar-SA', { month: 'numeric', day: 'numeric' }),
      systolic: entry.systolic,
      diastolic: entry.diastolic
    }));

  // تجميع حركة الجنين حسب اليوم (آخر 7 أيام)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const babyMovementData = last7Days.map(date => {
    const dayMovements = movementEntries.filter(entry => entry.date === date);
    const totalMovements = dayMovements.reduce((sum, entry) => sum + entry.movements, 0);
    const dayName = new Date(date).toLocaleDateString('ar-SA', { weekday: 'long' });
    return {
      day: dayName,
      movements: totalMovements
    };
  });

  // تجميع الأعراض
  const symptomCounts: { [key: string]: number } = {};
  symptomEntries.forEach(entry => {
    symptomCounts[entry.symptom] = (symptomCounts[entry.symptom] || 0) + 1;
  });

  const symptomsData = Object.entries(symptomCounts)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  // الحصول على المقاييس الحالية
  const metrics = getHealthMetrics();
  const stats = getStats();
  
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
  const initialWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
  const targetWeight = initialWeight + 12; // متوسط الزيادة المطلوبة

  // إذا لم يتم تحميل البيانات بعد
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات التتبع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="متتبع الصحة" 
        showBackButton={true}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        }
      />
      
      <div className="p-4 space-y-6">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأسبوع الحالي</p>
                  <p className="text-2xl font-bold text-primary">{currentWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الإدخالات</p>
                  <p className="text-2xl font-bold text-accent">{stats.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Status Alert */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {metrics.riskFactors.length > 0 ? (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                تحذير: {metrics.riskFactors.join('، ')}. يُنصح بمراجعة طبيبك.
              </AlertDescription>
            </Alert>
          ) : stats.totalEntries === 0 ? (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                مرحباً! ابدئي بإدخال بياناتك الصحية لمراقبة حملك بشكل دقيق. استخدمي الإجراءات السريعة أدناه.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <Shield className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <span className="font-medium">الحالة الصحية: ممتازة</span> - جميع المؤشرات ضمن النطاق الطبيعي
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Enhanced Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <HealthMetricCard
            title="الوزن الحالي"
            value={currentWeight}
            unit="كغ"
            status="good"
            trend="up"
            trendValue={`+${(currentWeight - initialWeight).toFixed(1)} كغ`}
            icon={Weight}
            iconColor="text-blue-500"
          />
          
          <HealthMetricCard
            title="ضغط الدم"
            value="119/77"
            status="good"
            icon={Heart}
            iconColor="text-red-500"
          />
          
          <HealthMetricCard
            title="حركة الجنين"
            value={19}
            unit="حركة/يوم"
            status="good"
            trend="stable"
            trendValue="متوسط 18"
            icon={Baby}
            iconColor="text-purple-500"
          />
          
          <HealthMetricCard
            title="درجة الحرارة"
            value="36.7"
            unit="°م"
            status="normal"
            icon={Thermometer}
            iconColor="text-orange-500"
          />
        </motion.div>

        {/* Health Insights & Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <HealthInsight
            type="tip"
            title="نصيحة صحية"
            message="حركة الجنين نشطة وطبيعية. استمري في تتبع الحركات يومياً للتأكد من سلامة الجنين."
            recommendations={[
              "اشربي كوب عصير بارد لتحفيز حركة الجنين",
              "استلقي على الجانب الأيسر لمدة ساعة",
              "سجلي الحركات في نفس الوقت يومياً"
            ]}
            priority="medium"
          />
          
          <HealthInsight
            type="success"
            title="إنجاز رائع!"
            message="حافظت على وزن صحي هذا الأسبوع. زيادة الوزن ضمن المعدل المطلوب."
            priority="low"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <QuickActionButton
                  label="إضافة وزن"
                  icon={Weight}
                  onClick={() => console.log('Add weight')}
                />
                <QuickActionButton
                  label="ضغط دم"
                  icon={Heart}
                  onClick={() => console.log('Add BP')}
                />
                <QuickActionButton
                  label="حركة جنين"
                  icon={Baby}
                  onClick={() => console.log('Add movement')}
                />
                <QuickActionButton
                  label="درجة حرارة"
                  icon={Thermometer}
                  onClick={() => console.log('Add temperature')}
                />
                <QuickActionButton
                  label="أعراض"
                  icon={AlertTriangle}
                  onClick={() => console.log('Add symptom')}
                />
                <QuickActionButton
                  label="موعد طبي"
                  icon={Calendar}
                  onClick={() => console.log('Add appointment')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                مؤشرات التقدم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>تقدم الحمل</span>
                  <span>{Math.round((currentWeek / 40) * 100)}%</span>
                </div>
                <Progress value={(currentWeek / 40) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {40 - currentWeek} أسبوع متبقي تقريباً
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>زيادة الوزن المثلى</span>
                  <span>{Math.round(((currentWeight - initialWeight) / (targetWeight - initialWeight)) * 100)}%</span>
                </div>
                <Progress value={((currentWeight - initialWeight) / (targetWeight - initialWeight)) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {(targetWeight - currentWeight).toFixed(1)} كغ متبقي للوصول للهدف
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>مراقبة يومية</span>
                  <span>{Math.round((stats.streakDays / 30) * 100)}%</span>
                </div>
                <Progress value={(stats.streakDays / 30) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {stats.streakDays} يوم متتابع من المراقبة
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="weight">الوزن</TabsTrigger>
              <TabsTrigger value="vitals">المؤشرات</TabsTrigger>
              <TabsTrigger value="baby">الجنين</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">الأعراض الأسبوعية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={symptomsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {symptomsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {symptomsData.map((item, index) => (
                        <Badge key={item.name} variant="outline" className="text-xs">
                          <div 
                            className="w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">حركة الجنين الأسبوعية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={babyMovementData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="movements" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Weight Tab */}
            <TabsContent value="weight" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">تطور الوزن</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">ضغط الدم</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bpData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="systolic" 
                          stroke="#ff7300" 
                          strokeWidth={2}
                          name="الانقباضي"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="diastolic" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="الانبساطي"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">نبضات القلب</p>
                        <p className="text-xl font-bold">72 نبضة/دقيقة</p>
                        <Badge variant="secondary" className="text-xs">طبيعي</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">مستوى النشاط</p>
                        <p className="text-xl font-bold">متوسط</p>
                        <Badge variant="secondary" className="text-xs">جيد</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Baby Tab */}
            <TabsContent value="baby" className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Baby className="w-5 h-5 text-purple-600" />
                    معلومات الجنين - الأسبوع {currentWeek}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/70 p-3 rounded-lg">
                      <p className="text-muted-foreground">الحجم المتوقع</p>
                      <p className="font-bold">حجم الخس الروماني</p>
                      <p className="text-xs text-purple-600">حوالي 38 سم</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg">
                      <p className="text-muted-foreground">الوزن المتوقع</p>
                      <p className="font-bold">1.1 كيلوغرام</p>
                      <p className="text-xs text-purple-600">نمو طبيعي</p>
                    </div>
                  </div>

                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">التطورات هذا الأسبوع:</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• تطور الجهاز التنفسي</li>
                      <li>• نمو الدماغ والجهاز العصبي</li>
                      <li>• زيادة الحركة والنشاط</li>
                      <li>• تطور حاسة السمع</li>
                    </ul>
                  </div>

                  <Alert>
                    <Clock className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      تذكري عد الحركات يومياً - الهدف 10 حركات في ساعتين
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <Button className="flex-1" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            تصدير التقرير
          </Button>
          <Button className="flex-1">
            <Stethoscope className="w-4 h-4 mr-2" />
            استشارة طبية
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HealthTracker;