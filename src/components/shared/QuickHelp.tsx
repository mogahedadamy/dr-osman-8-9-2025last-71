import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  X, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  Heart,
  Search,
  Star,
  Download,
  Settings
} from "lucide-react";

interface QuickHelpProps {
  pageType: 'home' | 'chat' | 'library' | 'tips' | 'calendar' | 'tools' | 'settings';
}

const QuickHelp = ({ pageType }: QuickHelpProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    home: {
      title: "الصفحة الرئيسية 🏠",
      tips: [
        "استخدمي التنقل السريع للوصول لجميع المميزات",
        "تابعي تقدم حملك من خلال الإحصائيات السريعة",
        "سجلي يومك لمتابعة أفضل مع د.عثمان",
        "احجزي موعدك مباشرة من الصفحة الرئيسية"
      ]
    },
    chat: {
      title: "المساعد الذكي 💬",
      tips: [
        "اطرحي أسئلة قصيرة ومحددة للحصول على إجابات دقيقة",
        "استخدمي الأسئلة السريعة للحصول على معلومات فورية",
        "يمكنك رفع صور التحاليل والاستشارة حولها",
        "المساعد متاح 24/7 للرد على استفساراتك"
      ]
    },
    library: {
      title: "المكتبة التعليمية 📚",
      tips: [
        "استخدمي البحث للعثور على محتوى محدد",
        "أضيفي المحتوى المفيد للمفضلة",
        "حمّلي المحتوى لقراءته بدون إنترنت",
        "ابحثي في الموسوعة عن مصطلحات طبية"
      ]
    },
    tips: {
      title: "النصائح الأسبوعية 💡",
      tips: [
        "اختاري أسبوع حملك لنصائح مخصصة",
        "احفظي النصائح المهمة في المفضلة",
        "شاركي النصائح مع الأصدقاء والعائلة",
        "اشتركي في المحتوى المدفوع لنصائح متقدمة"
      ]
    },
    calendar: {
      title: "حجز المواعيد 📅",
      tips: [
        "احجزي موعدك مع د.عثمان بسهولة",
        "راجعي تاريخ المواعيد القادمة",
        "احصلي على تذكير قبل الموعد",
        "يمكنك إلغاء أو تعديل الموعد حسب الحاجة"
      ]
    },
    tools: {
      title: "الأدوات المساعدة 🛠️",
      tips: [
        "احسبي موعد الولادة المتوقع",
        "تتبعي وزنك أسبوعياً",
        "التقطي صور البطن لتتبع التطور",
        "استخدمي حاسبة الوزن المثالي"
      ]
    },
    settings: {
      title: "الإعدادات ⚙️",
      tips: [
        "فعّلي الإشعارات للتذكير بالمواعيد",
        "خصصي التطبيق حسب احتياجاتك",
        "اربطي حسابك للنسخ الاحتياطي",
        "اضبطي إعدادات الخصوصية"
      ]
    }
  };

  const pageIcons = {
    home: <Heart className="w-5 h-5 text-primary" />,
    chat: <MessageSquare className="w-5 h-5 text-primary" />,
    library: <BookOpen className="w-5 h-5 text-primary" />,
    tips: <Star className="w-5 h-5 text-primary" />,
    calendar: <Calendar className="w-5 h-5 text-primary" />,
    tools: <Settings className="w-5 h-5 text-primary" />,
    settings: <Settings className="w-5 h-5 text-primary" />
  };

  const content = helpContent[pageType];

  if (!isOpen) {
    return (
      <div className="fixed bottom-32 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg animate-pulse"
          size="sm"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-primary/20 mb-20">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {pageIcons[pageType]}
              <Badge variant="outline" className="text-xs">
                مساعدة سريعة
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3">
              {content.title}
            </h3>
            <div className="space-y-2 text-right">
              {content.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            فهمت، شكراً 👍
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickHelp;