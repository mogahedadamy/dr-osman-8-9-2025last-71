import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePregnancyTracking } from "@/hooks/usePregnancyTracking";
import { localDB } from "@/lib/localDatabase";

interface MedicalTest {
  id: string;
  name: string;
  week: string;
  trimester: number;
  type: 'mandatory' | 'recommended' | 'conditional';
  description: string;
  completed: boolean;
}

const MedicalSchedule = () => {
  const { toast } = useToast();
  const { currentWeek } = usePregnancyTracking();
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [loading, setLoading] = useState(true);

  // تحميل الفحوصات من قاعدة البيانات المحلية
  const loadTests = async () => {
    try {
      const savedTests = await localDB.getAll('medicalTests');
      if (savedTests && savedTests.length > 0) {
        setTests(savedTests as MedicalTest[]);
      } else {
        // إذا لم توجد فحوصات محفوظة، استخدم البيانات الافتراضية
        const defaultTests: MedicalTest[] = [
          {
            id: '1',
            name: 'فحص الدم الشامل',
            week: '6-8',
            trimester: 1,
            type: 'mandatory',
            description: 'فحص مستوى الهيموجلوبين وفصيلة الدم وعامل Rh',
            completed: false
          },
    {
      id: '2',
      name: 'فحص البول',
      week: '6-8',
      trimester: 1,
      type: 'mandatory',
      description: 'للكشف عن التهابات المسالك البولية والبروتين',
      completed: false
    },
    {
      id: '3',
      name: 'السونار الأول',
      week: '8-12',
      trimester: 1,
      type: 'mandatory',
      description: 'تأكيد الحمل وتحديد عدد الأجنة وسماع نبضات القلب',
      completed: false
    },
    {
      id: '4',
      name: 'فحص الحصبة الألمانية',
      week: '8-10',
      trimester: 1,
      type: 'recommended',
      description: 'للتأكد من المناعة ضد الحصبة الألمانية',
      completed: false
    },
    {
      id: '5',
      name: 'فحص الغدة الدرقية',
      week: '9-11',
      trimester: 1,
      type: 'recommended',
      description: 'فحص TSH للتأكد من سلامة وظائف الغدة الدرقية',
      completed: false
    },
    {
      id: '6',
      name: 'فحص متلازمة داون',
      week: '11-14',
      trimester: 1,
      type: 'recommended',
      description: 'فحص الشفافية القفوية والفحوصات الكيميائية',
      completed: false
    },
    {
      id: '7',
      name: 'السونار التفصيلي',
      week: '18-22',
      trimester: 2,
      type: 'mandatory',
      description: 'فحص تشوهات الجنين وتحديد الجنس',
      completed: false
    },
    {
      id: '8',
      name: 'فحص سكر الحمل',
      week: '24-28',
      trimester: 2,
      type: 'mandatory',
      description: 'اختبار تحمل الجلوكوز لكشف سكر الحمل',
      completed: false
    },
    {
      id: '9',
      name: 'تحليل مستوى الحديد',
      week: '24-28',
      trimester: 2,
      type: 'recommended',
      description: 'للكشف عن فقر الدم وتحديد الحاجة للمكملات',
      completed: false
    },
    {
      id: '10',
      name: 'فحص البكتيريا العقدية',
      week: '35-37',
      trimester: 3,
      type: 'mandatory',
      description: 'فحص GBS للوقاية من عدوى المولود',
      completed: false
    },
    {
      id: '11',
      name: 'تقييم نمو الجنين',
      week: '36-40',
      trimester: 3,
      type: 'mandatory',
      description: 'سونار لتقييم وضعية الجنين ومستوى السائل الأمنيوسي',
      completed: false
          },
          {
            id: '12',
            name: 'مراقبة نبضات الجنين',
            week: '37-40',
            trimester: 3,
            type: 'recommended' as const,
            description: 'NST لمراقبة صحة الجنين قبل الولادة',
            completed: false
          }
        ];
        
        // حفظ البيانات الافتراضية في قاعدة البيانات
        for (const test of defaultTests) {
          await localDB.save('medicalTests', test);
        }
        setTests(defaultTests);
      }
    } catch (error) {
      console.error('خطأ في تحميل الفحوصات:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة الفحص
  const toggleTestCompletion = async (id: string) => {
    try {
      const updatedTests = tests.map(test => 
        test.id === id ? { ...test, completed: !test.completed } : test
      );
      setTests(updatedTests);
      
      // حفظ التحديث في قاعدة البيانات
      const updatedTest = updatedTests.find(t => t.id === id);
      if (updatedTest) {
        await localDB.save('medicalTests', updatedTest);
      }
      
      const test = tests.find(t => t.id === id);
      toast({
        title: test?.completed ? "تم إلغاء تأشير الفحص" : "تم تأشير الفحص كمكتمل",
        description: test?.name
      });
    } catch (error) {
      toast({
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء تحديث حالة الفحص",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const getTestsByTrimester = (trimester: number) => {
    return tests.filter(test => test.trimester === trimester);
  };

  const getTestStatus = (weekRange: string) => {
    const [start, end] = weekRange.split('-').map(w => parseInt(w.trim()));
    if (currentWeek < start) return 'upcoming';
    if (currentWeek >= start && currentWeek <= end) return 'current';
    return 'overdue';
  };

  const getStatusColor = (status: string, type: string) => {
    if (status === 'current') return type === 'mandatory' ? 'bg-destructive' : 'bg-amber-500';
    if (status === 'overdue') return 'bg-destructive';
    return 'bg-muted-foreground';
  };

  const completedCount = tests.filter(test => test.completed).length;
  const completionPercentage = (completedCount / tests.length) * 100;

  const renderTrimester = (trimester: number) => {
    const trimesterTests = getTestsByTrimester(trimester);
    const trimesterNames = ['', 'الثلث الأول', 'الثلث الثاني', 'الثلث الثالث'];
    
    return (
      <Card key={trimester} className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {trimesterNames[trimester]} (الأسابيع {trimester === 1 ? '1-12' : trimester === 2 ? '13-26' : '27-40'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trimesterTests.map(test => {
            const status = getTestStatus(test.week);
            return (
              <div key={test.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Checkbox
                  checked={test.completed}
                  onCheckedChange={() => toggleTestCompletion(test.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${test.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {test.name}
                    </h4>
                    <Badge 
                      variant={test.type === 'mandatory' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {test.type === 'mandatory' ? 'إجباري' : 'مستحب'}
                    </Badge>
                    {status === 'current' && !test.completed && (
                      <Badge className={`text-xs text-white ${getStatusColor(status, test.type)}`}>
                        مطلوب الآن
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      الأسبوع {test.week}
                    </span>
                    {test.completed && (
                      <span className="flex items-center gap-1 text-wellness">
                        <CheckCircle className="w-3 h-3" />
                        مكتمل
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">جاري تحميل الفحوصات...</p>
        </div>
      ) : (
        <>
      <div className="text-center">
        <span className="text-sm font-medium">الأسبوع الحالي من الحمل: {currentWeek}</span>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">{completedCount}</div>
              <div className="text-sm text-muted-foreground">فحص مكتمل</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{tests.length - completedCount}</div>
              <div className="text-sm text-muted-foreground">فحص متبقي</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-wellness">{completionPercentage.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">نسبة الإنجاز</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Tests Alert */}
      {tests.some(test => getTestStatus(test.week) === 'current' && !test.completed) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-bold text-destructive">فحوصات مطلوبة الآن</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              لديك فحوصات مهمة يجب إجراؤها في الأسبوع الحالي. يرجى حجز موعد مع طبيبك.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tests by Trimester */}
      <div className="space-y-4">
        {[1, 2, 3].map(trimester => renderTrimester(trimester))}
      </div>

      {/* Important Notes */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">📋 ملاحظات مهمة:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• المواعيد المذكورة هي إرشادية، استشيري طبيبك للتوقيت الدقيق</li>
          <li>• الفحوصات الإجبارية ضرورية لسلامة الأم والجنين</li>
          <li>• بعض الفحوصات قد تختلف حسب التاريخ الطبي والمخاطر</li>
          <li>• احرصي على أخذ نسخة من النتائج لكل زيارة</li>
        </ul>
      </div>
        </>
      )}
    </div>
  );
};

export default MedicalSchedule;