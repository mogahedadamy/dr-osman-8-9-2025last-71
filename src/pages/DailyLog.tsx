import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar, Weight, Heart, Activity, MessageSquare } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { dbOperations } from "@/lib/localDatabase";
import { useDailyLogs, DailyLog as DailyLogType } from "@/hooks/useDailyLogs";

const DailyLog = () => {
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [mood, setMood] = useState([7]);
  const [energy, setEnergy] = useState([6]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const { getTodayLog } = useDailyLogs();

  // Load today's data if exists
  useEffect(() => {
    const loadTodayData = async () => {
      const todayLog = getTodayLog();
      if (todayLog) {
        setWeight(todayLog.weight?.toString() || "");
        setMood([todayLog.mood || 7]);
        setEnergy([todayLog.energy || 6]);
        setSymptoms(todayLog.symptoms || []);
        setNotes(todayLog.notes || "");
      }
    };
    
    loadTodayData();
  }, [getTodayLog]);

  const symptomsList = [
    "غثيان", "إرهاق", "صداع", "آلام الظهر", 
    "تورم القدمين", "حرقة المعدة", "أرق", "تقلبات مزاجية"
  ];

  const moodEmojis = ["😢", "😟", "😐", "🙂", "😊", "😄", "🥰"];

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    try {
      const todayData: DailyLogType = {
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(weight) || 0,
        mood: mood[0],
        energy: energy[0],
        symptoms,
        notes,
        timestamp: new Date().toISOString()
      };

      // Save to both local database and localStorage for compatibility
      await dbOperations.saveDailyLog({
        ...todayData,
        id: `log_${todayData.date}`
      });

      // Also maintain localStorage for existing functionality
      const existingData = JSON.parse(localStorage.getItem('dailyLogs') || '[]');
      const todayIndex = existingData.findIndex((log: any) => log.date === todayData.date);
      
      if (todayIndex >= 0) {
        existingData[todayIndex] = todayData;
      } else {
        existingData.push(todayData);
      }
      
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filteredData = existingData.filter((log: any) => 
        new Date(log.date) >= thirtyDaysAgo
      );
      
      localStorage.setItem('dailyLogs', JSON.stringify(filteredData));
      
      toast({
        title: "تم حفظ البيانات",
        description: "تم تسجيل حالتك اليوم بنجاح وسيظهر في تقاريرك الشخصية",
      });
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageHeader title="تسجيل الحالة اليوم" />

      <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Welcome Message */}
        <Card className="shadow-card bg-primary-light">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌸</div>
              <div>
                <h3 className="font-semibold text-foreground">صباح الخير سارة!</h3>
                <p className="text-sm text-muted-foreground">كيف تشعرين اليوم؟ دعينا نسجل حالتك</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Tracking */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-right">
              <Weight className="w-5 h-5 text-primary" />
              الوزن اليوم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="65.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-center"
              />
              <Label className="text-muted-foreground">كيلو</Label>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              الوزن المثالي في هذه المرحلة: 63-68 كيلو
            </p>
          </CardContent>
        </Card>

        {/* Mood Tracking */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-right">
              <Heart className="w-5 h-5 text-wellness" />
              المزاج العام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">{moodEmojis[mood[0] - 1]}</div>
              <p className="text-lg font-medium">
                {mood[0] <= 2 ? "حزينة" : mood[0] <= 4 ? "متعبة" : mood[0] <= 6 ? "جيدة" : "ممتازة"}
              </p>
            </div>
            <Slider
              value={mood}
              onValueChange={setMood}
              max={7}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>سيء جداً</span>
              <span>ممتاز</span>
            </div>
          </CardContent>
        </Card>

        {/* Energy Level */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-right">
              <Activity className="w-5 h-5 text-secondary" />
              مستوى الطاقة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{energy[0]}/10</div>
              <p className="text-sm text-muted-foreground">
                {energy[0] <= 3 ? "طاقة منخفضة" : energy[0] <= 6 ? "طاقة متوسطة" : "طاقة عالية"}
              </p>
            </div>
            <Slider
              value={energy}
              onValueChange={setEnergy}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-right">
              <MessageSquare className="w-5 h-5 text-accent" />
              الأعراض اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {symptomsList.map((symptom) => (
                <Badge
                  key={symptom}
                  variant={symptoms.includes(symptom) ? "default" : "outline"}
                  className={`cursor-pointer text-center py-2 transition-all ${
                    symptoms.includes(symptom) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-right">ملاحظات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="اكتبي أي ملاحظات أو مشاعر تريدين تسجيلها..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] text-right"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg"
        >
          <Calendar className="w-5 h-5 ml-2" />
          حفظ اليوم
        </Button>
      </div>
    </div>
  );
};

export default DailyLog;