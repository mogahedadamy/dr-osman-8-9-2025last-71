import { Card, CardContent } from "@/components/ui/card";
import { Reminder } from "@/types";

interface DailySummaryProps {
  reminders: Reminder[];
}

const DailySummary = ({ reminders }: DailySummaryProps) => {
  const activeReminders = reminders.filter(r => r.enabled && !r.completed).length;

  return (
    <Card className="mb-6 shadow-card bg-primary-light animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">اليوم</h3>
            <p className="text-sm text-muted-foreground">
              {activeReminders} تذكيرات نشطة
            </p>
          </div>
          <div className="text-3xl">📅</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;