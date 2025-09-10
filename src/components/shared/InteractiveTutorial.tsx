import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  BookOpen,
  MessageSquare,
  Calendar,
  Heart,
  Settings,
  Crown,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Target
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement?: string;
  action?: string;
  isOptional?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  redirectTo?: string;
  highlight?: boolean;
}

const InteractiveTutorial = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useLocalStorage('tutorialActive', false);
  const [currentStep, setCurrentStep] = useLocalStorage('tutorialCurrentStep', 0);
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>('tutorialCompletedSteps', []);
  const [tutorialCompleted, setTutorialCompleted] = useLocalStorage('tutorialCompleted', false);
  const [showTutorial, setShowTutorial] = useLocalStorage('showTutorial', true);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'مرحباً بك في تطبيق د.عثمان 🩷',
      description: 'دعينا نأخذك في جولة سريعة لتتعرفي على أهم المميزات التي ستساعدك في رحلة حملك',
      icon: <Heart className="w-6 h-6 text-primary" />,
      position: 'center'
    },
    {
      id: 'navigation',
      title: 'التنقل في التطبيق',
      description: 'هذا هو شريط التنقل السفلي - مفتاحك للوصول لجميع أقسام التطبيق بسرعة',
      icon: <Settings className="w-6 h-6 text-primary" />,
      targetElement: '.bottom-navigation',
      position: 'top',
      highlight: true
    },
    {
      id: 'assistant',
      title: 'المساعد الذكي المتخصص 🤖',
      description: 'هنا يمكنك طرح أي سؤال طبي! النقر على هذه الأيقونة يفتح المساعد الذكي الذي يجيب على استفساراتك',
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      targetElement: 'nav a[href="/chat"]',
      position: 'top',
      highlight: true
    },
    {
      id: 'library',
      title: 'المكتبة التعليمية الشاملة 📚',
      description: 'هنا كنز المعلومات! مئات المقالات والفيديوهات منظمة حسب مراحل الحمل',
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      targetElement: 'nav a[href="/library"]',
      position: 'top',
      highlight: true
    },
    {
      id: 'tools',
      title: 'الأدوات المفيدة 🛠️',
      description: 'أدوات عملية مثل حاسبة موعد الولادة وتتبع الوزن',
      icon: <Settings className="w-6 h-6 text-primary" />,
      targetElement: 'nav a[href="/tools"]',
      position: 'top',
      highlight: true
    },
    {
      id: 'tips',
      title: 'نصائح د.عثمان اليومية 💡',
      description: 'نصائح يومية ومقالات من د.عثمان شخصياً',
      icon: <Heart className="w-6 h-6 text-primary" />,
      targetElement: 'nav a[href="/tips"]',
      position: 'top',
      highlight: true
    },
    {
      id: 'booking',
      title: 'حجز المواعيد المباشر 📅',
      description: 'يمكنك حجز موعد مع د.عثمان مباشرة! ابحثي عن زر "حجز موعد" في الصفحة',
      icon: <Calendar className="w-6 h-6 text-primary" />,
      targetElement: '.booking-section, .clinic-services, .quick-actions',
      position: 'center',
      highlight: true
    },
    {
      id: 'complete',
      title: 'مبروك! انتهيت من الجولة 🎉',
      description: 'الآن أصبحت تعرفين كيفية استخدام التطبيق! يمكنك إعادة تشغيل هذه الجولة من الإعدادات',
      icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
      position: 'center'
    }
  ];

  // Highlight target element
  const highlightTargetElement = (targetSelector?: string) => {
    if (!targetSelector) return;
    
    setTimeout(() => {
      const element = document.querySelector(targetSelector) as HTMLElement;
      if (element) {
        setHighlightElement(element);
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }, 300);
  };

  // Remove highlight
  const removeHighlight = () => {
    setHighlightElement(null);
  };

  // Show tutorial only after terms acceptance and for new users only
  useEffect(() => {
    const termsAccepted = localStorage.getItem('termsAccepted');
    const isHomePage = window.location.pathname === '/';
    const isFirstVisit = !tutorialCompleted && showTutorial;
    
    if (isFirstVisit && termsAccepted === 'true' && isHomePage) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1500); // Show after 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [showTutorial, tutorialCompleted]);

  // Update highlight when step changes
  useEffect(() => {
    if (isActive) {
      const currentStepData = tutorialSteps[currentStep];
      if (currentStepData?.targetElement && currentStepData?.highlight) {
        highlightTargetElement(currentStepData.targetElement);
      } else {
        removeHighlight();
      }
    } else {
      removeHighlight();
    }
  }, [currentStep, isActive]);

  const nextStep = () => {
    const currentStepData = tutorialSteps[currentStep];
    if (currentStepData && !completedSteps.includes(currentStepData.id)) {
      setCompletedSteps(prev => [...prev, currentStepData.id]);
    }
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  // Highlight element without navigation
  const highlightFeature = () => {
    const currentStepData = tutorialSteps[currentStep];
    if (currentStepData?.targetElement) {
      highlightTargetElement(currentStepData.targetElement);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    setTutorialCompleted(true);
    setIsActive(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    removeHighlight();
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setTutorialCompleted(true); // Mark as completed to prevent showing again
    setIsActive(false);
    removeHighlight();
  };

  // Restart tutorial function (can be called from settings)
  const restartTutorial = () => {
    setTutorialCompleted(false);
    setShowTutorial(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsActive(true);
  };

  // Manual tutorial trigger
  const startTutorial = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsActive(true);
  };

  // Expose restart function globally
  useEffect(() => {
    (window as any).startInteractiveTutorial = startTutorial;
  }, []);

  // Only show tutorial on home page
  const isHomePage = window.location.pathname === '/';
  if (!isHomePage) {
    return null;
  }

  if (!isActive) {
    return null; // Don't show any trigger button to avoid being annoying
  }

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  // Get arrow direction based on position
  const getArrowDirection = () => {
    const currentStepData = tutorialSteps[currentStep];
    switch (currentStepData?.position) {
      case 'top': return <ArrowDown className="w-6 h-6 text-primary animate-bounce" />;
      case 'bottom': return <ArrowUp className="w-6 h-6 text-primary animate-bounce" />;
      case 'left': return <ArrowRight className="w-6 h-6 text-primary animate-bounce" />;
      case 'right': return <ArrowLeft className="w-6 h-6 text-primary animate-bounce" />;
      default: return <Target className="w-6 h-6 text-primary animate-pulse" />;
    }
  };

  return (
    <>
      {/* Highlight overlay for target elements */}
      {highlightElement && (
        <div 
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: `radial-gradient(circle at ${highlightElement.offsetLeft + highlightElement.offsetWidth/2}px ${highlightElement.offsetTop + highlightElement.offsetHeight/2}px, transparent 60px, rgba(0,0,0,0.7) 100px)`
          }}
        >
          <div 
            className="absolute border-4 border-primary rounded-lg animate-pulse"
            style={{
              left: highlightElement.offsetLeft - 8,
              top: highlightElement.offsetTop - 8,
              width: highlightElement.offsetWidth + 16,
              height: highlightElement.offsetHeight + 16,
            }}
          />
        </div>
      )}
      
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-md">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {currentStepData.icon}
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {currentStep + 1} / {tutorialSteps.length}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTutorial}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  تخطي
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={completeTutorial}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Direction indicator for target elements */}
            {currentStepData.targetElement && currentStepData.highlight && (
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full">
                  {getArrowDirection()}
                  <span className="text-sm text-primary font-medium">
                    ابحث هنا
                  </span>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-foreground mb-3">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {currentStepData.description}
              </p>
              
              {/* Highlight button for interactive steps */}
              {currentStepData.targetElement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={highlightFeature}
                  className="mb-3 bg-primary/5 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Target className="w-4 h-4 mr-2" />
                  إضاءة العنصر
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </Button>

              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-primary scale-125' 
                        : index < currentStep 
                        ? 'bg-primary/60' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {currentStep === tutorialSteps.length - 1 ? (
                <Button
                  size="sm"
                  onClick={completeTutorial}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  إنهاء الجولة 🎉
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Optional Step Notice */}
            {currentStepData.isOptional && (
              <div className="mt-3 p-2 bg-secondary/10 rounded-lg text-center">
                <p className="text-xs text-secondary font-medium">
                  ⭐ هذه الخطوة اختيارية - يمكنك تخطيها
                </p>
              </div>
            )}

            {/* Help hint for finding features */}
            {currentStepData.targetElement && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                  💡 نصيحة: ابحثي عن العنصر المضيء أو استخدمي زر "إضاءة العنصر" أعلاه
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default InteractiveTutorial;