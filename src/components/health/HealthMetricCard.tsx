import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'danger' | 'good';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

const HealthMetricCard = ({
  title,
  value,
  unit,
  status = 'normal',
  trend,
  trendValue,
  icon: Icon,
  iconColor = 'text-primary',
  onClick
}: HealthMetricCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'danger':
        return 'text-red-500';
      default:
        return 'text-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      normal: 'طبيعي',
      good: 'ممتاز',
      warning: 'تحذير',
      danger: 'خطر'
    };

    const colorMap = {
      normal: 'bg-blue-100 text-blue-800',
      good: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`text-xs ${colorMap[status]}`}>
        {statusMap[status]}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
          onClick ? 'hover:bg-muted/50' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-muted/50 rounded-lg ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{title}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold ${getStatusColor()}`}>
                  {value}
                </span>
                {unit && (
                  <span className="text-sm text-muted-foreground">{unit}</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                {getStatusBadge()}
                {trend && trendValue && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon()}
                    <span className="text-xs text-muted-foreground">{trendValue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthMetricCard;