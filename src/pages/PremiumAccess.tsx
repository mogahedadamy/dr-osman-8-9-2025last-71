import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import { SubscriptionPlan } from '@/types/auth';
import { 
  Crown, 
  Check, 
  Star, 
  Video, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Bell,
  Headphones,
  CreditCard,
  Clock
} from 'lucide-react';

const PremiumAccess = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');

  // خطط الاشتراك المتاحة
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'الاشتراك الشهري',
      price: 50,
      currency: 'ريال سعودي',
      duration: 30,
      features: [
        'جميع المحتوى المدفوع',
        'فيديوهات تعليمية حصرية',
        'استشارات طبية متقدمة',
        'تقارير تطور مفصلة',
        'دعم فني',
        'تحديثات دورية'
      ]
    },
    {
      id: 'yearly',
      name: 'الاشتراك السنوي',
      price: 500,
      currency: 'ريال سعودي',
      duration: 365,
      features: [
        'جميع مميزات الاشتراك الشهري',
        'خصم 17% (وفر 100 ريال)',
        'أولوية في الدعم الفني',
        'محتوى حصري إضافي',
        'جلسات استشارية مجانية',
        'تطبيق محمول مجاني'
      ],
      isPopular: true
    }
  ];

  // مميزات النظام المدفوع
  const premiumFeatures = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "مكتبة كاملة من المقالات",
      description: "أكثر من 100+ مقال طبي متخصص في الحمل والولادة"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "فيديوهات تعليمية حصرية",
      description: "مجموعة شاملة من الفيديوهات التوضيحية والتمارين"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "استشارات طبية متقدمة",
      description: "نصائح وإرشادات من د. عثمان شخصياً"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "تقارير تطور تفصيلية",
      description: "متابعة دقيقة لتطور الحمل أسبوعياً"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "تذكيرات طبية شخصية",
      description: "تنبيهات للفحوصات والمواعيد المهمة"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "دعم فني متميز",
      description: "مساعدة فورية عبر WhatsApp على مدار الساعة"
    }
  ];

  // تفاصيل البنك
  const bankDetails = {
    accountNumber: "3691314",
    accountHolder: "مجاهد ادم يعقوب يحى",
    bankName: "بنك الخرطوم – فرع الحصاحيصا",
    iban: "SD21BKKH00003691314" // مثال - يرجى التأكد من الرقم الصحيح
  };

  const handleSubscribe = () => {
    navigate('/payment-submission', { 
      state: { 
        selectedPlan: subscriptionPlans.find(p => p.id === selectedPlan) 
      } 
    });
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="الاشتراك المدفوع" showBack />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dr. Osman Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            احصل على تجربة شاملة ومتكاملة لمتابعة الحمل والولادة مع المحتوى الطبي المتخصص
          </p>
        </div>

        {/* Premium Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Plans */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">اختر خطة الاشتراك المناسبة</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-primary shadow-lg scale-105' 
                    : 'hover:shadow-md'
                } ${plan.isPopular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500">
                    <Star className="w-3 h-3 ml-1" />
                    الأكثر شعبية
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-center justify-center space-x-1 space-x-reverse">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.currency}</span>
                  </div>
                  <CardDescription>
                    {plan.duration === 30 ? 'كل شهر' : 'كل سنة'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3 space-x-reverse">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bank Details */}
        <Card className="max-w-2xl mx-auto mb-8 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <CreditCard className="w-5 h-5 text-primary" />
              <span>تفاصيل التحويل البنكي</span>
            </CardTitle>
            <CardDescription>
              قم بتحويل المبلغ إلى الحساب التالي واحتفظ بصورة من الإيصال
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">رقم الحساب</p>
                <p className="font-mono text-lg font-semibold bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {bankDetails.accountNumber}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">اسم صاحب الحساب</p>
                <p className="font-semibold">{bankDetails.accountHolder}</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm text-muted-foreground">البنك</p>
                <p className="font-semibold">{bankDetails.bankName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <Button 
            onClick={handleSubscribe}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
            size="lg"
          >
            <CreditCard className="w-5 h-5 ml-2" />
            اشترك الآن - {subscriptionPlans.find(p => p.id === selectedPlan)?.price} {subscriptionPlans.find(p => p.id === selectedPlan)?.currency}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">لديك حساب مدفوع بالفعل؟</p>
            <Button 
              variant="ghost" 
              onClick={handleLoginRedirect}
              className="text-primary hover:text-primary/80"
            >
              تسجيل الدخول إلى حسابك
            </Button>
          </div>
        </div>

        {/* Important Notes */}
        <Card className="max-w-2xl mx-auto mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 space-x-reverse">
              <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-2">ملاحظات مهمة:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>سيتم مراجعة طلبك خلال 24 ساعة من الدفع</li>
                  <li>ستصلك بيانات الدخول عبر WhatsApp</li>
                  <li>يمكنك استخدام التطبيق على جميع الأجهزة</li>
                  <li>الدعم الفني متاح على مدار الساعة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumAccess;