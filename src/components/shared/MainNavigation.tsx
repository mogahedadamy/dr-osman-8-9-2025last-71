import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Settings,
  Crown,
  UserCheck,
  Heart,
  Stethoscope,
  Shield
} from "lucide-react";

const MainNavigation = () => {
  const navItems = [
    {
      title: "الرئيسية",
      icon: <Home className="w-5 h-5" />,
      path: "/",
      description: "العودة للصفحة الرئيسية"
    },
    {
      title: "خدمات التطبيق",
      icon: <Stethoscope className="w-5 h-5" />,
      path: "/calendar",
      description: "حجز مواعيد ومتابعة",
      badge: "جديد"
    },
    {
      title: "نظام الحجوزات",
      icon: <Calendar className="w-5 h-5" />,
      path: "/booking",
      description: "حجز مواعيد المركز",
      badge: "جديد"
    },
    {
      title: "عثمانيات الحمل",
      icon: <Heart className="w-5 h-5" />,
      path: "/tips",
      description: "نصائح د.عثمان الخاصة",
      isPremium: true
    },
    {
      title: "المكتبة التعليمية",
      icon: <BookOpen className="w-5 h-5" />,
      path: "/library",
      description: "فيديوهات ومقالات متخصصة"
    },
    {
      title: "المساعد الذكي",
      icon: <MessageSquare className="w-5 h-5" />,
      path: "/chat",
      description: "استشارات فورية",
      badge: "متصل"
    },
    {
      title: "الاشتراك المدفوع",
      icon: <Crown className="w-5 h-5" />,
      path: "/premium-access",
      description: "المحتوى المتميز",
      isPremium: true
    },
    {
      title: "تسجيل الدخول",
      icon: <UserCheck className="w-5 h-5" />,
      path: "/login",
      description: "الدخول لحسابك المدفوع"
    },
    {
      title: "الإعدادات",
      icon: <Settings className="w-5 h-5" />,
      path: "/settings",
      description: "تخصيص التطبيق"
    },
    {
      title: "لوحة التحكم",
      icon: <Shield className="w-5 h-5" />,
      path: "/admin",
      description: "إدارة النظام",
      badge: "إداري",
      isAdmin: true,
      credentials: {
        username: "admin",
        password: "admin123"
      }
    }
  ];

  return (
    <Card className="shadow-card mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 text-foreground">التنقل السريع</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {navItems.map((item, index) => (
            <Link key={index} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full h-auto flex-col p-3 relative ${
                  item.isPremium ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20' : ''
                } ${
                  item.isAdmin ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-200 dark:border-red-800' : ''
                }`}
              >
                {item.badge && !item.isPremium && !item.isAdmin && (
                  <Badge className="absolute -top-2 -right-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {item.isPremium && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary text-xs">
                    مميز
                  </Badge>
                )}
                {item.isAdmin && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-xs">
                    {item.badge}
                  </Badge>
                )}
                <div className={`mb-2 ${item.isPremium ? 'text-primary' : ''} ${item.isAdmin ? 'text-red-600 dark:text-red-400' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-sm font-medium ${item.isPremium ? 'text-primary' : 'text-foreground'} ${item.isAdmin ? 'text-red-700 dark:text-red-300' : ''}`}>
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {item.description}
                </span>
                {item.credentials && (
                  <div className="text-xs text-center mt-1 p-1 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
                    <div>المستخدم: {item.credentials.username}</div>
                    <div>كلمة المرور: {item.credentials.password}</div>
                  </div>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MainNavigation;