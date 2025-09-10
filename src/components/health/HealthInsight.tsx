import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingUp
} from "lucide-react";

interface HealthInsightProps {
  type: 'tip' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  recommendations?: string[];
  priority?: 'low' | 'medium' | 'high';
}

const HealthInsight = ({
  type,
  title,
  message,
  recommendations = [],
  priority = 'medium'
}: HealthInsightProps) => {
  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'tip':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-purple-200 bg-purple-50';
    }
  };

  const getPriorityBadge = () => {
    const priorityMap = {
      low: { label: 'منخفض', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'متوسط', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'مهم', color: 'bg-red-100 text-red-800' }
    };

    return (
      <Badge className={`text-xs ${priorityMap[priority].color}`}>
        {priorityMap[priority].label}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert className={getColorClasses()}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{title}</h4>
              {getPriorityBadge()}
            </div>
            <AlertDescription className="text-xs leading-relaxed">
              {message}
            </AlertDescription>
            {recommendations.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">التوصيات:</p>
                <ul className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs">
                      <TrendingUp className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </motion.div>
  );
};

export default HealthInsight;