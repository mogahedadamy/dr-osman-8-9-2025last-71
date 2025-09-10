import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Baby, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DueDateCalculator = () => {
  const { toast } = useToast();
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [results, setResults] = useState<any>(null);

  // Helper function to format date in Arabic DD/MM/YYYY format
  const formatArabicDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateDueDate = () => {
    if (!lastPeriod) {
      toast({
        title: "يرجى إدخال تاريخ آخر دورة شهرية",
        variant: "destructive"
      });
      return;
    }

    const lmp = new Date(lastPeriod);
    const cycle = parseInt(cycleLength);
    
    // Calculate due date (280 days from LMP)
    const dueDate = new Date(lmp);
    dueDate.setDate(dueDate.getDate() + 280);
    
    // Calculate current week
    const today = new Date();
    const diffTime = today.getTime() - lmp.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(diffDays / 7);
    
    // Calculate conception date
    const conceptionDate = new Date(lmp);
    conceptionDate.setDate(conceptionDate.getDate() + 14);
    
    // Calculate remaining days
    const remainingTime = dueDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    const remainingWeeks = Math.floor(remainingDays / 7);
    
    setResults({
      dueDate: formatArabicDate(dueDate),
      currentWeek: Math.max(0, currentWeek),
      conceptionDate: formatArabicDate(conceptionDate),
      remainingWeeks: Math.max(0, remainingWeeks),
      remainingDays: Math.max(0, remainingDays),
      trimester: currentWeek <= 12 ? 1 : currentWeek <= 26 ? 2 : 3
    });

    toast({
      title: "تم حساب موعد الولادة بنجاح",
      description: `الموعد المتوقع: ${formatArabicDate(dueDate)}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lastPeriod" className="text-sm font-medium">تاريخ آخر دورة شهرية</Label>
          <Input
            id="lastPeriod"
            type="date"
            value={lastPeriod}
            onChange={(e) => setLastPeriod(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="cycleLength" className="text-sm font-medium">طول الدورة الشهرية (أيام)</Label>
          <Input
            id="cycleLength"
            type="number"
            value={cycleLength}
            onChange={(e) => setCycleLength(e.target.value)}
            placeholder="28"
            min="21"
            max="35"
            className="mt-1"
          />
        </div>
      </div>

      <Button 
        onClick={calculateDueDate}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Calendar className="w-4 h-4 ml-2" />
        احسبي موعد الولادة
      </Button>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="bg-primary-light border-primary/20">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-bold text-primary">موعد الولادة المتوقع</h3>
              <p className="text-lg font-semibold text-foreground">{results.dueDate}</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary-soft border-secondary/20">
            <CardContent className="p-4 text-center">
              <Baby className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-bold text-secondary">الأسبوع الحالي</h3>
              <p className="text-lg font-semibold text-foreground">الأسبوع {results.currentWeek}</p>
              <p className="text-sm text-muted-foreground">الثلث {results.trimester} من الحمل</p>
            </CardContent>
          </Card>

          <Card className="bg-wellness-soft border-wellness/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-wellness mx-auto mb-2" />
              <h3 className="font-bold text-wellness">الوقت المتبقي</h3>
              <p className="text-lg font-semibold text-foreground">{results.remainingWeeks} أسبوع</p>
              <p className="text-sm text-muted-foreground">{results.remainingDays} يوم متبقي</p>
            </CardContent>
          </Card>

          <Card className="bg-accent-soft border-accent/20">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-bold text-accent">تاريخ الإخصاب المتوقع</h3>
              <p className="text-lg font-semibold text-foreground">{results.conceptionDate}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-foreground mb-2">💡 معلومات مهمة:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• هذه حسابات تقديرية، قد يختلف موعد الولادة الفعلي</li>
          <li>• 5% فقط من الأطفال يولدون في الموعد المحدد بالضبط</li>
          <li>• الولادة الطبيعية تتراوح بين 37-42 أسبوع</li>
          <li>• استشيري طبيبك للحصول على توقيت أكثر دقة</li>
        </ul>
      </div>
    </div>
  );
};

export default DueDateCalculator;