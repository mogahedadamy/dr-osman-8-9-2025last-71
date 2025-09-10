import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import BottomNavigation from "@/components/shared/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  trimester: 1 | 2 | 3;
  completed: boolean;
  dueWeek?: number;
}

const PreparationChecklist = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([
    // First Trimester
    { id: 1, title: "تأكيد الحمل مع الطبيب", description: "زيارة الطبيب للتأكد من الحمل وبدء المتابعة", category: "طبي", priority: 'high', trimester: 1, completed: true, dueWeek: 8 },
    { id: 2, title: "بدء تناول حمض الفوليك", description: "تناول 400 ميكروغرام يومياً", category: "صحة", priority: 'high', trimester: 1, completed: true, dueWeek: 6 },
    { id: 3, title: "التوقف عن التدخين والكحول", description: "الإقلاع التام عن المواد الضارة", category: "صحة", priority: 'high', trimester: 1, completed: true, dueWeek: 4 },
    
    // Second Trimester
    { id: 4, title: "فحص السونار المفصل", description: "فحص تشوهات الجنين والتأكد من سلامته", category: "طبي", priority: 'high', trimester: 2, completed: false, dueWeek: 20 },
    { id: 5, title: "معرفة جنس الطفل", description: "إذا كنت ترغبين في معرفة جنس الطفل", category: "طبي", priority: 'medium', trimester: 2, completed: false, dueWeek: 18 },
    { id: 6, title: "البدء في شراء ملابس الحمل", description: "شراء ملابس مريحة للحمل", category: "شخصي", priority: 'medium', trimester: 2, completed: true, dueWeek: 16 },
    
    // Third Trimester
    { id: 7, title: "إعداد حقيبة المستشفى", description: "تحضير الحقيبة للولادة", category: "ولادة", priority: 'high', trimester: 3, completed: false, dueWeek: 36 },
    { id: 8, title: "اختيار مستشفى الولادة", description: "تحديد مكان الولادة والتسجيل", category: "ولادة", priority: 'high', trimester: 3, completed: false, dueWeek: 32 },
    { id: 9, title: "تحضير غرفة الطفل", description: "تجهيز السرير والأثاث اللازم", category: "منزل", priority: 'medium', trimester: 3, completed: false, dueWeek: 35 },
    { id: 10, title: "شراء مقعد السيارة", description: "مقعد أمان للطفل في السيارة", category: "أمان", priority: 'high', trimester: 3, completed: false, dueWeek: 38 },
    { id: 11, title: "دورة تحضير للولادة", description: "الالتحاق بدورة تعليمية للولادة", category: "تعليمي", priority: 'medium', trimester: 3, completed: false, dueWeek: 30 },
    { id: 12, title: "تحضير خطة الولادة", description: "كتابة رغباتك وتفضيلاتك للولادة", category: "ولادة", priority: 'medium', trimester: 3, completed: false, dueWeek: 34 }
  ]);

  const currentWeek = 26; // Should come from user profile

  const toggleItem = (id: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newCompleted = !item.completed;
        if (newCompleted) {
          toast({
            title: "مهمة مكتملة! 🎉",
            description: `تم إنجاز: ${item.title}`,
          });
        }
        return { ...item, completed: newCompleted };
      }
      return item;
    }));
  };

  const getProgressByTrimester = (trimester: number) => {
    const trimesterItems = items.filter(item => item.trimester === trimester);
    const completed = trimesterItems.filter(item => item.completed).length;
    return (completed / trimesterItems.length) * 100;
  };

  const getItemsByTrimester = (trimester: number) => {
    return items.filter(item => item.trimester === trimester);
  };

  const getItemStatus = (item: ChecklistItem) => {
    if (item.completed) return 'completed';
    if (item.dueWeek && currentWeek > item.dueWeek) return 'overdue';
    if (item.dueWeek && currentWeek >= item.dueWeek - 2) return 'urgent';
    return 'pending';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'طبي': '🩺',
      'صحة': '💊',
      'شخصي': '👤',
      'ولادة': '🤱',
      'منزل': '🏠',
      'أمان': '🛡️',
      'تعليمي': '📚'
    };
    return emojis[category] || '📝';
  };

  const totalCompleted = items.filter(item => item.completed).length;
  const totalProgress = (totalCompleted / items.length) * 100;

  const bottomNavItems = [
    {
      icon: <CheckCircle className="w-5 h-5 mb-1 text-primary" />,
      label: "قائمة المهام"
    },
    {
      icon: <Calendar className="w-5 h-5 mb-1 text-secondary" />,
      label: "التقويم"
    },
    {
      icon: <Clock className="w-5 h-5 mb-1 text-accent" />,
      label: "التوقيتات"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageHeader title="دليل الاستعداد للولادة" />

      <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Overall Progress */}
        <Card className="shadow-card bg-primary-light">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-foreground">{Math.round(totalProgress)}%</div>
              <div className="text-muted-foreground">مكتمل من التحضيرات</div>
            </div>
            <Progress value={totalProgress} className="h-3 mb-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{totalCompleted} مكتمل</span>
              <span>{items.length - totalCompleted} متبقي</span>
            </div>
          </CardContent>
        </Card>

        {/* Trimester Progress */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(trimester => (
            <Card key={trimester} className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-primary">
                  الثلث {trimester === 1 ? 'الأول' : trimester === 2 ? 'الثاني' : 'الثالث'}
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {Math.round(getProgressByTrimester(trimester))}%
                </div>
                <Progress value={getProgressByTrimester(trimester)} className="h-2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checklist by Trimester */}
        {[1, 2, 3].map(trimester => (
          <Card key={trimester} className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">
                  {trimester === 1 ? '🌱' : trimester === 2 ? '🤰' : '👶'}
                </span>
                الثلث {trimester === 1 ? 'الأول' : trimester === 2 ? 'الثاني' : 'الثالث'} من الحمل
                <Badge variant="secondary" className="mr-auto">
                  {getItemsByTrimester(trimester).filter(item => item.completed).length}/
                  {getItemsByTrimester(trimester).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getItemsByTrimester(trimester).map(item => {
                const status = getItemStatus(item);
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                      item.completed 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                        : status === 'overdue'
                        ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                        : status === 'urgent'
                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                        : 'bg-background border-border hover:shadow-sm'
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCategoryEmoji(item.category)}</span>
                        <span className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.title}
                        </span>
                        <div className="flex gap-1 mr-auto">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(item.priority)}`}
                          >
                            {item.priority === 'high' ? 'عاجل' : item.priority === 'medium' ? 'متوسط' : 'عادي'}
                          </Badge>
                          {item.dueWeek && (
                            <Badge variant="secondary" className="text-xs">
                              الأسبوع {item.dueWeek}
                            </Badge>
                          )}
                          {status === 'overdue' && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="w-3 h-3 ml-1" />
                              متأخر
                            </Badge>
                          )}
                          {status === 'urgent' && (
                            <Badge variant="default" className="text-xs bg-yellow-500">
                              <Clock className="w-3 h-3 ml-1" />
                              عاجل
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <BottomNavigation items={bottomNavItems} />
    </div>
  );
};

export default PreparationChecklist;