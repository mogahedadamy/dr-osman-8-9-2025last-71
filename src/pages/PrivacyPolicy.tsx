import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="سياسة الخصوصية" />
      
      <div className="container mx-auto px-4 pb-20 pt-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary mb-2">سياسة الخصوصية</h1>
              <p className="text-muted-foreground">آخر تحديث: {new Date().toLocaleDateString('ar')}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ تنبيه طبي مهم</h3>
              <p className="text-yellow-700 text-sm leading-relaxed">
                هذا التطبيق مخصص للأغراض التعليمية والمعلوماتية فقط ولا يُغني بأي حال من الأحوال عن الاستشارة الطبية المتخصصة. 
                يجب دائماً استشارة طبيب مختص في حالة وجود أي مخاوف صحية أو أعراض غير طبيعية. 
                لا نتحمل أي مسؤولية عن الاعتماد على المعلومات المقدمة في هذا التطبيق كبديل للرعاية الطبية المهنية.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">1. المعلومات التي نجمعها</h2>
              <p className="text-muted-foreground leading-relaxed">
                تطبيق Dr. Osman يحفظ جميع بياناتك محلياً على جهازك ولا يرسل أي معلومات شخصية إلى خوادم خارجية. 
                نحن نجمع فقط المعلومات التي تقومين بإدخالها طوعاً مثل:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>معلومات الملف الشخصي (الاسم، تاريخ آخر دورة شهرية)</li>
                <li>التذكيرات الطبية والمواعيد</li>
                <li>اليوميات والملاحظات الشخصية</li>
                <li>صور تتبع نمو البطن (محفوظة محلياً)</li>
                <li>بيانات الوزن والقياسات</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">2. كيف نستخدم المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed">
                نستخدم المعلومات المحفوظة محلياً لـ:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>تقديم نصائح مخصصة حسب مرحلة الحمل</li>
                <li>إرسال التذكيرات الطبية في الوقت المناسب</li>
                <li>تتبع تقدم الحمل والصحة العامة</li>
                <li>تحسين تجربة استخدام التطبيق</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">3. حماية البيانات</h2>
              <p className="text-muted-foreground leading-relaxed">
                نحن ملتزمون بحماية خصوصيتك:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>جميع البيانات محفوظة محلياً على جهازك فقط</li>
                <li>لا نجمع أو نشارك معلوماتك الشخصية مع أطراف ثالثة</li>
                <li>يمكنك حذف جميع بياناتك في أي وقت من إعدادات التطبيق</li>
                <li>التطبيق يعمل دون الحاجة لاتصال بالإنترنت</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">4. الإشعارات</h2>
              <p className="text-muted-foreground leading-relaxed">
                نستخدم إشعارات الجهاز المحلية فقط لتذكيرك بالمواعيد والفحوصات الطبية. 
                يمكنك إيقاف هذه الإشعارات في أي وقت من إعدادات التطبيق أو إعدادات جهازك.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">5. حقوقك</h2>
              <p className="text-muted-foreground leading-relaxed">
                لديك الحق في:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>الوصول إلى جميع بياناتك المحفوظة</li>
                <li>تصدير بياناتك أو نسخها احتياطياً</li>
                <li>حذف جميع بياناتك نهائياً</li>
                <li>تعديل أو تحديث معلوماتك في أي وقت</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">6. تحديثات السياسة</h2>
              <p className="text-muted-foreground leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. 
                سنقوم بإشعارك بأي تغييرات مهمة عبر التطبيق.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">7. اتصل بنا</h2>
              <p className="text-muted-foreground leading-relaxed">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">البريد الإلكتروني: privacy@drosman.app</p>
                <p className="text-sm">الهاتف: +966 XXX XXX XXX</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;