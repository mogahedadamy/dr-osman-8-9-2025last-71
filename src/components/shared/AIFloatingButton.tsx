import { MessageSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import TouchFeedback from "@/components/mobile/TouchFeedback";

const AIFloatingButton = () => {
  return (
    <div className="fixed bottom-[85px] right-4 z-40">
      <TouchFeedback>
        <Link to="/chat">
          <div className="relative group">
            {/* Main Button */}
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-white/10 hover:scale-105 active:scale-95">
              <MessageSquare className="w-4 h-4 text-white" />
              
              {/* Subtle Indicator */}
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                <Sparkles className="w-1.5 h-1.5 text-white" />
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-12 right-0 bg-foreground text-background px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              المساعد الذكي
              <div className="absolute top-full right-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-foreground"></div>
            </div>
          </div>
        </Link>
      </TouchFeedback>
    </div>
  );
};

export default AIFloatingButton;