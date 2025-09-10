import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  action?: React.ReactNode;
}

const PageHeader = ({ 
  title, 
  subtitle, 
  showBack = true,
  onBack,
  rightAction,
  action 
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = onBack || (() => {
    // Always try to go back, fallback to home if there's an error
    try {
      navigate(-1);
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/');
    }
  });
  
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {showBack ? (
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="text-primary hover:text-primary/80 touch-target flex items-center gap-2"
              type="button"
            >
              <ArrowRight className="w-5 h-5" />
              العودة
            </Button>
          ) : <div className="w-16" />}
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="w-16">
            {rightAction || action}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;