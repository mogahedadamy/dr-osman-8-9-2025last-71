import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import QuickHelp from "@/components/shared/QuickHelp";
import { ContentLoadingSkeleton } from "@/components/shared/EnhancedLoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Heart, Utensils } from "lucide-react";
import { weeklyTipsData, availableWeeks } from "@/data/weeklyTipsData";
import PremiumPrompt from "@/components/shared/PremiumPrompt";
import { AnimatedPage, ScaleIn, FadeIn, AnimatedList, AnimatedListItem } from "@/components/mobile/AnimatedPage";
import TouchFeedback from "@/components/mobile/TouchFeedback";

const Tips = () => {
  const [selectedWeek, setSelectedWeek] = useState(32);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const tipsContentRef = useRef<HTMLDivElement>(null);

  // Auto scroll to tips content when week changes
  useEffect(() => {
    if (tipsContentRef.current) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        tipsContentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 500); // Simulate loading time
    }
  }, [selectedWeek]);

  return (
    <MobileLayout showBottomNav={false}>
      <AnimatedPage>
        {/* Mobile Header */}
        <MobileHeader 
          title="النصائح الأسبوعية"
          subtitle="نصائح مخصصة لمرحلتك"
          showBackButton={true}
          onBack={() => navigate(-1)}
        />

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Premium Prompt */}
          <FadeIn delay={0.1}>
            <PremiumPrompt 
              message="نصائح متقدمة ومحتوى حصري"
              description="احصلي على نصائح طبية شخصية ومحتوى متميز لكل أسبوع"
              size="normal"
            />
          </FadeIn>
          
          {/* Week Selection Header */}
          <FadeIn delay={0.2}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">اختاري أسبوع الحمل</h2>
              <p className="text-sm text-muted-foreground">احصلي على نصائح مخصصة لمرحلتك</p>
            </div>
          </FadeIn>

          {/* Week Selection Grid */}
          <ScaleIn delay={0.3}>
            <div className="grid grid-cols-6 gap-2 mb-8">
              {availableWeeks.map((week) => (
                <TouchFeedback key={week}>
                  <Button
                    variant={selectedWeek === week ? "default" : "outline"}
                    onClick={() => setSelectedWeek(week)}
                    className={`aspect-square text-sm font-semibold touch-target ${
                      selectedWeek === week 
                        ? "bg-primary text-primary-foreground shadow-button scale-105" 
                        : "hover:bg-primary-light"
                    }`}
                  >
                    {week}
                  </Button>
                </TouchFeedback>
              ))}
            </div>
          </ScaleIn>

          {/* Tips Content */}
          <FadeIn delay={0.4}>
            {isLoading ? (
              <ContentLoadingSkeleton type="tips" />
            ) : (
              <Card ref={tipsContentRef} className="shadow-card">
                <CardHeader className="bg-gradient-primary text-center rounded-t-lg">
                  <CardTitle className="text-xl text-primary-foreground">
                    {weeklyTipsData[selectedWeek]?.title || "معلومات غير متوفرة"}
                  </CardTitle>
                  <Badge className="mx-auto mt-2 bg-primary-foreground/20 text-primary-foreground border-0">
                    <Baby className="w-4 h-4 ml-1" />
                    أسبوع {selectedWeek}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <AnimatedList className="space-y-4">
                    {(weeklyTipsData[selectedWeek]?.tips || []).map((tip, index) => (
                      <AnimatedListItem key={index}>
                        <TouchFeedback>
                          <Card className="hover:shadow-soft transition-all duration-300 border border-border/50">
                            <CardContent className="p-4 text-center space-y-3">
                              <div className="text-2xl">{tip.icon}</div>
                              <h3 className="font-semibold text-foreground text-sm">{tip.title}</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">{tip.content}</p>
                            </CardContent>
                          </Card>
                        </TouchFeedback>
                      </AnimatedListItem>
                    ))}
                  </AnimatedList>
                </CardContent>
              </Card>
            )}
          </FadeIn>

          {/* Bottom Spacing for safe area */}
          <div className="h-20 safe-area-pb"></div>
        </div>

        {/* Quick Actions - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 safe-area-pb">
          <div className="bg-background/95 backdrop-blur-md border-t border-border p-4">
            <div className="flex justify-around max-w-sm mx-auto">
              <TouchFeedback>
                <Button variant="ghost" size="sm" className="flex-col h-auto py-3 px-4 touch-target">
                  <Heart className="w-5 h-5 mb-1 text-secondary" />
                  <span className="text-xs font-medium">المفضلة</span>
                </Button>
              </TouchFeedback>
              <TouchFeedback>
                <Button variant="ghost" size="sm" className="flex-col h-auto py-3 px-4 touch-target">
                  <Utensils className="w-5 h-5 mb-1 text-wellness" />
                  <span className="text-xs font-medium">وصفات</span>
                </Button>
              </TouchFeedback>
              <TouchFeedback>
                <Button variant="ghost" size="sm" className="flex-col h-auto py-3 px-4 touch-target">
                  <Baby className="w-5 h-5 mb-1 text-accent" />
                  <span className="text-xs font-medium">نمو الطفل</span>
                </Button>
              </TouchFeedback>
            </div>
          </div>
        </div>

        {/* Quick Help */}
        <QuickHelp pageType="tips" />
      </AnimatedPage>
    </MobileLayout>
  );
};

export default Tips;