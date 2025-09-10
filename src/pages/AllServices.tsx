import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import { AnimatedPage, FadeIn } from "@/components/mobile/AnimatedPage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TouchFeedback from "@/components/mobile/TouchFeedback";
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
  ArrowRight,
  Home,
  UserCheck
} from "lucide-react";

const AllServices = () => {
  const serviceCategories = [
    {
      title: "خدمات طبية",
      services: [
        {
          title: "تسجيل الحالة اليوم",
          description: "سجلي حالتك اليومية والأعراض",
          icon: <FileText className="w-6 h-6" />,
          path: "/daily-log",
          color: "wellness"
        },
        {
          title: "المواعيد والفحوصات",
          description: "تنظيم المواعيد الطبية والفحوصات",
          icon: <Calendar className="w-6 h-6" />,
          path: "/calendar",
          color: "primary"
        },
        {
          title: "نظام الحجوزات",
          description: "حجز مواعيد المركز",
          icon: <Stethoscope className="w-6 h-6" />,
          path: "/booking",
          color: "secondary",
          badge: "جديد"
        }
      ]
    },
    {
      title: "أدوات ومتابعة",
      services: [
        {
          title: "أدوات الحمل",
          description: "تصوير البطن، حاسبة الوزن والأدوات المفيدة",
          icon: <Wrench className="w-6 h-6" />,
          path: "/tools",
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
          title: "التذكيرات الذكية",
          description: "لن تفوتي أي موعد مهم",
          icon: <Bell className="w-6 h-6" />,
          path: "/smart-reminders",
          color: "accent"
        }
      ]
    },
    {
      title: "محتوى تعليمي",
      services: [
        {
          title: "المكتبة التعليمية",
          description: "فيديوهات ومقالات مفيدة",
          icon: <BookOpen className="w-6 h-6" />,
          path: "/library",
          color: "secondary"
        },
        {
          title: "النصائح الأسبوعية",
          description: "نصائح مخصصة لأسبوع الحمل",
          icon: <Calendar className="w-6 h-6" />,
          path: "/tips",
          color: "primary",
          isPremium: true
        },
        {
          title: "عثمانيات الحمل",
          description: "نصائح شخصية من د.عثمان",
          icon: <Heart className="w-6 h-6" />,
          path: "/osman-tips",
          color: "accent",
          isPremium: true
        }
      ]
    },
    {
      title: "تنظيم وتحضير",
      services: [
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
        }
      ]
    },
    {
      title: "حساب ومساعدة",
      services: [
        {
          title: "المساعد الذكي",
          description: "اسألي أي سؤال واحصلي على إجابة",
          icon: <MessageSquare className="w-6 h-6" />,
          path: "/chat",
          color: "primary",
          badge: "متصل"
        },
        {
          title: "الملف الشخصي",
          description: "معلوماتك الشخصية وتقدم الحمل",
          icon: <User className="w-6 h-6" />,
          path: "/profile",
          color: "secondary"
        },
        {
          title: "الاشتراك المدفوع",
          description: "المحتوى المتميز والخصائص الحصرية",
          icon: <Crown className="w-6 h-6" />,
          path: "/premium-access",
          color: "primary",
          isPremium: true
        },
        {
          title: "تسجيل الدخول",
          description: "الدخول لحسابك المدفوع",
          icon: <UserCheck className="w-6 h-6" />,
          path: "/login",
          color: "muted"
        },
        {
          title: "الإعدادات",
          description: "تخصيص التطبيق حسب احتياجاتك",
          icon: <Settings className="w-6 h-6" />,
          path: "/settings",
          color: "muted"
        }
      ]
    }
  ];

  const getColorClasses = (color: string, isPremium = false) => {
    if (isPremium) {
      return {
        bg: "bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 hover:from-primary/15 hover:to-secondary/15",
        icon: "text-primary"
      };
    }

    const colorMap = {
      primary: {
        bg: "bg-primary/8 hover:bg-primary/12 border border-primary/20",
        icon: "text-primary"
      },
      wellness: {
        bg: "bg-wellness/8 hover:bg-wellness/12 border border-wellness/20", 
        icon: "text-wellness"
      },
      accent: {
        bg: "bg-accent/8 hover:bg-accent/12 border border-accent/20",
        icon: "text-accent"
      },
      secondary: {
        bg: "bg-secondary/8 hover:bg-secondary/12 border border-secondary/20",
        icon: "text-secondary"
      },
      muted: {
        bg: "bg-muted/60 hover:bg-muted/80 border border-muted-foreground/20",
        icon: "text-muted-foreground"
      }
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.muted;
  };

  return (
    <MobileLayout>
      <AnimatedPage>
        <FadeIn>
          <MobileHeader 
            title="جميع الخدمات" 
            subtitle="استكشف جميع ما نقدمه"
            showBackButton={true}
          />
        </FadeIn>

        <div className="px-4 pb-6">
          {serviceCategories.map((category, categoryIndex) => (
            <FadeIn key={categoryIndex} delay={0.1 * categoryIndex}>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground mb-3 px-1">
                  {category.title}
                </h2>
                <div className="space-y-3">
                  {category.services.map((service, index) => {
                    const colorClasses = getColorClasses(service.color, service.isPremium);
                    return (
                      <TouchFeedback key={index}>
                        <Link to={service.path}>
                          <Card className={`shadow-card hover:shadow-lg transition-all duration-200 hover:scale-[1.01] ${colorClasses.bg}`}>
                            <CardContent className="p-4 relative">
                              {service.badge && (
                                <Badge 
                                  className="absolute -top-2 -right-2 text-xs"
                                  variant={service.badge === "متصل" ? "default" : "secondary"}
                                >
                                  {service.badge}
                                </Badge>
                              )}
                              {service.isPremium && (
                                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary text-xs text-white">
                                  مميز
                                </Badge>
                              )}
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-current/10 ${colorClasses.icon}`}>
                                  {service.icon}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-foreground mb-1">
                                    {service.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-muted-foreground/60" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </TouchFeedback>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          ))}

          {/* Back to Home */}
          <FadeIn delay={0.5}>
            <div className="mt-8">
              <TouchFeedback>
                <Link to="/">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Home className="w-5 h-5 mr-2" />
                    العودة للرئيسية
                  </Button>
                </Link>
              </TouchFeedback>
            </div>
          </FadeIn>
        </div>
      </AnimatedPage>
    </MobileLayout>
  );
};

export default AllServices;