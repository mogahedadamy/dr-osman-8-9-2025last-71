import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Heart,
  Activity,
  Clock,
  Target
} from "lucide-react";

interface DailyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  status: 'completed' | 'in_progress' | 'missed';
}

const DailyHealthSummary = () => {
  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const dailyGoals: DailyGoal[] = [
    {
      id: 'water',
      title: 'شرب الماء',
      target: 8,
      current: 6,
      unit: 'أكواب',
      status: 'in_progress'
    },
    {
      id: 'movement_tracking',
      title: 'تسجيل حركة الجنين',
      target: 1,
      current: 1,
      unit: 'مرة',
      status: 'completed'
    },
    {
      id: 'exercise',
      title: 'المشي',
      target: 30,
      current: 20,
      unit: 'دقيقة',
      status: 'in_progress'
    },
    {
      id: 'vitamins',
      title: 'الفيتامينات',
      target: 1,
      current: 0,
      unit: 'جرعة',
      status: 'missed'
    }
  ];

  const completedGoals = dailyGoals.filter(goal => goal.status === 'completed').length;
  const completionPercentage = Math.round((completedGoals / dailyGoals.length) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'missed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-yellow-600';
      case 'missed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5" />
            ملخص اليوم - {today}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">إنجاز الأهداف اليومية</span>
              <span className="text-sm font-bold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedGoals} من {dailyGoals.length} أهداف مكتملة
            </p>
          </div>

          {/* Daily Goals */}
          <div className="space-y-3">
            {dailyGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(goal.status)}
                  <div>
                    <p className="text-sm font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={goal.status === 'completed' ? 'default' : 'outline'}
                    className={`text-xs ${getStatusColor(goal.status)}`}
                  >
                    {goal.status === 'completed' ? 'مكتمل' :
                     goal.status === 'in_progress' ? 'جاري' : 'متأخر'}
                  </Badge>
                  {goal.status !== 'completed' && (
                    <div className="mt-1">
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-1 w-12" 
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">نصيحة اليوم</p>
                <p className="text-xs text-blue-700 mt-1">
                  اشربي كوب ماء إضافي مع كل وجبة لتحقيق هدفك اليومي. 
                  الماء مهم لصحتك وصحة جنينك.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyHealthSummary;