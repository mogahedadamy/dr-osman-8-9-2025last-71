import { useState, useEffect } from 'react';

export interface DailyLog {
  date: string;
  weight: number;
  mood: number;
  energy: number;
  symptoms: string[];
  notes: string;
  timestamp: string;
}

export const useDailyLogs = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('dailyLogs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        setLogs(parsedLogs);
      } catch (error) {
        console.error('خطأ في تحميل البيانات اليومية:', error);
        setLogs([]);
      }
    }
  }, []);

  const addLog = (newLog: DailyLog) => {
    setLogs(prev => {
      const existingIndex = prev.findIndex(log => log.date === newLog.date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newLog;
        localStorage.setItem('dailyLogs', JSON.stringify(updated));
        return updated;
      } else {
        const updated = [...prev, newLog];
        localStorage.setItem('dailyLogs', JSON.stringify(updated));
        return updated;
      }
    });
  };

  const getLogsForWeek = (weekOffset: number = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    });
  };

  const getAverageStats = (days: number = 7) => {
    const recentLogs = logs
      .filter(log => {
        const logDate = new Date(log.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return logDate >= cutoffDate;
      });

    if (recentLogs.length === 0) {
      return {
        avgMood: 0,
        avgEnergy: 0,
        avgWeight: 0,
        commonSymptoms: []
      };
    }

    const avgMood = recentLogs.reduce((sum, log) => sum + log.mood, 0) / recentLogs.length;
    const avgEnergy = recentLogs.reduce((sum, log) => sum + log.energy, 0) / recentLogs.length;
    const avgWeight = recentLogs.reduce((sum, log) => sum + log.weight, 0) / recentLogs.length;

    // Get most common symptoms
    const symptomCounts: Record<string, number> = {};
    recentLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const commonSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom]) => symptom);

    return {
      avgMood: Math.round(avgMood * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgWeight: Math.round(avgWeight * 10) / 10,
      commonSymptoms
    };
  };

  const getTodayLog = () => {
    const today = new Date().toISOString().split('T')[0];
    return logs.find(log => log.date === today);
  };

  return {
    logs,
    addLog,
    getLogsForWeek,
    getAverageStats,
    getTodayLog
  };
};