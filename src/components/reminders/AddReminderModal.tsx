import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Bell, Plus } from "lucide-react";
import { Reminder } from "@/types";

interface AddReminderModalProps {
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
}

const AddReminderModal = ({ onAddReminder }: AddReminderModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    time: "",
    date: "",
    type: "medical" as Reminder['type'],
    description: "",
    frequency: "once", // once, daily, weekly, monthly
    enabled: true
  });

  const reminderTypes = [
    { value: "medical", label: "فحص طبي", icon: "🩺" },
    { value: "medication", label: "دواء", icon: "💊" },
    { value: "appointment", label: "موعد", icon: "📅" },
    { value: "exercise", label: "تمرين", icon: "🤸‍♀️" }
  ];

  const frequencies = [
    { value: "once", label: "مرة واحدة" },
    { value: "daily", label: "يومياً" },
    { value: "weekly", label: "أسبوعياً" },
    { value: "monthly", label: "شهرياً" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("⏰ AddReminderModal: إضافة تذكير جديد", { 
      title: formData.title,
      type: formData.type,
      frequency: formData.frequency,
      time: formData.time,
      enabled: formData.enabled
    });
    
    if (!formData.title || !formData.time) {
      console.warn("⚠️ AddReminderModal: بيانات ناقصة", { 
        hasTitle: !!formData.title, 
        hasTime: !!formData.time 
      });
      return;
    }

    const newReminder: Omit<Reminder, 'id'> = {
      title: formData.title,
      time: formData.time,
      date: formData.frequency === 'once' ? formData.date : getFrequencyDate(formData.frequency),
      type: formData.type,
      enabled: formData.enabled,
      completed: false,
      description: formData.description || undefined,
      frequency: formData.frequency !== 'once' ? formData.frequency : undefined
    };

    onAddReminder(newReminder);
    console.log("✅ AddReminderModal: تم إضافة التذكير بنجاح", newReminder);
    
    setFormData({
      title: "",
      time: "",
      date: "",
      type: "medical",
      description: "",
      frequency: "once",
      enabled: true
    });
    setOpen(false);
  };

  const getFrequencyDate = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'يومياً';
      case 'weekly':
        return 'أسبوعياً';
      case 'monthly':
        return 'شهرياً';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button">
          <Plus className="w-4 h-4 ml-2" />
          إضافة تذكير جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            إضافة تذكير جديد
          </DialogTitle>
          <DialogDescription className="text-right">
            أدخل تفاصيل التذكير الجديد وحدد وقت ونوع التذكير
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان التذكير</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: فحص الضغط والسكر"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">الوقت</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">النوع</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as Reminder['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">التكرار</Label>
            <Select 
              value={formData.frequency} 
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === 'once' && (
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">ملاحظات (اختيارية)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">تفعيل التذكير</Label>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              إضافة التذكير
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderModal;