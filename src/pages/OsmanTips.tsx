import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { osmanTipsData, tipCategories, getTipsByWeek } from '@/data/osmanTipsData';
import { AnimatedPage, FadeIn } from "@/components/mobile/AnimatedPage";

const OsmanTips = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(20);
  const [favorites, setFavorites] = useState<string[]>([]);

  const currentTips = getTipsByWeek(currentWeek);

  const toggleFavorite = (tipId: string) => {
    setFavorites(prev => 
      prev.includes(tipId) 
        ? prev.filter(id => id !== tipId)
        : [...prev, tipId]
    );
  };

  const nextWeek = () => {
    if (currentWeek < 40) setCurrentWeek(currentWeek + 1);
  };

  const prevWeek = () => {
    if (currentWeek > 4) setCurrentWeek(currentWeek - 1);
  };

  return (
    <MobileLayout>
      <AnimatedPage>
        <MobileHeader 
          title="عثمانيات الحمل" 
          subtitle="نصائح د.عثمان الشخصية"
          showBackButton={true}
          onBack={() => navigate(-1)}
        />

        <div className="px-4 py-4 space-y-6">
          {/* التنقل بين الأسابيع */}
          <FadeIn delay={0.1}>
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={prevWeek}
                    disabled={currentWeek <= 4}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-bold">الأسبوع {currentWeek}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentTips.length} نصيحة متوفرة
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={nextWeek}
                    disabled={currentWeek >= 40}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* النصائح */}
          {currentTips.length > 0 ? (
            <div className="space-y-4">
              {currentTips.map((tip, index) => (
                <FadeIn key={tip.id} delay={0.2 + index * 0.1}>
                  <Card className="shadow-soft hover:shadow-card transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={tipCategories[tip.category].color}>
                            <span className="ml-1">{tipCategories[tip.category].emoji}</span>
                            {tipCategories[tip.category].name}
                          </Badge>
                          {tip.isPersonalExperience && (
                            <Badge variant="outline">
                              <Star className="w-3 h-3 ml-1 fill-current text-yellow-500" />
                              تجربة شخصية
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(tip.id)}
                          className={favorites.includes(tip.id) ? 'text-red-500' : 'text-muted-foreground'}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(tip.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed">{tip.content}</p>
                        
                        {tip.personalNote && (
                          <div className="bg-accent/30 p-4 rounded-lg border-r-4 border-primary">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <span>👨‍⚕️</span>
                              ملاحظة د.عثمان الشخصية:
                            </h4>
                            <p className="text-sm italic text-muted-foreground leading-relaxed">
                              "{tip.personalNote}"
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>وقت القراءة: {tip.readTime}</span>
                          <div className="flex gap-1">
                            {tip.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="bg-muted px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          ) : (
            <FadeIn delay={0.2}>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👨‍⚕️</div>
                <h3 className="text-lg font-semibold mb-2">لا توجد نصائح لهذا الأسبوع بعد</h3>
                <p className="text-sm text-muted-foreground">
                  جاري إضافة المزيد من النصائح الشخصية من د.عثمان
                </p>
              </div>
            </FadeIn>
          )}
        </div>
      </AnimatedPage>
    </MobileLayout>
  );
};

export default OsmanTips;