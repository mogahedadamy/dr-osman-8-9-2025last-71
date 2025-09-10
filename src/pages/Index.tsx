import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import WelcomeSection from "@/components/home/WelcomeSection";
import EssentialServices from "@/components/home/EssentialServices";
import WeeklyTipsCard from "@/components/shared/WeeklyTipsCard";
import WeekByWeekCard from "@/components/home/WeekByWeekCard";
import HelpGuide from "@/components/shared/HelpGuide";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import TermsAgreement from "@/components/shared/TermsAgreement";
import InteractiveTutorial from "@/components/shared/InteractiveTutorial";
import { AnimatedPage, FadeIn, ScaleIn } from "@/components/mobile/AnimatedPage";
import AIFloatingButton from "@/components/shared/AIFloatingButton";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <MobileLayout>
        <AnimatedPage>
        {/* Mobile Header */}
        <FadeIn>
          <MobileHeader 
            title="Osman Pregnancy companion" 
            subtitle="رفيق الحمل الذكي"
            actions={
              <TouchFeedback>
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/1e1120b6-69dd-4ce1-89bb-55e30b39b4d6.png"
                    alt="Dr. Osman Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </TouchFeedback>
            }
          />
        </FadeIn>

        {/* Welcome Section */}
        <FadeIn delay={0.1}>
          <WelcomeSection />
        </FadeIn>

        {/* Week by Week Guide */}
        <FadeIn delay={0.2}>
          <div className="px-4 mb-4">
            <WeekByWeekCard />
          </div>
        </FadeIn>

        {/* Weekly Tips (if authenticated) */}
        {isAuthenticated && (
          <FadeIn delay={0.25}>
            <div className="px-4 mb-4">
              <WeeklyTipsCard />
            </div>
          </FadeIn>
        )}

        {/* Essential Services */}
        <ScaleIn delay={0.3}>
          <EssentialServices />
        </ScaleIn>


        {/* Login Prompt for Non-authenticated Users */}
        {!isAuthenticated && (
          <ScaleIn delay={0.5}>
            <div className="px-4 pb-6">
              <Card className="shadow-card bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold text-primary mb-2">
                    🩷 مرحباً بك في رفيق الحمل الذكي
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    انضمي إلينا للحصول على رعاية حمل متخصصة ومحتوى تعليمي مميز
                  </p>
                  <div className="flex gap-3 justify-center">
                    <TouchFeedback>
                      <Link to="/login">
                        <Button variant="outline" size="sm" className="touch-target">
                          تسجيل دخول
                        </Button>
                      </Link>
                    </TouchFeedback>
                    <TouchFeedback>
                      <Link to="/premium-access">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground touch-target" size="sm">
                          اشتراك مدفوع
                        </Button>
                      </Link>
                    </TouchFeedback>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScaleIn>
        )}

        {/* AI Floating Button */}
        <AIFloatingButton />

        {/* Help Guide */}
        <HelpGuide />

        {/* Terms Agreement Modal */}
        <TermsAgreement />

        {/* Interactive Tutorial - Home page only */}
        <InteractiveTutorial />
      </AnimatedPage>
    </MobileLayout>
    </ErrorBoundary>
  );
};

export default Index;
