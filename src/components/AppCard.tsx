import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
  badge?: string;
}

const AppCard = ({ title, description, icon, gradient, onClick, badge }: AppCardProps) => {
  return (
    <Card 
      className="shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 cursor-pointer border-0 h-full"
      onClick={onClick}
    >
      <CardContent className={`p-6 ${gradient} rounded-lg h-full flex flex-col justify-between relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 right-4 text-6xl transform rotate-12">
            {icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">{icon}</div>
            {badge && (
              <div className="bg-background/20 text-foreground px-2 py-1 rounded-full text-xs font-medium">
                {badge}
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Action Indicator */}
        <div className="relative z-10 mt-4 flex justify-end">
          <div className="w-8 h-8 bg-background/20 rounded-full flex items-center justify-center">
            <span className="text-foreground">←</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppCard;