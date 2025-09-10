import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { useCapacitorFeatures } from "@/hooks/useCapacitorFeatures";
import { 
  Download, 
  Smartphone, 
  Camera, 
  Bell, 
  Wifi, 
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const AppInstructions = () => {
  const { isInstallable, isInstalled, isIOS, installApp, getInstallInstructions } = usePWA();
  const { isNativeApp, getDeviceInfo } = useCapacitorFeatures();
  const deviceInfo = getDeviceInfo();
  const instructions = getInstallInstructions();

  const features = [
    {
      icon: <Download className="w-6 h-6 text-primary" />,
      title: "تثبيت التطبيق",
      description: "احصلي على تجربة أصلية مع التطبيق المثبت",
      status: isInstalled ? "مثبت" : isInstallable ? "متاح" : "غير متاح",
      color: isInstalled ? "green" : isInstallable ? "blue" : "gray"
    },
    {
      icon: <Camera className="w-6 h-6 text-secondary" />,
      title: "كاميرا الجهاز",
      description: "التقطي صور البطن مباشرة من الكاميرا",
      status: isNativeApp ? "متاح" : "الويب فقط",
      color: isNativeApp ? "green" : "yellow"
    },
    {
      icon: <Bell className="w-6 h-6 text-accent" />,
      title: "الإشعارات المحلية",
      description: "تذكيرات تلقائية حتى لو كان التطبيق مغلق",
      status: isNativeApp ? "متاح" : "محدود",
      color: isNativeApp ? "green" : "yellow"
    },
    {
      icon: <Wifi className="w-6 h-6 text-wellness" />,
      title: "العمل بدون إنترنت",
      description: "استخدمي التطبيق حتى بدون اتصال",
      status: "متاح دائماً",
      color: "green"
    }
  ];

  const getStatusIcon = (color: string) => {
    switch (color) {
      case "green":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "yellow":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "blue":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="دليل الاستخدام" />
      
      <div className="container mx-auto px-4 pb-20 pt-6 space-y-6">
        {/* Device Info */}
        <Card className="shadow-card border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              معلومات الجهاز
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">النوع:</span>
                <span className="mr-2">{deviceInfo.platform === 'web' ? 'متصفح ويب' : 'تطبيق محمول'}</span>
              </div>
              <div>
                <span className="font-medium">النظام:</span>
                <span className="mr-2">{deviceInfo.operatingSystem}</span>
              </div>
              {deviceInfo.model !== 'Unknown' && (
                <div className="col-span-2">
                  <span className="font-medium">الجهاز:</span>
                  <span className="mr-2">{deviceInfo.model}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              حالة الميزات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(feature.color)}
                  <Badge className={getStatusBadgeColor(feature.color)}>
                    {feature.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Installation Instructions */}
        {!isInstalled && (
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">{instructions.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              
              {isInstallable && !isIOS && (
                <Button onClick={installApp} className="w-full">
                  <Download className="w-4 h-4 ml-2" />
                  تثبيت التطبيق الآن
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {isInstalled && (
          <Card className="shadow-card border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
                تم تثبيت التطبيق بنجاح! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-300">
                يمكنك الآن استخدام جميع ميزات التطبيق المحلية بكامل إمكانياتها
              </p>
            </CardContent>
          </Card>
        )}

        {/* General Tips */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>نصائح للاستخدام الأمثل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  للحصول على أفضل تجربة، قومي بتثبيت التطبيق على شاشتك الرئيسية
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  فعلي الإشعارات من إعدادات التطبيق لتلقي التذكيرات الطبية
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  استخدمي التطبيق حتى بدون إنترنت - جميع بياناتك محفوظة محلياً
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-wellness rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  اعملي نسخة احتياطية من بياناتك دورياً من صفحة الإعدادات
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppInstructions;