import { useState, useMemo } from 'react';
import { Article, Video } from '@/types';
import { articlesData } from '@/data/articlesData';
import { encyclopediaData, EncyclopediaEntry } from '@/data/encyclopediaData';
import { osmanTipsData, OsmanTip } from '@/data/osmanTipsData';
import { useToast } from '@/hooks/use-toast';

export interface SearchFilters {
  contentType: 'all' | 'articles' | 'videos' | 'encyclopedia' | 'tips';
  category: string;
  readTime: 'all' | 'short' | 'medium' | 'long'; // أقل من 5 دقائق، 5-15 دقيقة، أكثر من 15 دقيقة
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced';
  week: 'all' | number;
  urgency: 'all' | 'low' | 'medium' | 'high'; // للموسوعة
  tags: string[];
  hasPersonalExperience: boolean;
  sortBy: 'relevance' | 'date' | 'rating' | 'popularity';
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'article' | 'video' | 'encyclopedia' | 'tip';
  content?: string;
  summary?: string;
  category: string;
  tags: string[];
  readTime?: string;
  rating?: number;
  views?: number;
  relevanceScore: number;
  week?: number;
}

export const useAdvancedSearch = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    contentType: 'all',
    category: 'الكل',
    readTime: 'all',
    difficulty: 'all',
    week: 'all',
    urgency: 'all',
    tags: [],
    hasPersonalExperience: false,
    sortBy: 'relevance'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<{query: string, filters: SearchFilters, name: string}[]>([]);

  // حساب نتائج البحث المتقدم
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && filters.contentType === 'all' && filters.category === 'الكل') {
      return [];
    }

    const results: SearchResult[] = [];
    const searchTerm = searchQuery.toLowerCase();

    // البحث في المقالات
    if (filters.contentType === 'all' || filters.contentType === 'articles') {
      Object.values(articlesData).forEach(article => {
        const relevanceScore = calculateRelevance(article, searchTerm);
        if (relevanceScore > 0 && passesFilters(article, filters)) {
          results.push({
            id: `article-${article.id}`,
            title: article.title,
            type: 'article',
            content: article.sections?.map(s => s.content).join(' ') || '',
            summary: article.summary,
            category: article.category,
            tags: article.tags || [],
            readTime: article.readTime,
            rating: 4.5, // متوسط افتراضي
            views: Math.floor(Math.random() * 5000) + 1000, // قيمة افتراضية
            relevanceScore
          });
        }
      });
    }

    // البحث في الموسوعة
    if (filters.contentType === 'all' || filters.contentType === 'encyclopedia') {
      encyclopediaData.forEach(entry => {
        const relevanceScore = calculateEncyclopediaRelevance(entry, searchTerm);
        if (relevanceScore > 0 && passesEncyclopediaFilters(entry, filters)) {
          results.push({
            id: `encyclopedia-${entry.id}`,
            title: entry.title,
            type: 'encyclopedia',
            summary: entry.definition,
            category: entry.category,
            tags: entry.tags,
            relevanceScore
          });
        }
      });
    }

    // البحث في نصائح عثمان
    if (filters.contentType === 'all' || filters.contentType === 'tips') {
      osmanTipsData.forEach(tip => {
        const relevanceScore = calculateTipRelevance(tip, searchTerm);
        if (relevanceScore > 0 && passesTipFilters(tip, filters)) {
          results.push({
            id: `tip-${tip.id}`,
            title: tip.title,
            type: 'tip',
            content: tip.content,
            summary: tip.content.substring(0, 150) + '...',
            category: tip.category,
            tags: tip.tags,
            readTime: tip.readTime,
            week: tip.week,
            relevanceScore
          });
        }
      });
    }

    // ترتيب النتائج
    return sortResults(results, filters.sortBy);
  }, [searchQuery, filters]);

  // حساب مدى الصلة للمقالات
  const calculateRelevance = (article: any, searchTerm: string): number => {
    let score = 0;
    const title = article.title.toLowerCase();
    const content = (article.content || '').toLowerCase();
    const summary = (article.summary || '').toLowerCase();
    const tags = (article.tags || []).join(' ').toLowerCase();

    if (title.includes(searchTerm)) score += 10;
    if (summary.includes(searchTerm)) score += 5;
    if (content.includes(searchTerm)) score += 3;
    if (tags.includes(searchTerm)) score += 8;

    // إضافة نقاط للتطابق الدقيق
    if (title === searchTerm) score += 20;
    if (title.startsWith(searchTerm)) score += 15;

    return score;
  };

  // حساب مدى الصلة للموسوعة
  const calculateEncyclopediaRelevance = (entry: EncyclopediaEntry, searchTerm: string): number => {
    let score = 0;
    const title = entry.title.toLowerCase();
    const definition = entry.definition.toLowerCase();
    const tags = entry.tags.join(' ').toLowerCase();

    if (title.includes(searchTerm)) score += 15;
    if (definition.includes(searchTerm)) score += 8;
    if (tags.includes(searchTerm)) score += 10;
    if (title === searchTerm) score += 25;

    return score;
  };

  // حساب مدى الصلة للنصائح
  const calculateTipRelevance = (tip: OsmanTip, searchTerm: string): number => {
    let score = 0;
    const title = tip.title.toLowerCase();
    const content = tip.content.toLowerCase();
    const personalNote = (tip.personalNote || '').toLowerCase();
    const tags = tip.tags.join(' ').toLowerCase();

    if (title.includes(searchTerm)) score += 12;
    if (content.includes(searchTerm)) score += 6;
    if (personalNote.includes(searchTerm)) score += 8;
    if (tags.includes(searchTerm)) score += 10;

    // إضافة نقاط للتجارب الشخصية
    if (tip.isPersonalExperience) score += 3;

    return score;
  };

  // فلترة المقالات
  const passesFilters = (item: any, filters: SearchFilters): boolean => {
    if (filters.category !== 'الكل' && item.category !== filters.category) return false;
    
    if (filters.readTime !== 'all') {
      const readTimeNum = parseInt(item.readTime || '0');
      if (filters.readTime === 'short' && readTimeNum > 5) return false;
      if (filters.readTime === 'medium' && (readTimeNum <= 5 || readTimeNum > 15)) return false;
      if (filters.readTime === 'long' && readTimeNum <= 15) return false;
    }

    if (filters.tags.length > 0) {
      const itemTags = item.tags || [];
      if (!filters.tags.some(tag => itemTags.includes(tag))) return false;
    }

    return true;
  };

  // فلترة الموسوعة
  const passesEncyclopediaFilters = (entry: EncyclopediaEntry, filters: SearchFilters): boolean => {
    if (filters.category !== 'الكل' && entry.category !== filters.category) return false;
    if (filters.urgency !== 'all' && entry.urgencyLevel !== filters.urgency) return false;
    
    if (filters.tags.length > 0) {
      if (!filters.tags.some(tag => entry.tags.includes(tag))) return false;
    }

    return true;
  };

  // فلترة النصائح
  const passesTipFilters = (tip: OsmanTip, filters: SearchFilters): boolean => {
    if (filters.category !== 'الكل' && tip.category !== filters.category) return false;
    if (filters.week !== 'all' && tip.week !== filters.week) return false;
    if (filters.hasPersonalExperience && !tip.isPersonalExperience) return false;

    if (filters.tags.length > 0) {
      if (!filters.tags.some(tag => tip.tags.includes(tag))) return false;
    }

    return true;
  };

  // ترتيب النتائج
  const sortResults = (results: SearchResult[], sortBy: string): SearchResult[] => {
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.views || 0) - (a.views || 0);
        case 'date':
          // افتراض ترتيب حسب ID (الأحدث أولاً)
          return b.id.localeCompare(a.id);
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });
  };

  // البحث
  const performSearch = async (query: string, newFilters?: Partial<SearchFilters>) => {
    setIsSearching(true);
    
    if (newFilters) {
      setFilters(prev => ({ ...prev, ...newFilters }));
    }
    
    setSearchQuery(query);
    
    // إضافة إلى تاريخ البحث
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]); // آخر 10 عمليات بحث
    }

    // محاكاة تأخير البحث
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "اكتمل البحث",
        description: `تم العثور على ${searchResults.length} نتيجة`,
      });
    }, 300);
  };

  // حفظ عملية بحث
  const saveSearch = (name: string) => {
    const newSavedSearch = {
      query: searchQuery,
      filters: filters,
      name: name
    };
    setSavedSearches(prev => [...prev, newSavedSearch]);
    toast({
      title: "تم حفظ البحث",
      description: `تم حفظ البحث باسم: ${name}`,
    });
  };

  // تحميل بحث محفوظ
  const loadSavedSearch = (savedSearch: {query: string, filters: SearchFilters, name: string}) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    performSearch(savedSearch.query, savedSearch.filters);
  };

  // البحث الصوتي (محاكاة)
  const startVoiceSearch = () => {
    toast({
      title: "البحث الصوتي",
      description: "قولي ما تريدين البحث عنه...",
    });
    
    // محاكاة البحث الصوتي
    setTimeout(() => {
      const voiceQueries = ["تمارين الحمل", "غثيان الصباح", "فحوصات الحمل", "نصائح التغذية"];
      const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
      performSearch(randomQuery);
      toast({
        title: "تم التعرف على الصوت",
        description: `تم البحث عن: ${randomQuery}`,
      });
    }, 2000);
  };

  // تنظيف الفلاتر
  const clearFilters = () => {
    setFilters({
      contentType: 'all',
      category: 'الكل',
      readTime: 'all',
      difficulty: 'all',
      week: 'all',
      urgency: 'all',
      tags: [],
      hasPersonalExperience: false,
      sortBy: 'relevance'
    });
  };

  // اقتراحات البحث الذكية
  const getSearchSuggestions = (query: string): string[] => {
    const suggestions = [
      'تمارين الحمل', 'غثيان الصباح', 'فحوصات الحمل الأساسية',
      'التغذية في الحمل', 'أعراض الولادة المبكرة', 'حركة الجنين',
      'سكر الحمل', 'آلام الظهر في الحمل', 'تحضير حقيبة المستشفى',
      'نصائح الرضاعة الطبيعية', 'تقلبات المزاج', 'فيتامينات الحمل'
    ];
    
    if (!query.trim()) return suggestions.slice(0, 5);
    
    return suggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    searchResults,
    isSearching,
    searchHistory,
    savedSearches,
    performSearch,
    saveSearch,
    loadSavedSearch,
    startVoiceSearch,
    clearFilters,
    getSearchSuggestions
  };
};