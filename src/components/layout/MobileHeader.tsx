import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBackButton } from "@/hooks/useBackButton";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  showBackButton?: boolean;
  autoBackButton?: boolean; // للرجوع التلقائي
  className?: string;
}

const MobileHeader = ({ 
  title, 
  subtitle, 
  onBack, 
  actions, 
  showBackButton = false,
  autoBackButton = true, // تفعيل الرجوع التلقائي افتراضياً
  className = ""
}: MobileHeaderProps) => {
  const navigate = useNavigate();
  const { goBack } = useBackButton({ 
    enabled: false, // إيقاف الـ listener العام لأن MobileLayout يتعامل معه
    onBack: onBack || (() => navigate(-1))
  });
  return (
    <header className={`bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 ${className}`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack || goBack}
              className="w-10 h-10 p-0 hover:bg-primary/10"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {actions || (
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <MoreVertical className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;