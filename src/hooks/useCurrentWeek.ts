import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface PregnancyInfo {
  dueDate: string;
  lastPeriod: string;
  currentWeek: number;
  estimatedDueDate: string;
}

export const useCurrentWeek = () => {
  const [pregnancyInfo, setPregnancyInfo] = useLocalStorage<PregnancyInfo | null>('pregnancy_info', null);
  const [selectedWeek, setSelectedWeek] = useState<number>(4); // الأسبوع الافتراضي

  // حساب الأسبوع الحالي بناءً على تاريخ آخر دورة شهرية
  const calculateCurrentWeek = useCallback((lastPeriodDate: string): number => {
    const lastPeriod = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = today.getTime() - lastPeriod.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    
    // التأكد من أن الأسبوع ضمن النطاق المنطقي (1-42 أسبوع)
    return Math.max(1, Math.min(42, weeks));
  }, []);

  // حساب موعد الولادة المتوقع
  const calculateDueDate = useCallback((lastPeriodDate: string): string => {
    const lastPeriod = new Date(lastPeriodDate);
    const dueDate = new Date(lastPeriod.getTime() + (280 * 24 * 60 * 60 * 1000)); // 280 يوم
    return dueDate.toISOString().split('T')[0];
  }, []);

  // تحديث معلومات الحمل
  const updatePregnancyInfo = useCallback((lastPeriodDate: string) => {
    const currentWeek = calculateCurrentWeek(lastPeriodDate);
    const estimatedDueDate = calculateDueDate(lastPeriodDate);
    
    const newInfo: PregnancyInfo = {
      lastPeriod: lastPeriodDate,
      dueDate: estimatedDueDate,
      currentWeek,
      estimatedDueDate
    };
    
    setPregnancyInfo(newInfo);
    setSelectedWeek(currentWeek);
    
    return newInfo;
  }, [calculateCurrentWeek, calculateDueDate, setPregnancyInfo]);

  // تحديث الأسبوع الحالي (للتحديث اليومي)
  const refreshCurrentWeek = useCallback(() => {
    if (pregnancyInfo?.lastPeriod) {
      const newWeek = calculateCurrentWeek(pregnancyInfo.lastPeriod);
      if (newWeek !== pregnancyInfo.currentWeek) {
        const updatedInfo = { ...pregnancyInfo, currentWeek: newWeek };
        setPregnancyInfo(updatedInfo);
        setSelectedWeek(newWeek);
      }
    }
  }, [pregnancyInfo, calculateCurrentWeek, setPregnancyInfo]);

  // الحصول على معلومات الثلث الحالي
  const getTrimesterInfo = useCallback((week: number) => {
    if (week <= 12) {
      return {
        trimester: 1,
        name: 'الثلث الأول',
        description: 'مرحلة تكوين الأعضاء الأساسية',
        weeksRemaining: 13 - week,
        color: 'red'
      };
    } else if (week <= 27) {
      return {
        trimester: 2,
        name: 'الثلث الثاني',
        description: 'مرحلة النمو والطاقة',
        weeksRemaining: 28 - week,
        color: 'green'
      };
    } else {
      return {
        trimester: 3,
        name: 'الثلث الثالث',
        description: 'مرحلة النضج والاستعداد للولادة',
        weeksRemaining: 41 - week,
        color: 'blue'
      };
    }
  }, []);

  // حساب النسبة المئوية للحمل
  const getPregnancyProgress = useCallback((week: number): number => {
    return Math.round((week / 40) * 100);
  }, []);

  // حساب الأيام المتبقية للولادة
  const getDaysUntilDue = useCallback((): number | null => {
    if (!pregnancyInfo?.dueDate) return null;
    
    const dueDate = new Date(pregnancyInfo.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }, [pregnancyInfo]);

  // تحديث تلقائي يومي
  useEffect(() => {
    refreshCurrentWeek();
    
    // تحديث كل يوم في منتصف الليل
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      refreshCurrentWeek();
      
      // ثم كل 24 ساعة
      const intervalId = setInterval(refreshCurrentWeek, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, msUntilTomorrow);
    
    return () => clearTimeout(timeoutId);
  }, [refreshCurrentWeek]);

  // تحديد الأسبوع المعروض (إما الحالي أو المختار)
  const displayWeek = selectedWeek;
  
  return {
    // معلومات الحمل الأساسية
    pregnancyInfo,
    updatePregnancyInfo,
    refreshCurrentWeek,
    
    // الأسبوع المعروض والحالي
    currentWeek: pregnancyInfo?.currentWeek || 4,
    selectedWeek: displayWeek,
    setSelectedWeek,
    
    // معلومات مفيدة
    trimesterInfo: getTrimesterInfo(displayWeek),
    pregnancyProgress: getPregnancyProgress(displayWeek),
    daysUntilDue: getDaysUntilDue(),
    
    // حالات مفيدة
    isPregnancyInfoSet: !!pregnancyInfo,
    isOverdue: pregnancyInfo ? getDaysUntilDue() === 0 : false,
    
    // وظائف مساعدة
    calculateCurrentWeek,
    calculateDueDate,
    getTrimesterInfo,
    getPregnancyProgress
  };
};