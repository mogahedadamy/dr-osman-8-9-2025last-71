import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import { 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Home, 
  Smartphone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { useEffect } from 'react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // الحصول على البيانات من الصفحة السابقة
  const planName = location.state?.planName || 'خطة الاشتراك';
  const fullName = location.state?.fullName || 'المستخدم';

  useEffect(() => {
    // تسجيل الحدث في console للمراقبة
    console.log('Payment request submitted successfully', {
      planName,
      fullName,
      timestamp: new Date().toISOString()
    });
  }, [planName, fullName]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    const message = `مرحباً، لقد قمت بإرسال طلب اشتراك في ${planName} ولدي استفسار.`;
    const whatsappUrl = `https://wa.me/249903646148?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="تم الإرسال بنجاح" showBack={false} />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* رسالة النجاح الرئيسية */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-700 mb-4">
            تم إرسال طلبك بنجاح! 🎉
          </h1>
          
          <p className="text-lg text-muted-foreground">
            شكراً لك <span className="font-semibold text-primary">{fullName}</span>
          </p>
          
          <p className="text-muted-foreground">
            تم إرسال طلب اشتراكك في <span className="font-semibold">{planName}</span> بنجاح
          </p>
        </div>

        {/* تفاصيل ما سيحدث الآن */}
        <Card className="mb-6 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-green-700">
              <Clock className="w-5 h-5" />
              <span>ما سيحدث الآن؟</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">مراجعة فورية</p>
                  <p className="text-sm text-muted-foreground">
                    تم إرسال طلبك تلقائياً إلى فريق المراجعة عبر WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full text-yellow-600 font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">المراجعة والموافقة</p>
                  <p className="text-sm text-muted-foreground">
                    سيتم مراجعة إثبات الدفع والموافقة على طلبك خلال 24 ساعة
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full text-green-600 font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">استلام بيانات الدخول</p>
                  <p className="text-sm text-muted-foreground">
                    ستصلك بيانات الدخول (اسم المستخدم وكلمة المرور) عبر WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full text-purple-600 font-semibold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium">بدء الاستمتاع بالمحتوى</p>
                  <p className="text-sm text-muted-foreground">
                    سجل دخولك باستخدام البيانات المرسلة واستمتع بجميع المحتوى المدفوع
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية مهمة */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 space-x-reverse">
              <MessageSquare className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  سيتم التواصل معك عبر WhatsApp
                </h3>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p>
                    • ستصلك رسالة تأكيد بمراجعة طلبك خلال ساعات قليلة
                  </p>
                  <p>
                    • بيانات الدخول ستصل خلال 24 ساعة كحد أقصى
                  </p>
                  <p>
                    • تأكد من تشغيل إشعارات WhatsApp
                  </p>
                  <p>
                    • احتفظ برقم طلبك للمراجعة: <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">#{Date.now().toString().slice(-6)}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أزرار التنقل */}
        <div className="space-y-4">
          <Button 
            onClick={handleBackToHome}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            size="lg"
          >
            <Home className="w-5 h-5 ml-2" />
            العودة إلى الصفحة الرئيسية
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline"
              onClick={handleContactSupport}
              className="w-full"
            >
              <Smartphone className="w-4 h-4 ml-2" />
              تواصل معنا عبر WhatsApp
            </Button>

            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              <Mail className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
          </div>
        </div>

        {/* أسئلة شائعة سريعة */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>أسئلة شائعة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">متى ستصل بيانات الدخول؟</p>
              <p className="text-muted-foreground">خلال 24 ساعة كحد أقصى عبر WhatsApp</p>
            </div>
            
            <div>
              <p className="font-medium mb-1">ماذا لو لم تصل الرسالة؟</p>
              <p className="text-muted-foreground">تواصل معنا عبر WhatsApp مع ذكر رقم طلبك</p>
            </div>
            
            <div>
              <p className="font-medium mb-1">هل يمكنني استخدام التطبيق على عدة أجهزة؟</p>
              <p className="text-muted-foreground">نعم، يمكنك تسجيل الدخول على جميع أجهزتك</p>
            </div>
            
            <div>
              <p className="font-medium mb-1">ماذا لو تم رفض طلبي؟</p>
              <p className="text-muted-foreground">سنتواصل معك لتوضيح السبب وحل المشكلة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;