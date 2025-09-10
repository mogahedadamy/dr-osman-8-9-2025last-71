import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Sparkles } from "lucide-react";

interface PremiumPromptProps {
  message?: string;
  description?: string;
  size?: "small" | "normal" | "large";
}

const PremiumPrompt = ({ 
  message = "المحتوى المتميز متاح الآن",
  description = "احصلي على تجربة شاملة ومحتوى حصري",
  size = "normal"
}: PremiumPromptProps) => {
  if (size === "small") {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">{message}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link to="/premium-access">
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-xs">
              اشترك الآن
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (size === "large") {
    return (
      <Card className="shadow-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">{message}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="space-y-2">
            <Link to="/premium-access">
              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                <Sparkles className="w-4 h-4 ml-2" />
                اكتشف المحتوى المدفوع
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                لديك حساب مدفوع؟ سجل دخول
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-primary">{message}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-2">
            <Link to="/premium-access">
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary w-full">
                اشترك الآن
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumPrompt;