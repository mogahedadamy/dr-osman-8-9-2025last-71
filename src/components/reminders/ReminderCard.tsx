import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { Reminder } from "@/types";

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: number) => void;
  onMarkCompleted: (id: number) => void;
}

const ReminderCard = ({ reminder, onToggle, onMarkCompleted }: ReminderCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return '🩺';
      case 'medication': return '💊';
      case 'appointment': return '👩‍⚕️';
      case 'exercise': return '🤸‍♀️';
      default: return '📋';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'medical': return 'طبي';
      case 'medication': return 'دواء';
      case 'appointment': return 'موعد';
      case 'exercise': return 'تمارين';
      default: return 'عام';
    }
  };

  return (
    <Card 
      className={`shadow-card transition-all duration-300 ${
        reminder.completed ? 'opacity-60' : 'hover:shadow-soft'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse flex-1">
            <div className="text-2xl">{getTypeIcon(reminder.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${
                  reminder.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {reminder.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {getTypeBadge(reminder.type)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {reminder.time}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {reminder.date}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkCompleted(reminder.id)}
              className={`p-2 ${
                reminder.completed 
                  ? 'text-wellness hover:text-wellness/80' 
                  : 'text-muted-foreground hover:text-wellness'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </Button>
            <Switch
              checked={reminder.enabled}
              onCheckedChange={() => onToggle(reminder.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderCard;