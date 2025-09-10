import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, Heart, Lock, FileText, UserCheck, AlertTriangle } from "lucide-react";

const PrivacyPolicyDetailed = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">سياسة الخصوصية</CardTitle>
            <p className="text-muted-foreground">
              تطبيق Dr. Osman - رفيق الحمل الذكي
            </p>
            <p className="text-sm text-muted-foreground">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </CardHeader>
        </Card>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            
            {/* مقدمة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  مقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  نحن في تطبيق "Dr. Osman - رفيق الحمل الذكي" نقدر خصوصيتك ونلتزم بحماية 
                  بياناتك الشخصية والطبية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 inline mr-2 text-primary" />
                    تنويه طبي مهم: هذا التطبيق مخصص للأغراض التعليمية والمعلوماتية فقط 
                    ولا يُغني عن الاستشارة الطبية المتخصصة.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* البيانات التي نجمعها */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  البيانات التي نجمعها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">1. البيانات الشخصية:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>تاريخ آخر دورة شهرية</li>
                      <li>تاريخ الولادة المتوقع</li>
                      <li>الوزن والطول (اختياري)</li>
                      <li>عدد مرات الحمل السابقة (اختياري)</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">2. بيانات الاستخدام:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>التذكيرات والمواعيد المحفوظة</li>
                      <li>الأسئلة المطروحة على المساعد الذكي</li>
                      <li>الصور المحفوظة لتتبع نمو البطن (محلياً فقط)</li>
                      <li>إعدادات التطبيق والتفضيلات</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">3. البيانات التقنية:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>نوع الجهاز ونظام التشغيل</li>
                      <li>إعدادات اللغة والمنطقة الزمنية</li>
                      <li>بيانات الأخطاء والأداء لتحسين التطبيق</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* كيفية استخدام البيانات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  كيفية استخدام البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">الأغراض الأساسية:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>حساب عمر الحمل وتقديم النصائح المناسبة</li>
                      <li>إرسال التذكيرات الطبية والمواعيد</li>
                      <li>توفير محتوى تعليمي مخصص لمرحلة الحمل</li>
                      <li>الإجابة على استفسارات المستخدمات</li>
                      <li>حفظ البيانات محلياً لتجربة أفضل</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">أغراض أخرى:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>تحسين أداء التطبيق وإصلاح الأخطاء</li>
                      <li>تطوير مميزات جديدة بناء على احتياجات المستخدمات</li>
                      <li>ضمان أمان التطبيق ومنع سوء الاستخدام</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* حماية البيانات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  حماية البيانات والأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">التخزين المحلي:</h4>
                    <p className="text-sm text-muted-foreground">
                      جميع بياناتك الشخصية والطبية محفوظة محلياً على جهازك فقط. 
                      لا نقوم برفع هذه البيانات لخوادم خارجية.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">التشفير:</h4>
                    <p className="text-sm text-muted-foreground">
                      البيانات الحساسة مشفرة باستخدام معايير التشفير المتقدمة 
                      لضمان عدم وصول أطراف غير مخولة إليها.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">الصلاحيات:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>الكاميرا: لالتقاط صور تتبع نمو البطن (اختياري)</li>
                      <li>الإشعارات: لإرسال التذكيرات الطبية</li>
                      <li>التخزين: لحفظ البيانات والصور محلياً</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* مشاركة البيانات */}
            <Card>
              <CardHeader>
                <CardTitle>مشاركة البيانات مع أطراف ثالثة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    ✅ نحن لا نقوم ببيع أو مشاركة بياناتك الشخصية أو الطبية مع أي أطراف ثالثة.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">الاستثناءات الوحيدة:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                    <li>عند وجود طلب قانوني من السلطات المختصة</li>
                    <li>لحماية حقوقنا أو سلامة المستخدمات</li>
                    <li>في حالة الطوارئ الطبية (بموافقتك)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* حقوق المستخدم */}
            <Card>
              <CardHeader>
                <CardTitle>حقوقك كمستخدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">حقوق الوصول والتحكم:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>الحق في معرفة البيانات المجمعة عنك</li>
                      <li>الحق في تصحيح البيانات الخاطئة</li>
                      <li>الحق في حذف حسابك وبياناتك</li>
                      <li>الحق في تقييد معالجة بياناتك</li>
                      <li>الحق في نقل بياناتك</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">كيفية ممارسة حقوقك:</h4>
                    <p className="text-sm text-muted-foreground">
                      يمكنك ممارسة هذه الحقوق من خلال إعدادات التطبيق أو 
                      بالتواصل معنا عبر البريد الإلكتروني: support@drosman.app
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* التحديثات */}
            <Card>
              <CardHeader>
                <CardTitle>تحديثات سياسة الخصوصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في 
                  ممارساتنا أو لأسباب قانونية أو تنظيمية. سنخطرك بأي تغييرات 
                  جوهرية من خلال التطبيق أو عبر البريد الإلكتروني.
                </p>
              </CardContent>
            </Card>

            {/* الاتصال */}
            <Card>
              <CardHeader>
                <CardTitle>الاتصال بنا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    إذا كان لديك أي استفسارات حول سياسة الخصوصية أو ممارسات 
                    حماية البيانات، يرجى التواصل معنا:
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="space-y-1 text-sm">
                      <p><strong>البريد الإلكتروني:</strong> support@drosman.app</p>
                      <p><strong>موقع الدعم:</strong> www.drosman.app/support</p>
                      <p><strong>العنوان:</strong> [يجب إضافة العنوان الفعلي]</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-8" />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>
                © 2024 تطبيق Dr. Osman - رفيق الحمل الذكي. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PrivacyPolicyDetailed;