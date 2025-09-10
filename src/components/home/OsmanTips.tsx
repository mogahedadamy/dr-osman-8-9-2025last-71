import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const OsmanTips = () => {
  const { isAuthenticated, isPremium } = useAuth();

  const currentTip = {
    week: 20,
    title: "التغذية في منتصف الحمل",
    content: "في هذه المرحلة المهمة، يحتاج جسمك لعناصر غذائية محددة...",
    personalNote: "من خلال خبرتي الطبية، أنصح بالتركيز على الكالسيوم والحديد",
    audioAvailable: true
  };

  return (
    <div className="px-4 mb-6">
      <Card className="shadow-card overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="icon-3d icon-3d-accent w-12 h-12 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">عثمانيات الحمل</h3>
                  <p className="text-sm text-white/90">نصائح د. عثمان الشخصية</p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                أسبوع {currentTip.week}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-bold text-foreground mb-2 text-lg">
              {currentTip.title}
            </h4>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              {currentTip.content}
            </p>

            {/* Personal Note */}
            <div className="bg-primary/5 rounded-lg p-3 mb-4 border-r-4 border-primary">
              <div className="flex items-start gap-2">
                <span className="text-primary text-lg">💬</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-1">
                    رسالة شخصية من د. عثمان:
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentTip.personalNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isPremium() ? (
                <>
                  <Link to="/tips" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                      <Heart className="w-4 h-4 ml-2" />
                      قراءة كاملة
                    </Button>
                  </Link>
                  {currentTip.audioAvailable && (
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary/10"
                      size="sm"
                    >
                      🎵 صوتي
                    </Button>
                  )}
                </>
              ) : (
                <Link to="/premium-access" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary hover:bg-primary/10 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    اشترك للوصول
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OsmanTips;