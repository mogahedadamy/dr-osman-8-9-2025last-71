import { useState, useEffect, useCallback } from 'react';
import { PregnancyInfo } from '@/types';
import { dbOperations } from '@/lib/localDatabase';

// Simple notification function without using useToast
const showToast = (title: string, description?: string, variant?: 'default' | 'destructive') => {
  console.log(`${variant === 'destructive' ? '❌' : '✅'} ${title}${description ? ': ' + description : ''}`);
};

// Helper function to format date in Arabic DD/MM/YYYY format
const formatArabicDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Hook لحساب وإدارة معلومات الحمل
 * يحسب الأسبوع الحالي وتاريخ الولادة المتوقع بناءً على تاريخ آخر دورة
 */
export const usePregnancyTracking = () => {
  const [pregnancyInfo, setPregnancyInfo] = useState<PregnancyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // حساب الأسبوع الحالي من الحمل
  const calculateCurrentWeek = useCallback((lastPeriodDate: string): number => {
    const lastPeriod = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = today.getTime() - lastPeriod.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    
    // الحمل عادة يكون 40 أسبوع، نتأكد من أن الرقم منطقي
    return Math.max(0, Math.min(42, weeks));
  }, []);

  // حساب تاريخ الولادة المتوقع (280 يوم من آخر دورة)
  const calculateDueDate = useCallback((lastPeriodDate: string): string => {
    const lastPeriod = new Date(lastPeriodDate);
    const dueDate = new Date(lastPeriod);
    dueDate.setDate(dueDate.getDate() + 280); // 40 أسبوع × 7 أيام
    return dueDate.toISOString().split('T')[0];
  }, []);

  // تحميل معلومات الحمل من قاعدة البيانات
  const loadPregnancyInfo = useCallback(async () => {
    try {
      setLoading(true);
      const saved = await dbOperations.getSetting('pregnancyInfo');
      
      if (saved) {
        const info = JSON.parse(saved) as PregnancyInfo;
        // إعادة حساب الأسبوع الحالي في كل مرة
        const currentWeek = calculateCurrentWeek(info.lastPeriodDate);
        const updatedInfo = { ...info, currentWeek };
        setPregnancyInfo(updatedInfo);
        
        // حفظ التحديث
        await dbOperations.saveSetting('pregnancyInfo', JSON.stringify(updatedInfo));
      }
    } catch (error) {
      console.error('خطأ في تحميل معلومات الحمل:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateCurrentWeek]);

  // حفظ معلومات الحمل
  const savePregnancyInfo = async (lastPeriodDate: string) => {
    try {
      const currentWeek = calculateCurrentWeek(lastPeriodDate);
      const dueDate = calculateDueDate(lastPeriodDate);
      const pregnancyStartDate = lastPeriodDate;
      
      const newInfo: PregnancyInfo = {
        id: 'main',
        lastPeriodDate,
        currentWeek,
        dueDate,
        estimatedDueDate: dueDate,
        pregnancyStartDate,
        isActive: true
      };

      await dbOperations.saveSetting('pregnancyInfo', JSON.stringify(newInfo));
      setPregnancyInfo(newInfo);

      showToast("تم حفظ معلومات الحمل", `الأسبوع الحالي: ${currentWeek} | تاريخ الولادة المتوقع: ${formatArabicDate(new Date(dueDate))}`);

      return newInfo;
    } catch (error) {
      console.error('خطأ في حفظ معلومات الحمل:', error);
      showToast("خطأ في الحفظ", "حدث خطأ أثناء حفظ معلومات الحمل", "destructive");
    }
  };

  // تحديث معلومات الحمل
  const updatePregnancyInfo = async (updates: Partial<PregnancyInfo>) => {
    if (!pregnancyInfo) return;

    try {
      const updatedInfo = { ...pregnancyInfo, ...updates };
      
      // إذا تم تحديث تاريخ آخر دورة، أعد حساب كل شيء
      if (updates.lastPeriodDate) {
        updatedInfo.currentWeek = calculateCurrentWeek(updates.lastPeriodDate);
        updatedInfo.dueDate = calculateDueDate(updates.lastPeriodDate);
        updatedInfo.estimatedDueDate = updatedInfo.dueDate;
      }

      await dbOperations.saveSetting('pregnancyInfo', JSON.stringify(updatedInfo));
      setPregnancyInfo(updatedInfo);

      showToast("تم تحديث معلومات الحمل", "تم حفظ التحديثات بنجاح");
    } catch (error) {
      console.error('خطأ في تحديث معلومات الحمل:', error);
    }
  };

  // حساب نسبة التقدم في الحمل
  const getProgressPercentage = (): number => {
    if (!pregnancyInfo) return 0;
    return Math.min(100, (pregnancyInfo.currentWeek / 40) * 100);
  };

  // الحصول على الثلث الحالي
  const getCurrentTrimester = (): 1 | 2 | 3 => {
    if (!pregnancyInfo) return 1;
    const week = pregnancyInfo.currentWeek;
    if (week <= 12) return 1;
    if (week <= 26) return 2;
    return 3;
  };

  // حساب الأيام المتبقية للولادة
  const getDaysUntilDueDate = (): number => {
    if (!pregnancyInfo) return 0;
    const today = new Date();
    const dueDate = new Date(pregnancyInfo.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // الحصول على معلومات الثلث الحالي
  const getTrimesterInfo = () => {
    const trimester = getCurrentTrimester();
    const trimesterData = {
      1: {
        name: 'الثلث الأول',
        description: 'فترة التكوين الأولى للجنين',
        weeks: '1-12',
        color: 'text-primary',
        emoji: '🌱'
      },
      2: {
        name: 'الثلث الثاني',
        description: 'فترة النمو السريع والاستقرار',
        weeks: '13-26',
        color: 'text-secondary',
        emoji: '🤰'
      },
      3: {
        name: 'الثلث الثالث',
        description: 'الاستعداد للولادة ونضج الجنين',
        weeks: '27-40',
        color: 'text-wellness',
        emoji: '👶'
      }
    };

    return trimesterData[trimester];
  };

  useEffect(() => {
    loadPregnancyInfo();
  }, [loadPregnancyInfo]);

  return {
    pregnancyInfo,
    loading,
    currentWeek: pregnancyInfo?.currentWeek || 0,
    dueDate: pregnancyInfo?.dueDate || '',
    savePregnancyInfo,
    updatePregnancyInfo,
    getProgressPercentage,
    getCurrentTrimester,
    getDaysUntilDueDate,
    getTrimesterInfo,
    reloadPregnancyInfo: loadPregnancyInfo
  };
};