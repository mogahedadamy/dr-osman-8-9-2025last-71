import { useState, useEffect } from 'react';
import { Reminder } from '@/types';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';

const initialReminders: Reminder[] = [
  {
    id: 1,
    title: "فحص الضغط والسكر",
    time: "09:00 صباحاً",
    date: "2024-08-25",
    type: "medical",
    enabled: true,
    completed: false
  },
  {
    id: 2,
    title: "تناول الفيتامينات",
    time: "08:00 صباحاً",
    date: "يومياً",
    type: "medication",
    enabled: true,
    completed: true
  },
  {
    id: 3,
    title: "موعد الطبيب",
    time: "03:00 مساءً",
    date: "2024-08-28",
    type: "appointment",
    enabled: true,
    completed: false
  },
  {
    id: 4,
    title: "تمارين الحمل",
    time: "05:00 مساءً",
    date: "يومياً",
    type: "exercise",
    enabled: false,
    completed: false
  }
];

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const { scheduleReminder, scheduleAppointment, requestPermission, hasPermission } = useAdvancedNotifications();

  // Request notification permission on first load
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Schedule notifications for enabled reminders
  useEffect(() => {
    if (!hasPermission) return;

    reminders.forEach(async (reminder) => {
      if (reminder.enabled && !reminder.completed) {
        if (reminder.type === 'appointment' && reminder.date !== 'يومياً') {
          // جدولة موعد طبي
          await scheduleAppointment({
            id: reminder.id,
            title: reminder.title,
            doctorName: reminder.doctorName,
            location: reminder.location,
            date: reminder.date,
            time: reminder.time.split(' ')[0]
          });
        } else if (reminder.date === 'يومياً') {
          // جدولة تذكير يومي
          await scheduleReminder({
            id: reminder.id,
            title: reminder.title,
            description: reminder.description || `وقت ${reminder.title}`,
            date: new Date().toISOString().split('T')[0],
            time: reminder.time.split(' ')[0],
            type: reminder.type
          });
        }
      }
    });
  }, [reminders, scheduleReminder, scheduleAppointment, hasPermission]);

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    ));
  };

  const markCompleted = (id: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, completed: !reminder.completed }
        : reminder
    ));
  };

  const addReminder = (newReminder: Omit<Reminder, 'id'>) => {
    const id = Math.max(...reminders.map(r => r.id)) + 1;
    setReminders([...reminders, { ...newReminder, id }]);
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const activeReminders = reminders.filter(r => r.enabled && !r.completed);
  const completedToday = reminders.filter(r => r.completed).length;

  return {
    reminders,
    activeReminders,
    completedToday,
    toggleReminder,
    markCompleted,
    addReminder,
    deleteReminder
  };
};