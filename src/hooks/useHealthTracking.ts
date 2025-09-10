import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  week: number;
  notes?: string;
  timestamp: string;
}

export interface BloodPressureEntry {
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  week: number;
  notes?: string;
  timestamp: string;
}

export interface GlucoseEntry {
  id: string;
  date: string;
  time: string;
  glucose: number; // mg/dL
  measurementType: 'صائم' | 'بعد الوجبة' | 'قبل الوجبة' | 'عشوائي';
  week: number;
  notes?: string;
  timestamp: string;
}

export interface BabyMovementEntry {
  id: string;
  date: string;
  time: string;
  movements: number;
  timeSpent: number; // بالدقائق
  week: number;
  intensity: 'خفيف' | 'متوسط' | 'قوي';
  notes?: string;
  timestamp: string;
}

export interface SymptomEntry {
  id: string;
  date: string;
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = خفيف، 5 = شديد
  week: number;
  triggers?: string[];
  relief?: string[];
  notes?: string;
  timestamp: string;
}

export interface AppointmentEntry {
  id: string;
  date: string;
  time: string;
  type: 'فحص روتيني' | 'فحص طارئ' | 'سونار' | 'تحاليل' | 'أخرى';
  doctorName: string;
  location: string;
  week: number;
  notes?: string;
  results?: {
    weight?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    babyHeartRate?: number;
    babySize?: number;
    recommendations?: string[];
  };
  timestamp: string;
}

export interface HealthMetrics {
  totalEntries: number;
  weightGain: number;
  averageBP: { systolic: number; diastolic: number };
  movementTrend: 'زائد' | 'ثابت' | 'ناقص';
  lastAppointment?: AppointmentEntry;
  upcomingAppointments: AppointmentEntry[];
  riskFactors: string[];
}

export interface WeeklyReport {
  week: number;
  startDate: string;
  endDate: string;
  weightChange: number;
  avgBP: { systolic: number; diastolic: number };
  movementCount: number;
  symptomsCount: number;
  topSymptoms: string[];
  recommendations: string[];
  alerts: string[];
}

/**
 * Hook لتتبع الصحة والحمل المتقدم
 * يدير الوزن، ضغط الدم، حركة الجنين، الأعراض، والمواعيد
 */
export const useHealthTracking = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [bpEntries, setBpEntries] = useState<BloodPressureEntry[]>([]);
  const [glucoseEntries, setGlucoseEntries] = useState<GlucoseEntry[]>([]);
  const [movementEntries, setMovementEntries] = useState<BabyMovementEntry[]>([]);
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([]);
  const [appointments, setAppointments] = useState<AppointmentEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة البيانات
  useEffect(() => {
    loadAllData();
  }, []);

  // حفظ البيانات عند التغيير
  useEffect(() => {
    if (isInitialized) {
      saveAllData();
    }
  }, [weightEntries, bpEntries, glucoseEntries, movementEntries, symptomEntries, appointments, isInitialized]);

  // تحميل جميع البيانات
  const loadAllData = useCallback(() => {
    try {
      const savedWeight = localStorage.getItem('healthTracking_weight');
      const savedBP = localStorage.getItem('healthTracking_bp');
      const savedGlucose = localStorage.getItem('healthTracking_glucose');
      const savedMovement = localStorage.getItem('healthTracking_movement');
      const savedSymptoms = localStorage.getItem('healthTracking_symptoms');
      const savedAppointments = localStorage.getItem('healthTracking_appointments');
      const savedWeek = localStorage.getItem('healthTracking_currentWeek');

      if (savedWeight) setWeightEntries(JSON.parse(savedWeight));
      if (savedBP) setBpEntries(JSON.parse(savedBP));
      if (savedGlucose) setGlucoseEntries(JSON.parse(savedGlucose));
      if (savedMovement) setMovementEntries(JSON.parse(savedMovement));
      if (savedSymptoms) setSymptomEntries(JSON.parse(savedSymptoms));
      if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
      if (savedWeek) setCurrentWeek(parseInt(savedWeek));

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading health tracking data:', error);
      setIsInitialized(true);
    }
  }, []);

  // حفظ جميع البيانات
  const saveAllData = useCallback(() => {
    try {
      localStorage.setItem('healthTracking_weight', JSON.stringify(weightEntries));
      localStorage.setItem('healthTracking_bp', JSON.stringify(bpEntries));
      localStorage.setItem('healthTracking_glucose', JSON.stringify(glucoseEntries));
      localStorage.setItem('healthTracking_movement', JSON.stringify(movementEntries));
      localStorage.setItem('healthTracking_symptoms', JSON.stringify(symptomEntries));
      localStorage.setItem('healthTracking_appointments', JSON.stringify(appointments));
      localStorage.setItem('healthTracking_currentWeek', currentWeek.toString());
    } catch (error) {
      console.error('Error saving health tracking data:', error);
    }
  }, [weightEntries, bpEntries, glucoseEntries, movementEntries, symptomEntries, appointments, currentWeek]);

  // إضافة قياس الوزن
  const addWeightEntry = useCallback((weight: number, notes?: string) => {
    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weight,
      week: currentWeek,
      notes,
      timestamp: new Date().toISOString()
    };

    setWeightEntries(prev => [entry, ...prev]);
    
    toast({
      title: "تم إضافة قياس الوزن",
      description: `الوزن: ${weight} كغ - الأسبوع ${currentWeek}`,
    });

    return entry;
  }, [currentWeek]);

  // إضافة قياس ضغط الدم
  const addBloodPressureEntry = useCallback((systolic: number, diastolic: number, notes?: string) => {
    const entry: BloodPressureEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      systolic,
      diastolic,
      week: currentWeek,
      notes,
      timestamp: new Date().toISOString()
    };

    setBpEntries(prev => [entry, ...prev]);

    // تحذير إذا كان الضغط مرتفع
    if (systolic >= 140 || diastolic >= 90) {
      toast({
        title: "⚠️ ضغط دم مرتفع",
        description: "يُنصح بمراجعة الطبيب فوراً",
        variant: "destructive"
      });
    } else {
      toast({
        title: "تم إضافة قياس ضغط الدم",
        description: `${systolic}/${diastolic} - الأسبوع ${currentWeek}`,
      });
    }

    return entry;
  }, [currentWeek]);

  // إضافة قياس السكر
  const addGlucoseEntry = useCallback((
    glucose: number,
    measurementType: GlucoseEntry['measurementType'],
    notes?: string
  ) => {
    const entry: GlucoseEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      glucose,
      measurementType,
      week: currentWeek,
      notes,
      timestamp: new Date().toISOString()
    };

    setGlucoseEntries(prev => [entry, ...prev]);

    // تحذيرات حسب نوع القياس
    const isHighRisk = 
      (measurementType === 'صائم' && glucose >= 126) ||
      (measurementType === 'بعد الوجبة' && glucose >= 200) ||
      (measurementType === 'عشوائي' && glucose >= 200) ||
      (measurementType === 'قبل الوجبة' && glucose >= 100);

    const isElevated = 
      (measurementType === 'صائم' && glucose >= 100) ||
      (measurementType === 'بعد الوجبة' && glucose >= 140) ||
      (measurementType === 'قبل الوجبة' && glucose >= 95);

    if (isHighRisk) {
      toast({
        title: "⚠️ سكر مرتفع",
        description: "يُنصح بمراجعة الطبيب فوراً - قد يكون سكري الحمل",
        variant: "destructive"
      });
    } else if (isElevated) {
      toast({
        title: "تنبيه: سكر مرتفع نسبياً",
        description: "راقبي نظامك الغذائي وتحدثي مع طبيبك",
        variant: "default"
      });
    } else {
      toast({
        title: "تم تسجيل قياس السكر",
        description: `${glucose} mg/dL - ${measurementType}`,
      });
    }

    return entry;
  }, [currentWeek]);

  // إضافة تتبع حركة الجنين
  const addBabyMovementEntry = useCallback((
    movements: number, 
    timeSpent: number, 
    intensity: BabyMovementEntry['intensity'],
    notes?: string
  ) => {
    const entry: BabyMovementEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      movements,
      timeSpent,
      week: currentWeek,
      intensity,
      notes,
      timestamp: new Date().toISOString()
    };

    setMovementEntries(prev => [entry, ...prev]);

    // تحذير إذا كانت الحركة قليلة
    if (currentWeek >= 28 && movements < 10 && timeSpent >= 120) {
      toast({
        title: "⚠️ حركة جنين قليلة",
        description: "تواصلي مع طبيبك إذا استمرت قلة الحركة",
        variant: "destructive"
      });
    } else {
      toast({
        title: "تم تسجيل حركة الجنين",
        description: `${movements} حركة في ${timeSpent} دقيقة`,
      });
    }

    return entry;
  }, [currentWeek]);

  // إضافة عرض
  const addSymptomEntry = useCallback((
    symptom: string,
    severity: SymptomEntry['severity'],
    triggers?: string[],
    relief?: string[],
    notes?: string
  ) => {
    const entry: SymptomEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symptom,
      severity,
      week: currentWeek,
      triggers,
      relief,
      notes,
      timestamp: new Date().toISOString()
    };

    setSymptomEntries(prev => [entry, ...prev]);

    toast({
      title: "تم تسجيل العرض",
      description: `${symptom} - شدة ${severity}/5`,
    });

    return entry;
  }, [currentWeek]);

  // إضافة موعد طبي
  const addAppointment = useCallback((
    date: string,
    time: string,
    type: AppointmentEntry['type'],
    doctorName: string,
    location: string,
    notes?: string
  ) => {
    const entry: AppointmentEntry = {
      id: Date.now().toString(),
      date,
      time,
      type,
      doctorName,
      location,
      week: currentWeek,
      notes,
      timestamp: new Date().toISOString()
    };

    setAppointments(prev => [...prev, entry].sort((a, b) => 
      new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
    ));

    toast({
      title: "تم إضافة الموعد",
      description: `${type} مع ${doctorName} في ${date}`,
    });

    return entry;
  }, [currentWeek]);

  // حساب المقاييس الصحية
  const getHealthMetrics = useCallback((): HealthMetrics => {
    const totalEntries = weightEntries.length + bpEntries.length + movementEntries.length + symptomEntries.length;
    
    // حساب زيادة الوزن
    const weightGain = weightEntries.length >= 2 
      ? weightEntries[0].weight - weightEntries[weightEntries.length - 1].weight
      : 0;

    // متوسط ضغط الدم
    const avgBP = bpEntries.length > 0
      ? {
          systolic: Math.round(bpEntries.reduce((sum, entry) => sum + entry.systolic, 0) / bpEntries.length),
          diastolic: Math.round(bpEntries.reduce((sum, entry) => sum + entry.diastolic, 0) / bpEntries.length)
        }
      : { systolic: 0, diastolic: 0 };

    // اتجاه حركة الجنين
    const recentMovements = movementEntries.slice(0, 7); // آخر 7 أيام
    const olderMovements = movementEntries.slice(7, 14);
    const movementTrend: 'زائد' | 'ثابت' | 'ناقص' = 
      recentMovements.length === 0 ? 'ثابت' :
      olderMovements.length === 0 ? 'ثابت' :
      recentMovements.reduce((sum, m) => sum + m.movements, 0) / recentMovements.length >
      olderMovements.reduce((sum, m) => sum + m.movements, 0) / olderMovements.length ? 'زائد' : 'ناقص';

    // آخر موعد والمواعيد القادمة
    const now = new Date();
    const pastAppointments = appointments.filter(apt => new Date(apt.date + ' ' + apt.time) < now);
    const lastAppointment = pastAppointments[pastAppointments.length - 1];
    const upcomingAppointments = appointments.filter(apt => new Date(apt.date + ' ' + apt.time) > now);

    // عوامل الخطر
    const riskFactors: string[] = [];
    if (avgBP.systolic >= 140 || avgBP.diastolic >= 90) riskFactors.push('ضغط دم مرتفع');
    if (weightGain > 18) riskFactors.push('زيادة وزن مفرطة');
    if (recentMovements.length > 0 && recentMovements.every(m => m.movements < 10)) riskFactors.push('قلة حركة الجنين');
    
    return {
      totalEntries,
      weightGain,
      averageBP: avgBP,
      movementTrend,
      lastAppointment,
      upcomingAppointments,
      riskFactors
    };
  }, [weightEntries, bpEntries, movementEntries, symptomEntries, appointments]);

  // إنشاء تقرير أسبوعي
  const generateWeeklyReport = useCallback((week: number): WeeklyReport => {
    const weekEntries = {
      weight: weightEntries.filter(e => e.week === week),
      bp: bpEntries.filter(e => e.week === week),
      movement: movementEntries.filter(e => e.week === week),
      symptoms: symptomEntries.filter(e => e.week === week)
    };

    // تواريخ الأسبوع (تقريبية)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (currentWeek - week) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // تغيير الوزن
    const weightChange = weekEntries.weight.length >= 2
      ? weekEntries.weight[0].weight - weekEntries.weight[weekEntries.weight.length - 1].weight
      : 0;

    // متوسط ضغط الدم
    const avgBP = weekEntries.bp.length > 0
      ? {
          systolic: Math.round(weekEntries.bp.reduce((sum, e) => sum + e.systolic, 0) / weekEntries.bp.length),
          diastolic: Math.round(weekEntries.bp.reduce((sum, e) => sum + e.diastolic, 0) / weekEntries.bp.length)
        }
      : { systolic: 0, diastolic: 0 };

    // إجمالي حركة الجنين
    const movementCount = weekEntries.movement.reduce((sum, e) => sum + e.movements, 0);

    // الأعراض الأكثر شيوعاً
    const symptomCounts: { [key: string]: number } = {};
    weekEntries.symptoms.forEach(s => {
      symptomCounts[s.symptom] = (symptomCounts[s.symptom] || 0) + 1;
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom);

    // توصيات بناءً على البيانات
    const recommendations: string[] = [];
    if (weightChange > 1) recommendations.push('راقبي زيادة الوزن - تحدثي مع طبيبك');
    if (avgBP.systolic > 130) recommendations.push('راقبي ضغط الدم واشربي المزيد من الماء');
    if (movementCount < 70 && week >= 28) recommendations.push('راقبي حركة الجنين أكثر');
    if (weekEntries.symptoms.some(s => s.severity >= 4)) recommendations.push('راجعي الطبيب للأعراض الشديدة');

    // تنبيهات
    const alerts: string[] = [];
    if (avgBP.systolic >= 140) alerts.push('ضغط دم مرتفع - راجعي الطبيب فوراً');
    if (movementCount === 0 && week >= 20) alerts.push('لم يتم تسجيل حركة جنين هذا الأسبوع');

    return {
      week,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      weightChange,
      avgBP,
      movementCount,
      symptomsCount: weekEntries.symptoms.length,
      topSymptoms,
      recommendations,
      alerts
    };
  }, [weightEntries, bpEntries, movementEntries, symptomEntries, currentWeek]);

  // حذف مدخل
  const deleteEntry = useCallback((type: 'weight' | 'bp' | 'glucose' | 'movement' | 'symptom' | 'appointment', id: string) => {
    switch (type) {
      case 'weight':
        setWeightEntries(prev => prev.filter(e => e.id !== id));
        break;
      case 'bp':
        setBpEntries(prev => prev.filter(e => e.id !== id));
        break;
      case 'glucose':
        setGlucoseEntries(prev => prev.filter(e => e.id !== id));
        break;
      case 'movement':
        setMovementEntries(prev => prev.filter(e => e.id !== id));
        break;
      case 'symptom':
        setSymptomEntries(prev => prev.filter(e => e.id !== id));
        break;
      case 'appointment':
        setAppointments(prev => prev.filter(e => e.id !== id));
        break;
    }

    toast({
      title: "تم الحذف",
      description: "تم حذف المدخل بنجاح",
    });
  }, []);

  // تصدير البيانات
  const exportHealthData = useCallback(() => {
    const data = {
      weightEntries,
      bpEntries,
      glucoseEntries,
      movementEntries,
      symptomEntries,
      appointments,
      currentWeek,
      metrics: getHealthMetrics(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-tracking-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم التصدير",
      description: "تم تصدير بيانات التتبع الصحي بنجاح",
    });
  }, [weightEntries, bpEntries, movementEntries, symptomEntries, appointments, currentWeek, getHealthMetrics]);

  // إحصائيات عامة
  const getStats = useCallback(() => {
    return {
      totalEntries: weightEntries.length + bpEntries.length + movementEntries.length + symptomEntries.length + appointments.length,
      entriesThisWeek: {
        weight: weightEntries.filter(e => e.week === currentWeek).length,
        bp: bpEntries.filter(e => e.week === currentWeek).length,
        movement: movementEntries.filter(e => e.week === currentWeek).length,
        symptoms: symptomEntries.filter(e => e.week === currentWeek).length
      },
      streakDays: Math.max(
        ...['weight', 'bp', 'movement', 'symptom'].map(type => {
          const entries = type === 'weight' ? weightEntries :
                         type === 'bp' ? bpEntries :
                         type === 'movement' ? movementEntries : symptomEntries;
          
          let streak = 0;
          const today = new Date();
          
          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            if (entries.some(e => e.date === dateStr)) {
              streak++;
            } else {
              break;
            }
          }
          return streak;
        })
      )
    };
  }, [weightEntries, bpEntries, movementEntries, symptomEntries, currentWeek]);

  return {
    // البيانات
    weightEntries,
    bpEntries,
    glucoseEntries,
    movementEntries,
    symptomEntries,
    appointments,
    currentWeek,
    isInitialized,

    // الوظائف
    addWeightEntry,
    addBloodPressureEntry,
    addGlucoseEntry,
    addBabyMovementEntry,
    addSymptomEntry,
    addAppointment,
    deleteEntry,
    setCurrentWeek,
    exportHealthData,

    // التحليلات
    getHealthMetrics,
    generateWeeklyReport,
    getStats,

    // إعادة التحميل
    loadAllData,
    saveAllData
  };
};