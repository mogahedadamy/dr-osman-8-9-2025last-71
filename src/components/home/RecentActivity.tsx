import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Heart,
  Calendar,
  Plus,
  Weight,
  Camera,
  FileText
} from "lucide-react";
import { dbOperations } from "@/lib/localDatabase";
import { useReminders } from "@/hooks/useReminders";

const RecentActivity = () => {
  const { reminders, activeReminders } = useReminders();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const [dailyLogs, weightEntries, bellyPhotos, medicalTests] = await Promise.all([
          dbOperations.getDailyLogs(),
          dbOperations.getWeightEntries(),
          dbOperations.getBellyPhotos(),
          dbOperations.getMedicalTests()
        ]);

        const recentActivities: any[] = [];

        // Add active reminders
        const todayReminders = activeReminders.slice(0, 2);
        todayReminders.forEach((reminder, index) => {
          recentActivities.push({
            id: `reminder-${reminder.id}`,
            title: reminder.title,
            description: reminder.date === 'يومياً' ? `يومياً في ${reminder.time}` : `${reminder.date} في ${reminder.time}`,
            icon: reminder.type === 'medical' ? <Heart className="w-4 h-4" /> : 
                  reminder.type === 'appointment' ? <Calendar className="w-4 h-4" /> : 
                  <CheckCircle className="w-4 h-4" />,
            status: reminder.type === 'appointment' ? 'upcoming' : 'pending',
            action: reminder.type === 'appointment' ? 'عرض التفاصيل' : 'تسجيل الآن',
            path: reminder.type === 'appointment' ? '/calendar' : '/daily-log'
          });
        });

        // Check weight tracking
        const today = new Date().toISOString().split('T')[0];
        const recentWeight = (weightEntries as any[])
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (!recentWeight || recentWeight.date !== today) {
          const daysSinceLastWeight = recentWeight ? 
            Math.floor((new Date().getTime() - new Date(recentWeight.date).getTime()) / (1000 * 60 * 60 * 24)) : 
            null;
          
          recentActivities.push({
            id: 'weight-tracking',
            title: 'تسجيل الوزن',
            description: daysSinceLastWeight ? 
              `آخر تسجيل منذ ${daysSinceLastWeight} ${daysSinceLastWeight === 1 ? 'يوم' : 'أيام'}` : 
              'لم يتم تسجيل الوزن بعد',
            icon: <Weight className="w-4 h-4" />,
            status: 'pending',
            action: 'سجلي وزنك',
            path: '/tools'
          });
        }

        // Check daily log
        const todayLog = (dailyLogs as any[]).find((log: any) => log.date === today);
        if (!todayLog) {
          recentActivities.push({
            id: 'daily-log',
            title: 'تسجيل الحالة اليومية',
            description: 'لم يتم تسجيل حالتك اليوم',
            icon: <FileText className="w-4 h-4" />,
            status: 'pending',
            action: 'سجلي حالتك',
            path: '/daily-log'
          });
        }

        // Check belly photos (weekly)
        const currentWeek = Math.ceil((new Date().getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24 * 7));
        const thisWeekPhoto = (bellyPhotos as any[]).find((photo: any) => photo.week === currentWeek);
        
        if (!thisWeekPhoto && (bellyPhotos as any[]).length < 40) { // Only suggest if not full term
          recentActivities.push({
            id: 'belly-photo',
            title: 'صورة البطن الأسبوعية',
            description: 'لم يتم التقاط صورة هذا الأسبوع',
            icon: <Camera className="w-4 h-4" />,
            status: 'pending',
            action: 'التقطي صورة',
            path: '/tools'
          });
        }

        // Show completed activities
        if (todayLog) {
          recentActivities.unshift({
            id: 'completed-log',
            title: 'تم تسجيل الحالة',
            description: `تم التسجيل اليوم`,
            icon: <CheckCircle className="w-4 h-4" />,
            status: 'completed',
            action: 'عرض التفاصيل',
            path: '/daily-log'
          });
        }

        if (recentWeight && recentWeight.date === today) {
          recentActivities.unshift({
            id: 'completed-weight',
            title: 'تم تسجيل الوزن',
            description: `الوزن: ${recentWeight.weight} كيلو`,
            icon: <Weight className="w-4 h-4" />,
            status: 'completed',
            action: 'عرض المتابعة',
            path: '/tools'
          });
        }

        // Limit to 4 most important activities
        setActivities(recentActivities.slice(0, 4));
      } catch (error) {
        console.error('Error loading recent activities:', error);
        // Fallback to show reminder to add data
        setActivities([{
          id: 'start-logging',
          title: 'ابدئي رحلة المتابعة',
          description: 'سجلي بياناتك لمتابعة أفضل',
          icon: <Plus className="w-4 h-4" />,
          status: 'pending',
          action: 'ابدئي الآن',
          path: '/daily-log'
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivities();
  }, [activeReminders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-500',
          badge: 'bg-orange-100 text-orange-700'
        };
      case 'upcoming':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'completed':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-500',
          badge: 'bg-green-100 text-green-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-500',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-3 h-3" />;
      case 'upcoming':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'يحتاج إجراء';
      case 'upcoming':
        return 'قادم';
      case 'completed':
        return 'مكتمل';
      default:
        return '';
    }
  };

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-foreground px-1">
          النشاطات الأخيرة
        </h3>
        <Link to="/daily-log">
          <Button variant="ghost" size="sm" className="text-primary">
            <Plus className="w-4 h-4 ml-1" />
            إضافة
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const statusColor = getStatusColor(activity.status);
          return (
            <Card 
              key={activity.id} 
              className={`shadow-card hover:shadow-lg transition-all duration-200 ${statusColor.bg}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/80 ${statusColor.icon}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-foreground">
                        {activity.title}
                      </h4>
                      <Badge variant="secondary" className={`text-xs ${statusColor.badge}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(activity.status)}
                          {getStatusText(activity.status)}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {activity.description}
                    </p>
                    <Link to={activity.path}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7 px-3"
                      >
                        {activity.action}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Add Section */}
      <Card className="shadow-card mt-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/10">
        <CardContent className="p-4 text-center">
          <h4 className="font-semibold text-primary mb-2">
            📝 هل تريدين تسجيل شيء اليوم؟
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            سجلي حالتك، وزنك، أو أي ملاحظة مهمة
          </p>
          <Link to="/daily-log">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
              ابدئي التسجيل
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;