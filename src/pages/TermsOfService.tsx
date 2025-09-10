import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="شروط الاستخدام" />
      
      <div className="container mx-auto px-4 pb-20 pt-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary mb-2">شروط الاستخدام</h1>
              <p className="text-muted-foreground">آخر تحديث: {new Date().toLocaleDateString('ar')}</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">1. قبول الشروط</h2>
              <p className="text-muted-foreground leading-relaxed">
                باستخدامك لتطبيق Dr. Osman، فإنك توافقين على الالتزام بهذه الشروط والأحكام. 
                إذا كنت لا توافقين على أي من هذه الشروط، يرجى عدم استخدام التطبيق.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">2. وصف الخدمة</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dr. Osman هو تطبيق مساعد للحوامل يقدم:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>نصائح طبية عامة للحمل</li>
                <li>تذكيرات للمواعيد والفحوصات</li>
                <li>أدوات تتبع الحمل والصحة</li>
                <li>مكتبة تعليمية للأمهات</li>
                <li>مساعد ذكي للإجابة على الأسئلة العامة</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">3. إخلاء المسؤولية الطبية</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">تنبيه مهم:</h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                  هذا التطبيق مخصص لأغراض تعليمية وإعلامية فقط ولا يعتبر بديلاً عن الاستشارة الطبية المهنية. 
                  يجب دائماً استشارة طبيبك أو مقدم الرعاية الصحية للحصول على نصائح طبية شخصية.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>لا نقدم تشخيصاً طبياً أو علاجاً</li>
                <li>المعلومات المقدمة عامة ولا تناسب جميع الحالات</li>
                <li>يجب مراجعة الطبيب في حالة أي أعراض مقلقة</li>
                <li>التطبيق لا يحل محل المتابعة الطبية المنتظمة</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">4. المسؤوليات</h2>
              <p className="text-muted-foreground leading-relaxed">
                أنت مسؤولة عن:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>دقة المعلومات التي تدخلينها في التطبيق</li>
                <li>الحفاظ على أمان جهازك وبياناتك</li>
                <li>استخدام التطبيق وفقاً لهذه الشروط</li>
                <li>عدم مشاركة معلومات طبية خاطئة مع الآخرين</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">5. الاستخدام المقبول</h2>
              <p className="text-muted-foreground leading-relaxed">
                يُمنع استخدام التطبيق لـ:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-6">
                <li>أي أغراض غير قانونية أو ضارة</li>
                <li>محاولة الوصول غير المصرح به للبيانات</li>
                <li>نسخ أو توزيع محتوى التطبيق دون إذن</li>
                <li>التدخل في عمل التطبيق أو خوادمه</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">6. الملكية الفكرية</h2>
              <p className="text-muted-foreground leading-relaxed">
                جميع حقوق الملكية الفكرية للتطبيق ومحتواه محفوظة لفريق Dr. Osman. 
                يحق لك استخدام التطبيق للأغراض الشخصية فقط.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">7. تحديث الشروط</h2>
              <p className="text-muted-foreground leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. 
                سيتم إشعارك بالتغييرات المهمة عبر التطبيق أو البريد الإلكتروني.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">8. إنهاء الخدمة</h2>
              <p className="text-muted-foreground leading-relaxed">
                يمكنك التوقف عن استخدام التطبيق وحذف جميع بياناتك في أي وقت. 
                نحتفظ بالحق في إنهاء أو تعليق الخدمة في حالة انتهاك هذه الشروط.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary">9. اتصل بنا</h2>
              <p className="text-muted-foreground leading-relaxed">
                لأي استفسارات حول شروط الاستخدام:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">البريد الإلكتروني: support@drosman.app</p>
                <p className="text-sm">الهاتف: +966 XXX XXX XXX</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;