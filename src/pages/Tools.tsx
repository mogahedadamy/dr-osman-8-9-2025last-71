import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import PremiumPrompt from "@/components/shared/PremiumPrompt";
import { AnimatedPage, FadeIn, ScaleIn, AnimatedList, AnimatedListItem } from "@/components/mobile/AnimatedPage";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import { Calculator, Camera, FileText, Calendar, Scale, TrendingUp, Heart, ArrowRight, Baby } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DueDateCalculator from "@/components/tools/DueDateCalculator";
import WeightTracker from "@/components/tools/WeightTracker";
import { OptimalWeightCalculator } from "@/components/tools/OptimalWeightCalculator";
import EnhancedBellyPhotos from "@/components/tools/EnhancedBellyPhotos";
import MedicalSchedule from "@/components/tools/MedicalSchedule";
import { MedicalReportExporter } from "@/components/tools/MedicalReportExporter";
import BloodPressureGlucoseTracker from "@/components/tools/BloodPressureGlucoseTracker";
import KickCounter from "@/components/tools/KickCounter";

const Tools = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabsContentRef = useRef<HTMLDivElement>(null);

  // Function to handle tab change with scroll
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Scroll to tabs content after a short delay to ensure the content is rendered
    setTimeout(() => {
      tabsContentRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  // Check for direct section navigation from home page
  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "bp-glucose") {
      setActiveTab("vitals");
      // Also scroll to content when coming from home page
      setTimeout(() => {
        tabsContentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    } else if (section === "kicks") {
      setActiveTab("kicks");
      // Also scroll to content when coming from home page
      setTimeout(() => {
        tabsContentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [searchParams]);

  const toolCategories = [
    { id: "calculator", name: "حاسبة الولادة", icon: Calculator, color: "text-primary" },
    { id: "vitals", name: "ضغط الدم والسكر", icon: Heart, color: "text-red-500" },
    { id: "kicks", name: "عداد الحركة", icon: Baby, color: "text-accent" },
    { id: "weight", name: "الوزن", icon: Scale, color: "text-secondary" },
    { id: "optimal", name: "الوزن المثالي", icon: TrendingUp, color: "text-wellness" },
    { id: "photos", name: "الصور", icon: Camera, color: "text-accent" },
    { id: "schedule", name: "الفحوصات", icon: Calendar, color: "text-info" },
    { id: "reports", name: "التقارير", icon: FileText, color: "text-warning" },
  ];

  return (
    <MobileLayout>
      <AnimatedPage>
        {/* Mobile Header */}
        <MobileHeader 
          title="الأدوات التفاعلية"
          subtitle="حاسبات ومتابعات شاملة"
          showBackButton={true}
          onBack={() => navigate(-1)}
        />
        
        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">أدوات مساعدة لرحلة الحمل</h2>
              <p className="text-muted-foreground">حاسبات ومتابعات شاملة لصحتك وصحة طفلك</p>
            </div>
          </FadeIn>
          
          {/* Premium Tools Prompt */}
          <FadeIn delay={0.2}>
            <PremiumPrompt 
              message="أدوات متقدمة وحاسبات دقيقة"
              description="اكتشفي المزيد من الأدوات المتخصصة والحاسبات الطبية المتقدمة"
              size="normal"
            />
          </FadeIn>

          {/* Tool Categories Grid */}
          <ScaleIn delay={0.3}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {toolCategories.map((tool, index) => (
                <TouchFeedback key={tool.id}>
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-soft touch-target ${
                      activeTab === tool.id ? 'ring-2 ring-primary shadow-button' : 'hover:scale-105'
                    }`}
                    onClick={() => handleTabChange(tool.id)}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <tool.icon className={`w-6 h-6 mx-auto ${tool.color}`} />
                      <p className="text-xs font-medium text-foreground">{tool.name}</p>
                    </CardContent>
                  </Card>
                </TouchFeedback>
              ))}
            </div>
          </ScaleIn>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" ref={tabsContentRef}>

            <TabsContent value="calculator" className="mt-6">
              <FadeIn>
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      حاسبة موعد الولادة المتقدمة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DueDateCalculator />
                  </CardContent>
                </Card>
              </FadeIn>
            </TabsContent>

          <TabsContent value="vitals" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  مراقبة ضغط الدم والسكر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BloodPressureGlucoseTracker />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kicks" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="w-5 h-5 text-accent" />
                  عداد حركات الجنين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KickCounter />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-secondary" />
                  متتبع الوزن الأساسي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeightTracker />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimal" className="mt-6">
            <OptimalWeightCalculator />
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-accent" />
                  تتبع نمو البطن بالصور
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedBellyPhotos />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-wellness" />
                  جدول الفحوصات الطبية المطلوبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MedicalSchedule />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <MedicalReportExporter />
          </TabsContent>
          </Tabs>
        </div>
      </AnimatedPage>
    </MobileLayout>
  );
};

export default Tools;