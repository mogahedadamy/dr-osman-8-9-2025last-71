import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Heart,
  Calendar,
  MessageSquare 
} from "lucide-react";

const HelpGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      title: "مرحباً بك في تطبيق د.عثمان 🩷",
      description: "رفيق حملك الذكي والموثوق",
      content: "هذا التطبيق مصمم خصيصاً لمرافقتك في رحلة الحمل بمعلومات طبية موثوقة ونصائح د.عثمان المتخصصة.",
      icon: <Heart className="w-6 h-6 text-primary" />
    },
    {
      title: "المميزات الأساسية",
      description: "كل ما تحتاجينه في مكان واحد",
      content: "• متابعة أسابيع الحمل وتطور الجنين\n• نصائح د.عثمان الأسبوعية\n• مكتبة تعليمية شاملة\n• مساعد ذكي للإجابة على أسئلتك",
      icon: <Star className="w-6 h-6 text-secondary" />
    },
    {
      title: "حجز المواعيد",
      description: "احجزي موعدك بسهولة",
      content: "من خلال نظام الحجوزات المدمج، يمكنك حجز موعد في العيادة مباشرة من التطبيق مع متابعة حالة الحجز.",
      icon: <Calendar className="w-6 h-6 text-wellness" />
    },
    {
      title: "المساعد الذكي",
      description: "استشارات فورية",
      content: "المساعد الذكي متاح 24/7 للإجابة على استفساراتك وتقديم النصائح المبنية على المعلومات الطبية الموثوقة.",
      icon: <MessageSquare className="w-6 h-6 text-primary" />
    }
  ];

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeGuide = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 left-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          size="sm"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  const currentGuide = guideSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-primary/20">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {currentGuide.icon}
              <Badge className="text-xs">
                {currentStep + 1} من {guideSteps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeGuide}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {currentGuide.title}
            </h3>
            <p className="text-sm text-primary font-medium mb-3">
              {currentGuide.description}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {currentGuide.content}
            </p>
          </div>

          {/* Navigation */}
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
              {guideSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {currentStep === guideSteps.length - 1 ? (
              <Button
                size="sm"
                onClick={closeGuide}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                ابدأ الآن
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                className="flex items-center gap-1"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpGuide;