import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface AIQuery {
  id: string;
  question: string;
  response: string;
  confidence: number;
  category: 'symptoms' | 'nutrition' | 'exercise' | 'medical' | 'general';
  timestamp: string;
  followUp?: string[];
}

export interface SymptomAnalysis {
  symptom: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  recommendations: string[];
  doctorConsult: boolean;
  relatedArticles: string[];
  urgencyLevel: number; // 1-10
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'article' | 'video' | 'exercise' | 'nutrition' | 'reminder';
  title: string;
  description: string;
  priority: number;
  basedon: string; // what triggered this recommendation
  weekRelevant: number[];
}

/**
 * Hook للمساعد الذكي بالذكاء الاصطناعي
 * يوفر تحليل الأعراض وتوصيات مخصصة ومساعدة ذكية
 */
export const useAIAssistant = () => {
  const [queryHistory, setQueryHistory] = useState<AIQuery[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<SymptomAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState({
    currentWeek: 20,
    previousPregnancies: 0,
    riskFactors: [] as string[],
    preferences: {
      language: 'ar',
      contentType: ['articles', 'videos'],
      notificationTime: 'morning'
    }
  });

  // قاعدة معرفة أساسية للأعراض والتوصيات
  const knowledgeBase = {
    symptoms: {
      'غثيان الصباح': {
        severity: 'low' as const,
        recommendations: [
          'تناولي وجبات صغيرة متكررة',
          'تجنبي الأطعمة الدهنية والحارة',
          'جربي الزنجبيل أو البسكويت المملح',
          'اشربي السوائل بين الوجبات وليس معها'
        ],
        doctorConsult: false,
        urgencyLevel: 2,
        relatedArticles: ['pregnancy-nausea', 'first-trimester-nutrition']
      },
      'نزيف مهبلي': {
        severity: 'urgent' as const,
        recommendations: [
          'توقفي عن أي نشاط بدني فوراً',
          'استريحي في الفراش',
          'لا تستخدمي التامبون',
          'راقبي كمية ولون النزيف'
        ],
        doctorConsult: true,
        urgencyLevel: 9,
        relatedArticles: ['pregnancy-bleeding', 'emergency-signs']
      },
      'آلام الظهر': {
        severity: 'medium' as const,
        recommendations: [
          'استخدمي وسادة دعم للظهر',
          'مارسي تمارين التمدد الآمنة',
          'تجنبي الأحذية ذات الكعب العالي',
          'طبقي كمادات دافئة للمنطقة المؤلمة'
        ],
        doctorConsult: false,
        urgencyLevel: 4,
        relatedArticles: ['back-pain-pregnancy', 'safe-exercises']
      },
      'تورم القدمين': {
        severity: 'medium' as const,
        recommendations: [
          'ارفعي قدميك عند الجلوس',
          'تجنبي الوقوف لفترات طويلة',
          'امشي قليلاً كل ساعة',
          'اشربي كمية كافية من الماء'
        ],
        doctorConsult: false,
        urgencyLevel: 3,
        relatedArticles: ['pregnancy-swelling', 'third-trimester-tips']
      },
      'صداع شديد': {
        severity: 'high' as const,
        recommendations: [
          'قيسي ضغط الدم فوراً',
          'استريحي في مكان هادئ ومظلم',
          'تجنبي التوتر والضغط النفسي',
          'اشربي كمية كافية من الماء'
        ],
        doctorConsult: true,
        urgencyLevel: 7,
        relatedArticles: ['pregnancy-headaches', 'preeclampsia-signs']
      },
      'حرقة المعدة': {
        severity: 'low' as const,
        recommendations: [
          'تناولي وجبات صغيرة ومتكررة',
          'تجنبي الأطعمة الحمضية والحارة',
          'لا تتناولي الطعام قبل النوم مباشرة',
          'نامي على وسائد مرتفعة'
        ],
        doctorConsult: false,
        urgencyLevel: 2,
        relatedArticles: ['heartburn-pregnancy', 'safe-medications']
      }
    },

    weeklyTips: {
      4: ['تناولي حمض الفوليك يومياً', 'تجنبي التدخين والكحول', 'ابدئي في تناول فيتامينات الحمل'],
      8: ['احجزي أول موعد مع الطبيب', 'تجنبي الأطعمة النيئة', 'اشربي 8 أكواب ماء يومياً'],
      12: ['موعد الفحص الأول مهم', 'تناولي البروتين بكثرة', 'ابدئي في إخبار الأصدقاء'],
      16: ['فحص الأعضاء مهم هذا الأسبوع', 'ابدئي في الشعور بحركة الجنين', 'حافظي على نشاطك البدني'],
      20: ['فحص المسح التفصيلي', 'حددي جنس المولود', 'ابدئي في التسوق للطفل'],
      24: ['فحص سكر الحمل', 'راقبي زيادة الوزن', 'ابدئي في دروس ما قبل الولادة'],
      28: ['بداية الثلث الأخير', 'فحوصات أكثر تكراراً', 'جهزي حقيبة المستشفى'],
      32: ['راقبي حركة الجنين يومياً', 'ابدئي إجازة الأمومة', 'تجنبي السفر الطويل'],
      36: ['الجنين في وضعية الولادة', 'موعد مع الطبيب أسبوعياً', 'راجعي خطة الولادة'],
      40: ['أي وقت الآن!', 'راقبي علامات المخاض', 'استعدي لاستقبال طفلك']
    }
  };

  // تحليل الأعراض باستخدام المعرفة الأساسية
  const analyzeSymptom = useCallback((symptomText: string): SymptomAnalysis | null => {
    const symptomLower = symptomText.toLowerCase().trim();
    
    // البحث في قاعدة المعرفة
    for (const [key, data] of Object.entries(knowledgeBase.symptoms)) {
      if (symptomLower.includes(key.toLowerCase()) || 
          key.toLowerCase().includes(symptomLower)) {
        return {
          symptom: key,
          severity: data.severity,
          recommendations: data.recommendations,
          doctorConsult: data.doctorConsult,
          relatedArticles: data.relatedArticles,
          urgencyLevel: data.urgencyLevel
        };
      }
    }

    // إذا لم يوجد تطابق، إعطاء نصيحة عامة
    return {
      symptom: symptomText,
      severity: 'medium',
      recommendations: [
        'راقبي الأعراض وسجليها',
        'اشربي كمية كافية من الماء',
        'احصلي على راحة كافية',
        'تواصلي مع طبيبك إذا ازدادت الأعراض'
      ],
      doctorConsult: true,
      relatedArticles: ['general-pregnancy-care'],
      urgencyLevel: 5
    };
  }, []);

  // معالجة الاستفسارات الذكية
  const processQuery = useCallback(async (question: string): Promise<AIQuery> => {
    setIsProcessing(true);
    
    try {
      // محاكاة تأخير المعالجة
      await new Promise(resolve => setTimeout(resolve, 1500));

      let response = '';
      let confidence = 0;
      let category: AIQuery['category'] = 'general';
      let followUp: string[] = [];

      const questionLower = question.toLowerCase();

      // تصنيف الاستفسار
      if (questionLower.includes('أعراض') || questionLower.includes('ألم') || 
          questionLower.includes('نزيف') || questionLower.includes('صداع')) {
        category = 'symptoms';
        const analysis = analyzeSymptom(question);
        if (analysis) {
          setCurrentAnalysis(analysis);
          response = `تحليل الأعراض: ${analysis.symptom}\n\nمستوى الخطورة: ${analysis.severity}\n\nالتوصيات:\n${analysis.recommendations.join('\n• ')}\n\n${analysis.doctorConsult ? '⚠️ يُنصح بمراجعة الطبيب' : '✅ يمكن التعامل معها منزلياً'}`;
          confidence = 0.85;
          followUp = ['هل تحتاجين معلومات إضافية عن هذا العرض؟', 'هل تريدين نصائح للوقاية؟'];
        }
      } else if (questionLower.includes('تغذية') || questionLower.includes('أكل') || 
                 questionLower.includes('فيتامين')) {
        category = 'nutrition';
        response = 'بناءً على مرحلة حملك الحالية، إليك أهم النصائح الغذائية:\n\n• تناولي 5-6 وجبات صغيرة يومياً\n• احرصي على البروتين والكالسيوم\n• اشربي 8-10 أكواب ماء يومياً\n• تجنبي الأسماك عالية الزئبق\n• تناولي الفواكه والخضروات الطازجة';
        confidence = 0.80;
        followUp = ['هل تريدين قائمة بالأطعمة المسموحة والممنوعة؟', 'هل لديك حساسية طعام معينة؟'];
      } else if (questionLower.includes('تمارين') || questionLower.includes('رياضة') ||
                 questionLower.includes('نشاط')) {
        category = 'exercise';
        response = 'التمارين الآمنة خلال الحمل:\n\n• المشي 30 دقيقة يومياً\n• السباحة (ممتازة للحوامل)\n• اليوغا المخصصة للحمل\n• تمارين التنفس والاسترخاء\n• تمارين قاع الحوض\n\n⚠️ تجنبي: الرياضات التي تتطلب احتكاك، القفز العالي، رفع الأثقال الثقيلة';
        confidence = 0.78;
        followUp = ['هل تريدين برنامج تمارين مخصص لأسبوع حملك؟', 'هل لديك قيود طبية على النشاط؟'];
      } else if (questionLower.includes('فحص') || questionLower.includes('تحليل') ||
                 questionLower.includes('دكتور')) {
        category = 'medical';
        response = `بناءً على أسبوع حملك الحالي (${userProfile.currentWeek})، الفحوصات المهمة:\n\n• فحص الضغط والوزن شهرياً\n• تحاليل الدم والبول\n• فحص نبضات قلب الجنين\n• مراقبة نمو الجنين بالسونار\n\nلا تترددي في مراجعة طبيبك عند أي استفسار أو قلق`;
        confidence = 0.75;
        followUp = ['متى كان آخر فحص لك؟', 'هل لديك قلق طبي محدد؟'];
      } else {
        // استفسار عام
        const weekTips = knowledgeBase.weeklyTips[userProfile.currentWeek as keyof typeof knowledgeBase.weeklyTips];
        if (weekTips) {
          response = `نصائح مهمة لأسبوع حملك الحالي (${userProfile.currentWeek}):\n\n${weekTips.map(tip => `• ${tip}`).join('\n')}\n\nهل تريدين معلومات أكثر تفصيلاً عن أي من هذه النقاط؟`;
          confidence = 0.70;
        } else {
          response = 'شكراً لسؤالك. يمكنني مساعدتك في الأعراض، التغذية، التمارين، والفحوصات الطبية. كيف يمكنني مساعدتك اليوم؟';
          confidence = 0.60;
        }
        followUp = ['هل لديك أعراض تريدين السؤال عنها؟', 'هل تريدين نصائح غذائية؟', 'هل تحتاجين معلومات عن التمارين؟'];
      }

      const query: AIQuery = {
        id: Date.now().toString(),
        question,
        response,
        confidence,
        category,
        timestamp: new Date().toISOString(),
        followUp
      };

      // حفظ في السجل
      setQueryHistory(prev => [query, ...prev].slice(0, 50)); // آخر 50 استفسار

      // حفظ في localStorage
      const history = JSON.parse(localStorage.getItem('aiQueryHistory') || '[]');
      history.unshift(query);
      localStorage.setItem('aiQueryHistory', JSON.stringify(history.slice(0, 50)));

      return query;
    } catch (error) {
      console.error('Error processing AI query:', error);
      throw new Error('حدث خطأ في معالجة الاستفسار');
    } finally {
      setIsProcessing(false);
    }
  }, [userProfile.currentWeek, analyzeSymptom]);

  // توليد توصيات مخصصة
  const generatePersonalizedRecommendations = useCallback(() => {
    const newRecommendations: PersonalizedRecommendation[] = [];
    const week = userProfile.currentWeek;

    // توصيات بناءً على الأسبوع
    if (week <= 12) {
      newRecommendations.push({
        id: 'first-tri-1',
        type: 'article',
        title: 'الثلث الأول من الحمل: دليل شامل',
        description: 'معلومات مهمة للأسابيع الأولى من الحمل',
        priority: 9,
        basedon: `أسبوع الحمل ${week}`,
        weekRelevant: [4, 5, 6, 7, 8, 9, 10, 11, 12]
      });
    } else if (week <= 27) {
      newRecommendations.push({
        id: 'second-tri-1',
        type: 'video',
        title: 'تمارين آمنة للثلث الثاني',
        description: 'تمارين مناسبة لمرحلتك الحالية من الحمل',
        priority: 8,
        basedon: `أسبوع الحمل ${week}`,
        weekRelevant: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
      });
    } else {
      newRecommendations.push({
        id: 'third-tri-1',
        type: 'article',
        title: 'الاستعداد للولادة: دليل الثلث الأخير',
        description: 'كل ما تحتاجين معرفته للاستعداد للولادة',
        priority: 10,
        basedon: `أسبوع الحمل ${week}`,
        weekRelevant: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
      });
    }

    // توصيات بناءً على تاريخ الاستفسارات
    const recentQueries = queryHistory.slice(0, 5);
    const symptomQueries = recentQueries.filter(q => q.category === 'symptoms');
    
    if (symptomQueries.length > 0) {
      newRecommendations.push({
        id: 'symptoms-guide',
        type: 'article',
        title: 'دليل الأعراض الشائعة في الحمل',
        description: 'بناءً على استفساراتك الأخيرة حول الأعراض',
        priority: 7,
        basedon: 'استفسارات الأعراض',
        weekRelevant: Array.from({length: 37}, (_, i) => i + 4)
      });
    }

    setRecommendations(newRecommendations);
    
    return newRecommendations;
  }, [userProfile.currentWeek, queryHistory]);

  // تحديث ملف المستخدم
  const updateUserProfile = useCallback((updates: Partial<typeof userProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    localStorage.setItem('userProfile', JSON.stringify({ ...userProfile, ...updates }));
  }, [userProfile]);

  // تحميل البيانات المحفوظة
  const loadSavedData = useCallback(() => {
    try {
      const savedHistory = localStorage.getItem('aiQueryHistory');
      if (savedHistory) {
        setQueryHistory(JSON.parse(savedHistory));
      }

      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // تصدير البيانات
  const exportData = useCallback(() => {
    const data = {
      queryHistory,
      userProfile,
      recommendations,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-assistant-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم التصدير",
      description: "تم تصدير بيانات المساعد الذكي بنجاح",
    });
  }, [queryHistory, userProfile, recommendations]);

  return {
    // البيانات
    queryHistory,
    isProcessing,
    currentAnalysis,
    recommendations,
    userProfile,
    
    // الوظائف
    processQuery,
    analyzeSymptom,
    generatePersonalizedRecommendations,
    updateUserProfile,
    loadSavedData,
    exportData,
    
    // إحصائيات
    stats: {
      totalQueries: queryHistory.length,
      byCategory: {
        symptoms: queryHistory.filter(q => q.category === 'symptoms').length,
        nutrition: queryHistory.filter(q => q.category === 'nutrition').length,
        exercise: queryHistory.filter(q => q.category === 'exercise').length,
        medical: queryHistory.filter(q => q.category === 'medical').length,
        general: queryHistory.filter(q => q.category === 'general').length,
      },
      averageConfidence: queryHistory.length > 0 
        ? queryHistory.reduce((sum, q) => sum + q.confidence, 0) / queryHistory.length 
        : 0
    }
  };
};