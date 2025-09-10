import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Baby, Clock, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, isToday } from "date-fns";
import { ar } from "date-fns/locale";

interface KickSession {
  id: string;
  date: string;
  startTime: Date;
  endTime?: Date;
  kicks: number;
  duration: number; // in minutes
  completed: boolean;
}

interface DailyKicks {
  date: string;
  sessions: KickSession[];
  totalKicks: number;
}

const KickCounter = () => {
  const [isActive, setIsActive] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessions, setSessions] = useState<DailyKicks[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kickCounterSessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (error) {
        console.error("Error loading kick sessions:", error);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("kickCounterSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Timer effect
  useEffect(() => {
    if (isActive && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    const now = new Date();
    setStartTime(now);
    setIsActive(true);
    setKickCount(0);
    setElapsedTime(0);
    toast({
      title: "بدء العد",
      description: "اضغطي على زر 'ضربة' كلما شعرتِ بحركة الطفل",
    });
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    if (startTime) {
      setIsActive(true);
    }
  };

  const addKick = () => {
    if (!isActive || !startTime) return;
    
    const newCount = kickCount + 1;
    setKickCount(newCount);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Check if reached 10 kicks (typical target)
    if (newCount === 10) {
      const duration = Math.floor(elapsedTime / 60);
      toast({
        title: "ممتاز! 10 حركات مكتملة",
        description: `وقت الوصول: ${duration} دقيقة`,
      });
    }
  };

  const endSession = () => {
    if (!startTime) return;

    const session: KickSession = {
      id: Date.now().toString(),
      date: format(startTime, 'yyyy-MM-dd'),
      startTime,
      endTime: new Date(),
      kicks: kickCount,
      duration: Math.floor(elapsedTime / 60),
      completed: kickCount >= 10
    };

    const today = format(new Date(), 'yyyy-MM-dd');
    const existingDayIndex = sessions.findIndex(day => day.date === today);

    if (existingDayIndex >= 0) {
      const updatedSessions = [...sessions];
      updatedSessions[existingDayIndex].sessions.push(session);
      updatedSessions[existingDayIndex].totalKicks += kickCount;
      setSessions(updatedSessions);
    } else {
      const newDay: DailyKicks = {
        date: today,
        sessions: [session],
        totalKicks: kickCount
      };
      setSessions([newDay, ...sessions.slice(0, 6)]); // Keep last 7 days
    }

    // Reset
    setIsActive(false);
    setStartTime(null);
    setKickCount(0);
    setElapsedTime(0);

    toast({
      title: "تم حفظ الجلسة",
      description: `${kickCount} حركة في ${Math.floor(elapsedTime / 60)} دقيقة`,
    });
  };

  const resetSession = () => {
    setIsActive(false);
    setStartTime(null);
    setKickCount(0);
    setElapsedTime(0);
  };

  const todaysSessions = sessions.find(day => day.date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="counter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="counter">العداد</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        <TabsContent value="counter" className="space-y-4">
          {/* Current Session Card */}
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Baby className="w-5 h-5 text-accent" />
                عداد حركات الجنين
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                اعدي حركات طفلك واضغطي على الزر عند كل حركة
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Display */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">{kickCount}</div>
                  <p className="text-sm text-muted-foreground">حركة</p>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-secondary">{formatTime(elapsedTime)}</div>
                  <p className="text-sm text-muted-foreground">الوقت</p>
                </div>
              </div>

              {/* Progress */}
              {kickCount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم</span>
                    <span>{kickCount}/10 حركات</span>
                  </div>
                  <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${Math.min((kickCount / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isActive && !startTime && (
                  <Button onClick={startSession} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    بدء العد
                  </Button>
                )}

                {startTime && (
                  <>
                    {/* Kick Button */}
                    <Button 
                      onClick={addKick}
                      disabled={!isActive}
                      className="w-full text-lg h-16 bg-accent hover:bg-accent/90"
                      size="lg"
                    >
                      <Baby className="w-6 h-6 mr-2" />
                      ضربة! ({kickCount})
                    </Button>

                    {/* Control Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        onClick={isActive ? pauseSession : resumeSession}
                        size="sm"
                      >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={endSession}
                        disabled={kickCount === 0}
                        size="sm"
                      >
                        حفظ
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={resetSession}
                        size="sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-info/20 bg-info/5">
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold text-info">نصائح مهمة:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• الهدف: 10 حركات في ساعتين كحد أقصى</li>
                <li>• أفضل وقت: بعد الوجبات أو في المساء</li>
                <li>• اجلسي أو استلقي في مكان هادئ</li>
                <li>• استشيري الطبيب إذا قلت الحركة</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Today's Summary */}
          {todaysSessions && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  اليوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">{todaysSessions.sessions.length}</div>
                    <p className="text-sm text-muted-foreground">جلسة</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">{todaysSessions.totalKicks}</div>
                    <p className="text-sm text-muted-foreground">حركة إجمالية</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {todaysSessions.sessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant={session.completed ? "default" : "secondary"}>
                          جلسة {index + 1}
                        </Badge>
                        <span className="text-sm">
                          {format(session.startTime, 'HH:mm', { locale: ar })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Baby className="w-3 h-3" />
                          {session.kicks}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.duration}د
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly History */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-wellness" />
                السجل الأسبوعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {isToday(new Date(day.date)) ? 'اليوم' : format(new Date(day.date), 'dd MMMM', { locale: ar })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {day.sessions.length} جلسة
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{day.totalKicks}</p>
                        <p className="text-sm text-muted-foreground">حركة</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Baby className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد جلسات مسجلة بعد</p>
                  <p className="text-sm">ابدئي أول جلسة عد للحركات</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KickCounter;