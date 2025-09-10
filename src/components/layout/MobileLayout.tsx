import { ReactNode } from "react";
import BottomNavigation from "@/components/shared/BottomNavigation";
import HelpSystem from "@/components/shared/HelpSystem";
import { Home, Calendar, MessageSquare, BookOpen, Wrench } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBackButton } from "@/hooks/useBackButton";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

const MobileLayout = ({ children, showBottomNav = true }: MobileLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // تفعيل زر الرجوع العام للتطبيق
  useBackButton({ 
    enabled: true,
    exitOnHome: location.pathname === '/' // السماح بالخروج فقط في الصفحة الرئيسية
  });

  const navItems = [
    {
      icon: <div className="icon-3d icon-3d-primary p-2 rounded-xl"><Home className="w-5 h-5" /></div>,
      label: "الرئيسية",
      onClick: () => navigate("/")
    },
    {
      icon: <div className="icon-3d icon-3d-wellness p-2 rounded-xl"><Calendar className="w-5 h-5" /></div>,
      label: "النصائح",
      onClick: () => navigate("/tips")
    },
    {
      icon: <div className="icon-3d icon-3d-secondary p-2 rounded-xl"><MessageSquare className="w-5 h-5" /></div>,
      label: "المساعد",
      onClick: () => navigate("/chat")
    },
    {
      icon: <div className="icon-3d icon-3d-accent p-2 rounded-xl"><Wrench className="w-5 h-5" /></div>,
      label: "الأدوات",
      onClick: () => navigate("/tools")
    },
    {
      icon: <div className="icon-3d icon-3d-primary p-2 rounded-xl"><BookOpen className="w-5 h-5" /></div>,
      label: "المكتبة",
      onClick: () => navigate("/library")
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col app-container mobile-optimized">
      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-x-hidden stable-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNavigation items={navItems} />
      )}

      {/* Smart Help System */}
      <HelpSystem />
    </div>
  );
};

export default MobileLayout;