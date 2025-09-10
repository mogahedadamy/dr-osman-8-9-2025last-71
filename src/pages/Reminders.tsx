import { Button } from "@/components/ui/button";
import { Clock, Calendar, Bell } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import BottomNavigation from "@/components/shared/BottomNavigation";
import ReminderCard from "@/components/reminders/ReminderCard";
import DailySummary from "@/components/reminders/DailySummary";
import AddReminderModal from "@/components/reminders/AddReminderModal";
import { useReminders } from "@/hooks/useReminders";

const Reminders = () => {
  const {
    reminders,
    activeReminders,
    toggleReminder,
    markCompleted,
    addReminder
  } = useReminders();

  const bottomNavItems = [
    {
      icon: <Calendar className="w-5 h-5 mb-1 text-primary" />,
      label: "التقويم"
    },
    {
      icon: <Bell className="w-5 h-5 mb-1 text-secondary" />,
      label: "الإشعارات"
    },
    {
      icon: <Clock className="w-5 h-5 mb-1 text-accent" />,
      label: "المؤقت"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageHeader 
        title="التذكيرات الطبية"
        rightAction={
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">لن تفوتي أي موعد طبي</h2>
          <p className="text-muted-foreground">تذكيرات ذكية لمواعيدك وأدويتك</p>
        </div>

        <DailySummary reminders={reminders} />

        <div className="space-y-4">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onToggle={toggleReminder}
              onMarkCompleted={markCompleted}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <AddReminderModal onAddReminder={addReminder} />
        </div>
      </div>

      <BottomNavigation items={bottomNavItems} />
    </div>
  );
};

export default Reminders;