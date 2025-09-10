import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  X, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  Settings,
  Heart,
  Wrench,
  Target,
  Navigation
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import SmartTooltip from "./SmartTooltip";

interface HelpItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  action?: () => void;
  badge?: string;
}

const HelpSystem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Get page-specific help items
  const getPageHelp = (): HelpItem[] => {
    const basePath = location.pathname;
    
    const commonHelp: HelpItem[] = [
      {
        id: 'navigation',
        title: 'كيفية التنقل',
        description: 'استخدمي شريط التنقل السفلي للانتقال بين أقسام التطبيق',
        icon: <Navigation className="w-4 h-4" />,
        targetSelector: '.bottom-navigation, nav',
        badge: 'أساسي'
      },
      {
        id: 'tutorial',
        title: 'الجولة التعريفية',
        description: 'شاهدي الجولة التعريفية للتطبيق مرة أخرى',
        icon: <Target className="w-4 h-4" />,
        action: () => {
          (window as any).startInteractiveTutorial?.();
          setIsOpen(false);
        },
        badge: 'مفيد'
      }
    ];

    switch (basePath) {
      case '/':
        return [
          ...commonHelp,
          {
            id: 'welcome',
            title: 'مرحباً بك في الصفحة الرئيسية',
            description: 'هنا تجدين ملخص سريع لحالة حملك والنصائح اليومية',
            icon: <Heart className="w-4 h-4" />,
            targetSelector: '.welcome-section, .daily-summary',
            badge: 'بداية'
          },
          {
            id: 'quick-actions',
            title: 'الإجراءات السريعة',
            description: 'استخدمي بطاقات الإجراءات السريعة للوصول لأهم المميزات',
            icon: <Wrench className="w-4 h-4" />,
            targetSelector: '.quick-actions, .clinic-services',
            badge: 'سريع'
          }
        ];
      
      case '/chat':
        return [
          ...commonHelp,
          {
            id: 'chat-input',
            title: 'كيفية طرح الأسئلة',
            description: 'اكتبي سؤالك في المربع السفلي واضغطي إرسال للحصول على إجابة فورية',
            icon: <MessageSquare className="w-4 h-4" />,
            targetSelector: '.chat-input, [placeholder*="اكتب"], input[type="text"]',
            badge: 'أساسي'
          },
          {
            id: 'quick-questions',
            title: 'الأسئلة السريعة',
            description: 'استخدمي الأسئلة السريعة المقترحة للحصول على إجابات سريعة',
            icon: <Target className="w-4 h-4" />,
            targetSelector: '.quick-questions, .suggested-questions',
            badge: 'سريع'
          }
        ];
      
      case '/library':
        return [
          ...commonHelp,
          {
            id: 'search',
            title: 'البحث في المكتبة',
            description: 'استخدمي مربع البحث للعثور على مقالات ومواضيع محددة',
            icon: <BookOpen className="w-4 h-4" />,
            targetSelector: '.search-input, [placeholder*="بحث"], .search-bar',
            badge: 'مفيد'
          },
          {
            id: 'categories',
            title: 'التصنيفات',
            description: 'تصفحي المحتوى حسب التصنيفات أو مراحل الحمل',
            icon: <Settings className="w-4 h-4" />,
            targetSelector: '.category-filter, .tabs, .filter-buttons',
            badge: 'تنظيم'
          }
        ];
      
      case '/tools':
        return [
          ...commonHelp,
          {
            id: 'calculator',
            title: 'حاسبة موعد الولادة',
            description: 'احسبي موعد الولادة المتوقع بدقة باستخدام تاريخ آخر دورة شهرية',
            icon: <Calendar className="w-4 h-4" />,
            targetSelector: '.due-date-calculator, .calculator-card',
            badge: 'مهم'
          },
          {
            id: 'weight-tracker',
            title: 'متابعة الوزن',
            description: 'تابعي زيادة وزنك أثناء الحمل وتأكدي من أنها صحية',
            icon: <Wrench className="w-4 h-4" />,
            targetSelector: '.weight-tracker, .tracking-card',
            badge: 'صحة'
          }
        ];
      
      default:
        return commonHelp;
    }
  };

  const helpItems = getPageHelp();

  const showTooltip = (item: HelpItem) => {
    if (item.targetSelector) {
      setActiveTooltip(item.id);
      setIsOpen(false);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <>
      {/* Help Button */}
      <div className="fixed bottom-24 left-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="icon-3d icon-3d-secondary w-12 h-12 p-0 shadow-lg"
          title="مساعدة"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-2 border-blue-200 bg-background/95 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  كيف يمكنني مساعدتك؟
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                اختاري من النصائح التالية لهذه الصفحة:
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {helpItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => showTooltip(item)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-muted hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-all duration-200"
                 >
                   <div className="icon-3d icon-3d-secondary p-2 rounded-lg mt-0.5">
                     {item.icon}
                   </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground">
                        {item.title}
                      </h4>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Contact Admin */}
              <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <h4 className="font-medium text-sm">تحتاجين مساعدة إضافية؟</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  تواصلي مع د.عثمان مباشرة عبر المساعد الذكي
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    navigate('/chat');
                    setIsOpen(false);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                >
                  اطرحي سؤالك على د.عثمان
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Tooltips */}
      {activeTooltip && helpItems.map((item) => 
        item.id === activeTooltip && item.targetSelector ? (
          <SmartTooltip
            key={item.id}
            targetSelector={item.targetSelector}
            title={item.title}
            description={item.description}
            onClose={() => setActiveTooltip(null)}
            showOnce={false}
          />
        ) : null
      )}
    </>
  );
};

export default HelpSystem;