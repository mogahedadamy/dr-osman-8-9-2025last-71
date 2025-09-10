import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-6xl mb-4">🤱</div>
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          عذراً! الصفحة المطلوبة غير موجودة
        </p>
        <Button 
          onClick={() => navigate("/")} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
        >
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
