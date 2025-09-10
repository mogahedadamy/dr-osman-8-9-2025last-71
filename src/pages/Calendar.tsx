import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useReminders } from "@/hooks/useReminders";
import { useDailyLogs } from "@/hooks/useDailyLogs";
import { AppointmentScheduler } from "@/components/calendar/AppointmentScheduler";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const { reminders } = useReminders();
  const { logs } = useDailyLogs();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();

  const daysInMonth = lastDayOfMonth.getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayWeekday }, (_, i) => null);

  const monthNames = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const getDateString = (day: number) => {
    return new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
  };

  const getEventsForDate = (day: number) => {
    const dateString = getDateString(day);
    const dayReminders = reminders.filter(reminder => 
      reminder.type === 'appointment' && reminder.date === dateString
    );
    const dayLog = logs.find(log => log.date === dateString);
    
    return {
      reminders: dayReminders,
      hasLog: !!dayLog,
      log: dayLog
    };
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate.getDate()) : null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageHeader title="التقويم" />

      <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* إضافة مجدول المواعيد */}
        <AppointmentScheduler 
          openDialog={showAppointmentDialog}
          onDialogChange={setShowAppointmentDialog}
        />
        {/* Calendar Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={goToPrevMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="h-12"></div>
              ))}
              
              {daysArray.map(day => {
                const events = getEventsForDate(day);
                const isSelected = selectedDate?.getDate() === day;
                
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                    className={`
                      h-12 flex flex-col items-center justify-center text-sm cursor-pointer rounded-lg transition-all
                      ${isToday(day) 
                        ? 'bg-primary text-primary-foreground font-bold' 
                        : isSelected 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'hover:bg-muted'
                      }
                    `}
                  >
                    <span>{day}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {events.reminders.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      )}
                      {events.hasLog && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>موعد طبي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>تم تسجيل الحالة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>اليوم</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && selectedDateEvents && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {selectedDate.toLocaleDateString('ar')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Appointments */}
              {selectedDateEvents.reminders.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">المواعيد الطبية</h4>
                  <div className="space-y-2">
                    {selectedDateEvents.reminders.map(reminder => (
                      <div key={reminder.id} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{reminder.title}</span>
                          <Badge variant="outline" className="text-red-600">
                            {reminder.time}
                          </Badge>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Log */}
              {selectedDateEvents.hasLog && selectedDateEvents.log && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">الحالة اليومية</h4>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {selectedDateEvents.log.mood}/7
                        </div>
                        <div className="text-xs text-muted-foreground">المزاج</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {selectedDateEvents.log.energy}/10
                        </div>
                        <div className="text-xs text-muted-foreground">الطاقة</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {selectedDateEvents.log.weight}
                        </div>
                        <div className="text-xs text-muted-foreground">الوزن</div>
                      </div>
                    </div>
                    {selectedDateEvents.log.symptoms.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">الأعراض:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedDateEvents.log.symptoms.map(symptom => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Data */}
              {selectedDateEvents.reminders.length === 0 && !selectedDateEvents.hasLog && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>لا توجد أحداث في هذا اليوم</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowAppointmentDialog(true)}
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة موعد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Calendar;