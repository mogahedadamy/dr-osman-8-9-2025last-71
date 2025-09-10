import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UserAnalytics {
  userId: string;
  sessionId: string;
  totalSessions: number;
  totalTimeSpent: number; // بالدقائق
  contentInteractions: {
    articlesRead: number;
    videosWatched: number;
    encyclopediaSearches: number;
    tipsViewed: number;
  };
  favoriteCategories: string[];
  averageSessionTime: number;
  lastActiveDate: string;
  pregnancyWeek?: number;
  joinDate: string;
  deviceInfo: {
    platform: string;
    isMobile: boolean;
    screenSize: string;
  };
}

export interface ContentAnalytics {
  contentId: string;
  contentType: 'article' | 'video' | 'encyclopedia' | 'tip';
  title: string;
  views: number;
  favorites: number;
  averageTimeSpent: number;
  completionRate: number;
  ratings: number[];
  averageRating: number;
  searchKeywords: string[];
  popularSections?: string[];
}

export interface AppAnalytics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  contentStats: {
    totalContent: number;
    mostPopular: ContentAnalytics[];
    leastPopular: ContentAnalytics[];
    categoryDistribution: { [category: string]: number };
  };
  userEngagement: {
    averageSessionTime: number;
    bounceRate: number;
    retentionRate: {
      day1: number;
      day7: number;
      day30: number;
    };
  };
  featureUsage: {
    [featureName: string]: {
      usage: number;
      lastUsed: string;
    };
  };
}

export const useAnalytics = () => {
  const { toast } = useToast();
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>([]);
  const [appAnalytics, setAppAnalytics] = useState<AppAnalytics | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة النظام
  useEffect(() => {
    initializeAnalytics();
    startNewSession();

    // تتبع إغلاق الصفحة لحفظ وقت الجلسة
    const handleBeforeUnload = () => {
      endCurrentSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endCurrentSession();
    };
  }, []);

  // تهيئة التحليلات
  const initializeAnalytics = () => {
    try {
      // جلب بيانات المستخدم المحفوظة
      const savedUserAnalytics = localStorage.getItem('userAnalytics');
      if (savedUserAnalytics) {
        setUserAnalytics(JSON.parse(savedUserAnalytics));
      } else {
        // إنشاء بيانات مستخدم جديد
        const newUserAnalytics: UserAnalytics = {
          userId: generateUserId(),
          sessionId: generateSessionId(),
          totalSessions: 0,
          totalTimeSpent: 0,
          contentInteractions: {
            articlesRead: 0,
            videosWatched: 0,
            encyclopediaSearches: 0,
            tipsViewed: 0
          },
          favoriteCategories: [],
          averageSessionTime: 0,
          lastActiveDate: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          deviceInfo: {
            platform: navigator.platform,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            screenSize: `${window.screen.width}x${window.screen.height}`
          }
        };
        setUserAnalytics(newUserAnalytics);
        localStorage.setItem('userAnalytics', JSON.stringify(newUserAnalytics));
      }

      // جلب تحليلات المحتوى
      const savedContentAnalytics = localStorage.getItem('contentAnalytics');
      if (savedContentAnalytics) {
        setContentAnalytics(JSON.parse(savedContentAnalytics));
      }

      // جلب تحليلات التطبيق
      const savedAppAnalytics = localStorage.getItem('appAnalytics');
      if (savedAppAnalytics) {
        setAppAnalytics(JSON.parse(savedAppAnalytics));
      } else {
        initializeAppAnalytics();
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  };

  // إنشاء معرف مستخدم فريد
  const generateUserId = (): string => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // إنشاء معرف جلسة فريد
  const generateSessionId = (): string => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // بدء جلسة جديدة
  const startNewSession = () => {
    setSessionStartTime(new Date());
    if (userAnalytics) {
      const updatedAnalytics = {
        ...userAnalytics,
        sessionId: generateSessionId(),
        totalSessions: userAnalytics.totalSessions + 1,
        lastActiveDate: new Date().toISOString()
      };
      setUserAnalytics(updatedAnalytics);
      localStorage.setItem('userAnalytics', JSON.stringify(updatedAnalytics));
    }
  };

  // إنهاء الجلسة الحالية
  const endCurrentSession = () => {
    if (userAnalytics && sessionStartTime) {
      const sessionDuration = (Date.now() - sessionStartTime.getTime()) / (1000 * 60); // بالدقائق
      const updatedAnalytics = {
        ...userAnalytics,
        totalTimeSpent: userAnalytics.totalTimeSpent + sessionDuration,
        averageSessionTime: (userAnalytics.totalTimeSpent + sessionDuration) / userAnalytics.totalSessions
      };
      setUserAnalytics(updatedAnalytics);
      localStorage.setItem('userAnalytics', JSON.stringify(updatedAnalytics));
    }
  };

  // تتبع قراءة المحتوى
  const trackContentView = (
    contentId: string, 
    contentType: 'article' | 'video' | 'encyclopedia' | 'tip',
    title: string,
    category: string,
    timeSpent?: number
  ) => {
    try {
      // تحديث تحليلات المستخدم
      if (userAnalytics) {
        const updatedAnalytics = { ...userAnalytics };
        
        switch (contentType) {
          case 'article':
            updatedAnalytics.contentInteractions.articlesRead++;
            break;
          case 'video':
            updatedAnalytics.contentInteractions.videosWatched++;
            break;
          case 'encyclopedia':
            updatedAnalytics.contentInteractions.encyclopediaSearches++;
            break;
          case 'tip':
            updatedAnalytics.contentInteractions.tipsViewed++;
            break;
        }

        // تحديث الفئات المفضلة
        if (!updatedAnalytics.favoriteCategories.includes(category)) {
          updatedAnalytics.favoriteCategories.push(category);
        }

        setUserAnalytics(updatedAnalytics);
        localStorage.setItem('userAnalytics', JSON.stringify(updatedAnalytics));
      }

      // تحديث تحليلات المحتوى
      const contentAnalyticsUpdated = [...contentAnalytics];
      const existingContentIndex = contentAnalyticsUpdated.findIndex(
        c => c.contentId === contentId && c.contentType === contentType
      );

      if (existingContentIndex >= 0) {
        const existing = contentAnalyticsUpdated[existingContentIndex];
        contentAnalyticsUpdated[existingContentIndex] = {
          ...existing,
          views: existing.views + 1,
          averageTimeSpent: timeSpent 
            ? (existing.averageTimeSpent * existing.views + timeSpent) / (existing.views + 1)
            : existing.averageTimeSpent
        };
      } else {
        contentAnalyticsUpdated.push({
          contentId,
          contentType,
          title,
          views: 1,
          favorites: 0,
          averageTimeSpent: timeSpent || 0,
          completionRate: 0,
          ratings: [],
          averageRating: 0,
          searchKeywords: []
        });
      }

      setContentAnalytics(contentAnalyticsUpdated);
      localStorage.setItem('contentAnalytics', JSON.stringify(contentAnalyticsUpdated));

    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  };

  // تتبع إضافة للمفضلة
  const trackFavorite = (contentId: string, contentType: 'article' | 'video' | 'encyclopedia' | 'tip', added: boolean) => {
    try {
      const contentAnalyticsUpdated = [...contentAnalytics];
      const existingIndex = contentAnalyticsUpdated.findIndex(
        c => c.contentId === contentId && c.contentType === contentType
      );

      if (existingIndex >= 0) {
        const existing = contentAnalyticsUpdated[existingIndex];
        contentAnalyticsUpdated[existingIndex] = {
          ...existing,
          favorites: added ? existing.favorites + 1 : Math.max(0, existing.favorites - 1)
        };
        
        setContentAnalytics(contentAnalyticsUpdated);
        localStorage.setItem('contentAnalytics', JSON.stringify(contentAnalyticsUpdated));
      }
    } catch (error) {
      console.error('Error tracking favorite:', error);
    }
  };

  // تتبع التقييم
  const trackRating = (
    contentId: string, 
    contentType: 'article' | 'video' | 'encyclopedia' | 'tip', 
    rating: number
  ) => {
    try {
      const contentAnalyticsUpdated = [...contentAnalytics];
      const existingIndex = contentAnalyticsUpdated.findIndex(
        c => c.contentId === contentId && c.contentType === contentType
      );

      if (existingIndex >= 0) {
        const existing = contentAnalyticsUpdated[existingIndex];
        const newRatings = [...existing.ratings, rating];
        const newAverageRating = newRatings.reduce((sum, r) => sum + r, 0) / newRatings.length;
        
        contentAnalyticsUpdated[existingIndex] = {
          ...existing,
          ratings: newRatings,
          averageRating: newAverageRating
        };
        
        setContentAnalytics(contentAnalyticsUpdated);
        localStorage.setItem('contentAnalytics', JSON.stringify(contentAnalyticsUpdated));
      }
    } catch (error) {
      console.error('Error tracking rating:', error);
    }
  };

  // تتبع البحث
  const trackSearch = (query: string, resultsCount: number) => {
    try {
      trackFeatureUsage('search');
      
      if (userAnalytics) {
        const updatedAnalytics = {
          ...userAnalytics,
          contentInteractions: {
            ...userAnalytics.contentInteractions,
            encyclopediaSearches: userAnalytics.contentInteractions.encyclopediaSearches + 1
          }
        };
        setUserAnalytics(updatedAnalytics);
        localStorage.setItem('userAnalytics', JSON.stringify(updatedAnalytics));
      }

      // حفظ كلمات البحث الشائعة
      const searchKeywords = localStorage.getItem('searchKeywords');
      const keywords = searchKeywords ? JSON.parse(searchKeywords) : {};
      keywords[query] = (keywords[query] || 0) + 1;
      localStorage.setItem('searchKeywords', JSON.stringify(keywords));

    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  // تتبع استخدام الميزات
  const trackFeatureUsage = (featureName: string) => {
    try {
      if (appAnalytics) {
        const updatedAnalytics = {
          ...appAnalytics,
          featureUsage: {
            ...appAnalytics.featureUsage,
            [featureName]: {
              usage: (appAnalytics.featureUsage[featureName]?.usage || 0) + 1,
              lastUsed: new Date().toISOString()
            }
          }
        };
        setAppAnalytics(updatedAnalytics);
        localStorage.setItem('appAnalytics', JSON.stringify(updatedAnalytics));
      }
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  };

  // تحديث أسبوع الحمل
  const updatePregnancyWeek = (week: number) => {
    if (userAnalytics) {
      const updatedAnalytics = {
        ...userAnalytics,
        pregnancyWeek: week
      };
      setUserAnalytics(updatedAnalytics);
      localStorage.setItem('userAnalytics', JSON.stringify(updatedAnalytics));
    }
  };

  // تهيئة تحليلات التطبيق
  const initializeAppAnalytics = () => {
    const initialAppAnalytics: AppAnalytics = {
      totalUsers: 1,
      activeUsers: {
        daily: 1,
        weekly: 1,
        monthly: 1
      },
      contentStats: {
        totalContent: 0,
        mostPopular: [],
        leastPopular: [],
        categoryDistribution: {}
      },
      userEngagement: {
        averageSessionTime: 0,
        bounceRate: 0,
        retentionRate: {
          day1: 100,
          day7: 100,
          day30: 100
        }
      },
      featureUsage: {}
    };
    
    setAppAnalytics(initialAppAnalytics);
    localStorage.setItem('appAnalytics', JSON.stringify(initialAppAnalytics));
  };

  // جلب أفضل المحتوى
  const getTopContent = (limit: number = 5): ContentAnalytics[] => {
    return [...contentAnalytics]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  };

  // جلب إحصائيات المستخدم
  const getUserStats = () => {
    if (!userAnalytics) return null;

    return {
      totalTimeSpent: Math.round(userAnalytics.totalTimeSpent),
      totalSessions: userAnalytics.totalSessions,
      averageSessionTime: Math.round(userAnalytics.averageSessionTime),
      contentInteractions: userAnalytics.contentInteractions,
      favoriteCategories: userAnalytics.favoriteCategories,
      joinedDaysAgo: Math.floor(
        (Date.now() - new Date(userAnalytics.joinDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    };
  };

  // تصدير التحليلات
  const exportAnalytics = () => {
    try {
      const data = {
        userAnalytics,
        contentAnalytics,
        appAnalytics,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم تصدير التحليلات",
        description: "تم تصدير بيانات الاستخدام بنجاح",
      });
    } catch (error) {
      toast({
        title: "فشل التصدير",
        description: "حدث خطأ أثناء تصدير التحليلات",
        variant: "destructive"
      });
    }
  };

  // مسح جميع التحليلات
  const clearAllAnalytics = () => {
    localStorage.removeItem('userAnalytics');
    localStorage.removeItem('contentAnalytics');
    localStorage.removeItem('appAnalytics');
    localStorage.removeItem('searchKeywords');
    
    setUserAnalytics(null);
    setContentAnalytics([]);
    setAppAnalytics(null);
    
    toast({
      title: "تم مسح التحليلات",
      description: "تم حذف جميع بيانات الاستخدام",
    });
    
    // إعادة تهيئة
    initializeAnalytics();
  };

  return {
    userAnalytics,
    contentAnalytics,
    appAnalytics,
    isInitialized,
    trackContentView,
    trackFavorite,
    trackRating,
    trackSearch,
    trackFeatureUsage,
    updatePregnancyWeek,
    getTopContent,
    getUserStats,
    exportAnalytics,
    clearAllAnalytics
  };
};