import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import UnderDevelopmentScreen from "@/components/shared/UnderDevelopmentScreen";
import { 
  MessageSquare, 
  BookOpen, 
  Bell,
  Wrench,
  Calendar,
  FileText,
  Stethoscope,
  Heart,
  Baby,
  Calculator,
  Camera,
  UserCheck,
  Crown,
  Shield,
  Settings,
  BarChart3,
  Activity
} from "lucide-react";

const EssentialServices = () => {
  const { isAuthenticated } = useAuth();
  const [showDevelopmentScreen, setShowDevelopmentScreen] = useState(false);

  const allServices = [
    // الصف الأول
    {
      title: "المساعد الذكي",
      description: "اسأل أي سؤال واحصل على إجابة فورية",
      icon: <MessageSquare className="w-5 h-5" />,
      path: "/chat",
      gradient: "from-blue-500 to-purple-600",
      emoji: "🤖",
      badge: "AI"
    },
    {
      title: "المكتبة التعليمية", 
      description: "فيديوهات ومقالات متخصصة",
      icon: <BookOpen className="w-5 h-5" />,
      path: "/library",
      gradient: "from-emerald-500 to-teal-600",
      emoji: "📚"
    },
    {
      title: "أدوات الحمل",
      description: "حاسبات وأدوات مفيدة",
      icon: <Calculator className="w-5 h-5" />,
      path: "/tools", 
      gradient: "from-orange-500 to-red-600",
      emoji: "🧮"
    },
    {
      title: "ضغط الدم والسكر",
      description: "تتبع القياسات اليومية",
      icon: <Activity className="w-5 h-5" />,
      path: "/tools?section=bp-glucose",
      gradient: "from-red-500 to-pink-600", 
      emoji: "💉"
    },
    {
      title: "عداد حركة الجنين",
      description: "احسبي حركات طفلك",
      icon: <Baby className="w-5 h-5" />,
      path: "/tools?section=kicks",
      gradient: "from-pink-500 to-rose-600",
      emoji: "👶"
    },
    {
      title: "التذكيرات الذكية",
      description: "لن تفوتي أي موعد مهم",
      icon: <Bell className="w-5 h-5" />,
      path: "/reminders",
      gradient: "from-violet-500 to-purple-600",
      badge: "3",
      emoji: "🔔"
    },
    
    // الصف الثاني
    {
      title: "نصائح د.عثمان",
      description: "نصائح طبية متخصصة",
      icon: <Stethoscope className="w-5 h-5" />,
      path: "/tips",
      gradient: "from-rose-500 to-pink-600",
      emoji: "👨‍⚕️",
      isPremium: true
    },
    {
      title: "عثمانيات الحمل",
      description: "نصائح وإرشادات د.عثمان المتخصصة",
      icon: <Shield className="w-5 h-5" />,
      path: "/osman-tips",
      gradient: "from-red-500 to-rose-600",
      emoji: "🩷",
      isPremium: true
    },
    {
      title: "صور الحمل",
      description: "تتبعي نمو البطن",
      icon: <Camera className="w-5 h-5" />,
      path: "/tools",
      gradient: "from-amber-500 to-orange-600",
      emoji: "📸"
    },
    {
      title: "المواعيد",
      description: "حجز ومتابعة المواعيد",
      icon: <Calendar className="w-5 h-5" />,
      path: "/calendar", 
      gradient: "from-indigo-500 to-blue-600",
      emoji: "📅",
      badge: "جديد"
    },
    
    // الصف الثالث
    {
      title: "نظام الحجوزات",
      description: "احجزي في المركز",
      icon: <Stethoscope className="w-5 h-5" />,
      path: "/booking",
      gradient: "from-green-500 to-emerald-600",
      emoji: "🏥",
      badge: "متاح",
      isUnderDevelopment: true
    },
    {
      title: "متتبع الصحة",
      description: "راقبي صحتك وصحة جنينك",
      icon: <Heart className="w-5 h-5" />,
      path: "/health-tracker",
      gradient: "from-red-500 to-rose-600",
      emoji: "❤️"
    },
    {
      title: "دليل الحمل",
      description: "معلومات شاملة بكل مرحلة",
      icon: <Baby className="w-5 h-5" />,
      path: "/pregnancy-guide",
      gradient: "from-pink-500 to-rose-600",
      emoji: "👶"
    },
    {
      title: "الإحصائيات",
      description: "تتبعي تقدمك وتطورك",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/statistics",
      gradient: "from-purple-500 to-indigo-600",
      emoji: "📊"
    },
    
    // الصف الرابع
    {
      title: "الاشتراك المميز",
      description: "احصلي على المحتوى الكامل",
      icon: <Crown className="w-5 h-5" />,
      path: "/premium-access",
      gradient: "from-yellow-500 to-amber-600",
      emoji: "👑",
      isPremium: true
    },
    {
      title: "تسجيل الدخول",
      description: "ادخلي لحسابك المدفوع",
      icon: <UserCheck className="w-5 h-5" />,
      path: "/login",
      gradient: "from-slate-500 to-gray-600",
      emoji: "🔐"
    },
    {
      title: "الإعدادات",
      description: "خصصي التطبيق حسب احتياجاتك",
      icon: <Settings className="w-5 h-5" />,
      path: "/settings",
      gradient: "from-gray-500 to-slate-600",
      emoji: "⚙️"
    },
    {
      title: "تسجيل اليوم",
      description: "سجلي حالتك اليومية",
      icon: <FileText className="w-5 h-5" />,
      path: "/daily-log",
      gradient: "from-cyan-500 to-blue-600",
      emoji: "📝"
    }
  ];


  return (
    <div className="px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ✨ خدمات التطبيق
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">
          جميع الخدمات والأدوات التي تحتاجينها في مكان واحد
        </p>
      </div>

      {/* 4x4 Services Grid */}
      <div className="grid grid-cols-4 gap-3">
        {allServices.map((service, index) => (
          service.isUnderDevelopment ? (
            <Card 
              key={index}
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer ${
                service.isPremium ? 'bg-gradient-to-br from-primary/5 to-secondary/10 border-2 border-primary/20' : 
                'bg-gradient-to-br from-background to-muted/20'
              }`}
              onClick={() => setShowDevelopmentScreen(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Badge */}
              {service.badge && (
                <Badge className={`absolute -top-1 -right-1 text-[10px] px-1 py-0.5 z-10 ${
                  service.isPremium ? 'bg-gradient-to-r from-primary to-secondary text-white' :
                  'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                } shadow-lg`}>
                  {service.badge}
                </Badge>
              )}
              
              <CardContent className="p-3 text-center relative">
                {/* Modern 3D Icon */}
                <div className={`mx-auto mb-2 w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-tl from-black/10 to-transparent" />
                  <div className="text-white drop-shadow-lg relative z-10">
                    {service.icon}
                  </div>
                  {/* Floating Emoji */}
                  <div className="absolute -top-1 -right-1 text-sm transform rotate-12 filter drop-shadow-md">
                    {service.emoji}
                  </div>
                </div>
                
                {/* Service Title */}
                <h4 className={`font-semibold text-xs mb-1 leading-tight group-hover:text-primary transition-colors duration-300 ${
                  service.isPremium ? 'text-primary' : 
                  'text-foreground'
                }`}>
                  {service.title}
                </h4>
                
                {/* Service Description */}
                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Link to={service.path} key={index}>
              <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                service.isPremium ? 'bg-gradient-to-br from-primary/5 to-secondary/10 border-2 border-primary/20' : 
                'bg-gradient-to-br from-background to-muted/20'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge */}
                {service.badge && (
                  <Badge className={`absolute -top-1 -right-1 text-[10px] px-1 py-0.5 z-10 ${
                    service.isPremium ? 'bg-gradient-to-r from-primary to-secondary text-white' :
                    'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  } shadow-lg`}>
                    {service.badge}
                  </Badge>
                )}
                
                <CardContent className="p-3 text-center relative">
                  {/* Modern 3D Icon */}
                  <div className={`mx-auto mb-2 w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-black/10 to-transparent" />
                    <div className="text-white drop-shadow-lg relative z-10">
                      {service.icon}
                    </div>
                    {/* Floating Emoji */}
                    <div className="absolute -top-1 -right-1 text-sm transform rotate-12 filter drop-shadow-md">
                      {service.emoji}
                    </div>
                  </div>
                  
                  {/* Service Title */}
                  <h4 className={`font-semibold text-xs mb-1 leading-tight group-hover:text-primary transition-colors duration-300 ${
                    service.isPremium ? 'text-primary' : 
                    'text-foreground'
                  }`}>
                    {service.title}
                  </h4>
                  
                  {/* Service Description */}
                  <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        ))}
      </div>

      {/* Quick Stats or Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
        <div className="text-center">
          <h3 className="font-semibold text-primary mb-1">🚀 تطبيق شامل لرعاية الحمل</h3>
          <p className="text-xs text-muted-foreground">
            17 خدمة متكاملة لمتابعة صحية وآمنة لحملك
          </p>
        </div>
      </div>
      
      {/* Under Development Screen */}
      {showDevelopmentScreen && (
        <UnderDevelopmentScreen 
          title="نظام الحجوزات"
          onClose={() => setShowDevelopmentScreen(false)}
        />
      )}
    </div>
  );
};

export default EssentialServices;