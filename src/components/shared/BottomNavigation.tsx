import { useLocation } from "react-router-dom";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface BottomNavigationProps {
  items: NavItem[];
}

const BottomNavigation = ({ items }: BottomNavigationProps) => {
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getPathFromOnClick = (onClick?: () => void) => {
    if (!onClick) return "";
    const onClickStr = onClick.toString();
    if (onClickStr.includes('("/")')) return "/";
    if (onClickStr.includes('("/tips")')) return "/tips";
    if (onClickStr.includes('("/chat")')) return "/chat";
    if (onClickStr.includes('("/library")')) return "/library";
    if (onClickStr.includes('("/tools")')) return "/tools";
    return "";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border shadow-lg z-50">
      <div className="safe-area-pb">
        <div className="flex items-center justify-around px-2 py-3">
          {items.map((item, index) => {
            const path = getPathFromOnClick(item.onClick);
            const isActive = isActiveRoute(path);
            
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-[64px] ${
                  isActive 
                    ? 'bg-primary/15 text-primary shadow-lg border border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-md'
                }`}
              >
                <div className={`mb-2 transition-all duration-300 ${
                  isActive ? 'scale-115 drop-shadow-lg' : 'scale-100'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-2 h-1 bg-primary rounded-full shadow-sm"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;