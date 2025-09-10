import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Bell,
  Crown,
  Settings,
  ChevronLeft,
  Wrench,
  BarChart3,
  ShoppingCart,
  CheckSquare,
  FileText,
  User,
  Stethoscope,
  Heart,
  Shield,
  Users,
  Database
} from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      title: "تسجيل الحالة اليوم",
      description: "سجلي حالتك اليومية والأعراض",
      icon: <FileText className="w-6 h-6" />,
      path: "/daily-log",
      color: "wellness",
      badge: "يومي"
    },
    {
      title: "أدوات الحمل",
      description: "تصوير البطن، حاسبة الوزن والأدوات المفيدة",
      icon: <Wrench className="w-6 h-6" />,
      path: "/tools",
      color: "primary",
      badge: "جديد"
    },
    {
      title: "المساعد الذكي",
      description: "اسألي أي سؤال واحصلي على إجابة",
      icon: <MessageSquare className="w-6 h-6" />,
      path: "/chat",
      color: "secondary",
      badge: "متصل"
    },
    {
      title: "التذكيرات",
      description: "لن تفوتي أي موعد مهم",
      icon: <Bell className="w-6 h-6" />,
      path: "/reminders",
      color: "accent",
      badge: "3"
    }
  ];

  const additionalActions = [
    {
      title: "المواعيد والفحوصات",
      description: "تنظيم المواعيد الطبية والفحوصات",
      icon: <Calendar className="w-6 h-6" />,
      path: "/calendar",
      color: "primary"
    },
    {
      title: "الإحصائيات والتقارير",
      description: "متابعة تطور الحمل والصحة",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/statistics",
      color: "wellness"
    },
    {
      title: "قائمة التسوق",
      description: "قائمة الأشياء المطلوبة للحمل",
      icon: <ShoppingCart className="w-6 h-6" />,
      path: "/shopping-list",
      color: "accent"
    },
    {
      title: "قائمة التحضير",
      description: "استعدادات الولادة والمستشفى",
      icon: <CheckSquare className="w-6 h-6" />,
      path: "/preparation-checklist",
      color: "secondary"
    },
    {
      title: "المكتبة التعليمية",
      description: "فيديوهات ومقالات مفيدة",
      icon: <BookOpen className="w-6 h-6" />,
      path: "/library",
      color: "muted"
    },
    {
      title: "النصائح الأسبوعية",
      description: "نصائح مخصصة لأسبوع الحمل",
      icon: <Calendar className="w-6 h-6" />,
      path: "/tips",
      color: "primary"
    },
    {
      title: "موسوعة الحمل A-Z",
      description: "دليل شامل للمصطلحات والأعراض الطبية",
      icon: <Stethoscope className="w-6 h-6" />,
      path: "/library",
      color: "wellness"
    },
    {
      title: "عثمانيات الحمل",
      description: "نصائح شخصية من د.عثمان",
      icon: <Heart className="w-6 h-6" />,
      path: "/osman-tips",
      color: "accent"
    }
  ];

  const premiumActions = [
    {
      title: "الملف الشخصي",
      description: "معلوماتك الشخصية وتقدم الحمل",
      icon: <User className="w-6 h-6" />,
      path: "/profile",
      color: "secondary"
    },
    {
      title: "الاشتراک المدفوع",
      description: "المحتوى المتميز والخصائص الحصرية",
      icon: <Crown className="w-6 h-6" />,
      path: "/premium-access",
      color: "primary",
      isPremium: true
    },
    {
      title: "الإعدادات",
      description: "تخصيص التطبيق حسب احتياجاتك",
      icon: <Settings className="w-6 h-6" />,
      path: "/settings",
      color: "muted"
    }
  ];

  const getColorClasses = (color: string, isPremium = false) => {
    if (isPremium) {
      return {
        bg: "bg-gradient-to-br from-primary/15 to-secondary/15 border-2 border-primary/30 hover:from-primary/20 hover:to-secondary/20",
        icon: "icon-3d icon-3d-primary rounded-2xl p-4",
        title: "text-primary font-bold"
      };
    }

    const colorMap = {
      primary: {
        bg: "bg-primary/8 hover:bg-primary/15 border border-primary/20",
        icon: "icon-3d icon-3d-primary rounded-2xl p-4",
        title: "text-foreground font-semibold"
      },
      wellness: {
        bg: "bg-wellness/8 hover:bg-wellness/15 border border-wellness/20",
        icon: "icon-3d icon-3d-wellness rounded-2xl p-4",
        title: "text-foreground font-semibold"
      },
      accent: {
        bg: "bg-accent/8 hover:bg-accent/15 border border-accent/20",
        icon: "icon-3d icon-3d-accent rounded-2xl p-4",
        title: "text-foreground font-semibold"
      },
      secondary: {
        bg: "bg-secondary/8 hover:bg-secondary/15 border border-secondary/20",
        icon: "icon-3d icon-3d-secondary rounded-2xl p-4",
        title: "text-foreground font-semibold"
      },
      muted: {
        bg: "bg-muted/60 hover:bg-muted/80 border border-muted-foreground/20",
        icon: "icon-3d rounded-2xl p-4 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5",
        title: "text-foreground font-semibold"
      }
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.muted;
  };

  return (
    <div className="px-4 space-y-4">
      {/* Main Actions */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-3 px-1">
          الخدمات الرئيسية
        </h3>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const colorClasses = getColorClasses(action.color);
            return (
              <Link to={action.path} key={index}>
                <Card className={`shadow-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${colorClasses.bg}`}>
                  <CardContent className="p-4 relative">
                    {action.badge && (
                      <Badge 
                        className="absolute -top-2 -right-2 text-xs"
                        variant={action.badge === "متصل" ? "default" : "secondary"}
                      >
                        {action.badge}
                      </Badge>
                    )}
                     <div className="flex items-center gap-4">
                       <div className={colorClasses.icon}>
                         {action.icon}
                       </div>
                       <div className="flex-1">
                         <h4 className={`text-sm mb-1 ${colorClasses.title}`}>
                           {action.title}
                         </h4>
                         <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                           {action.description}
                         </p>
                       </div>
                       <ChevronLeft className="w-5 h-5 text-muted-foreground/60" />
                     </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Additional Tools */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-3 px-1">
          أدوات إضافية
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {additionalActions.map((action, index) => {
            const colorClasses = getColorClasses(action.color);
            return (
              <Link to={action.path} key={index}>
                <Card className={`shadow-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${colorClasses.bg}`}>
                  <CardContent className="p-3">
                     <div className="text-center space-y-3">
                       <div className={`${colorClasses.icon} mx-auto w-fit`}>
                         {action.icon}
                       </div>
                       <div>
                         <h4 className={`text-xs mb-1 ${colorClasses.title}`}>
                           {action.title}
                         </h4>
                         <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                           {action.description}
                         </p>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Premium & Settings */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-3 px-1">
          إعدادات إضافية
        </h3>
        <div className="space-y-3">
          {premiumActions.map((action, index) => {
            const colorClasses = getColorClasses(action.color, action.isPremium);
            return (
              <Link to={action.path} key={index}>
                <Card className={`shadow-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${colorClasses.bg}`}>
                  <CardContent className="p-4 relative">
                    {action.isPremium && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary text-xs text-white">
                        مميز
                      </Badge>
                    )}
                     <div className="flex items-center gap-4">
                       <div className={colorClasses.icon}>
                         {action.icon}
                       </div>
                       <div className="flex-1">
                         <h4 className={`text-sm mb-1 ${colorClasses.title}`}>
                           {action.title}
                         </h4>
                         <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                           {action.description}
                         </p>
                       </div>
                       <ChevronLeft className="w-5 h-5 text-muted-foreground/60" />
                     </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;