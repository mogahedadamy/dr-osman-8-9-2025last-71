// جسر للربط بين المحتوى الثابت والديناميكي مع المزامنة الفورية
import React, { useEffect, useState, useMemo } from 'react';
import { useDynamicContentContext } from './DynamicContentProvider';
import { contentService } from '@/services/contentService';
import { articlesData } from '@/data/articlesData';
import { allVideos } from '@/data/videosData';
import { osmanTipsData } from '@/data/osmanTipsData';
import { encyclopediaData } from '@/data/encyclopediaData';

// تحويل البيانات الثابتة إلى تنسيق ديناميكي مع التحديث الفوري
export function useContentBridge() {
  const { 
    articles: dynamicArticles, 
    videos: dynamicVideos, 
    tips: dynamicTips,
    encyclopedia: dynamicEncyclopedia,
    loading 
  } = useDynamicContentContext();

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // استمع للتحديثات من لوحة التحكم
  useEffect(() => {
    const unsubscribe = contentService.onContentUpdate((action, content) => {
      console.log(`🔄 Content ${action}: ${content.title}`);
      setLastUpdate(new Date());
      
      // إعادة تحميل المحتوى الديناميكي
      // سيتم التحديث تلقائياً عبر useDynamicContentContext
    });

    return unsubscribe;
  }, []);

  // دمج المحتوى الثابت مع الديناميكي
  const allArticles = useMemo(() => {
    if (loading) return [];
    
    // تحويل المقالات الثابتة إلى تنسيق ديناميكي
    const staticArticles = Object.values(articlesData).map(article => ({
      id: `static_article_${article.id}`,
      type: 'article' as const,
      title: article.title,
      category: article.category,
      summary: article.summary,
      content: article.sections.map(s => s.content || s.items?.join('\n') || '').join('\n'),
      readTime: article.readTime,
      emoji: article.emoji,
      tags: article.tags,
      accessLevel: 'free' as const,
      isPublished: true,
      views: Math.floor(Math.random() * 1000) + 100,
      priority: 1,
      language: 'ar' as const,
      authorId: 'dr_osman',
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: article.sections.map((section, index) => ({
        id: `section_${index}`,
        title: section.title,
        content: section.content,
        type: section.type as any,
        items: section.items,
        order: index
      })),
      sources: article.sources,
      relatedArticles: []
    }));

    return [...staticArticles, ...dynamicArticles];
  }, [dynamicArticles, loading]);

  const allVideos = useMemo(() => {
    if (loading) return [];
    
    // تحويل الفيديوهات الثابتة إلى تنسيق ديناميكي
    const staticVideos = allVideos.map(video => ({
      id: `static_video_${video.id}`,
      type: 'video' as const,
      title: video.title,
      category: video.category,
      description: `فيديو تعليمي: ${video.title}`,
      duration: video.duration,
      thumbnail: video.thumbnail,
      videoUrl: video.remoteUrl || video.localPath || '',
      localPath: video.localPath,
      cdnUrl: video.remoteUrl,
      tags: [video.category],
      accessLevel: video.accessLevel || 'free' as const,
      isPublished: true,
      views: parseInt(video.views.replace('K', '000').replace('M', '000000')) || 0,
      priority: 1,
      language: 'ar' as const,
      authorId: 'dr_osman',
      createdAt: new Date(),
      updatedAt: new Date(),
      relatedVideos: []
    }));

    return [...staticVideos, ...dynamicVideos];
  }, [dynamicVideos, loading]);

  const allTips = useMemo(() => {
    if (loading) return [];
    
    // تحويل النصائح الثابتة إلى تنسيق ديناميكي
    const staticTips = osmanTipsData.map(tip => ({
      id: `static_tip_${tip.id}`,
      type: 'tip' as const,
      title: tip.title,
      category: tip.category,
      content: tip.content,
      personalNote: tip.personalNote,
      week: tip.week,
      tipCategory: tip.category,
      isPersonalExperience: tip.isPersonalExperience,
      audioUrl: tip.audioUrl,
      imageUrl: tip.imageUrl,
      tags: tip.tags,
      accessLevel: 'free' as const,
      isPublished: true,
      views: Math.floor(Math.random() * 500) + 50,
      priority: 1,
      language: 'ar' as const,
      authorId: 'dr_osman',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return [...staticTips, ...dynamicTips];
  }, [dynamicTips, loading]);

  const allEncyclopedia = useMemo(() => {
    if (loading) return [];
    
    // تحويل الموسوعة الثابتة إلى تنسيق ديناميكي
    const staticEncyclopedia = encyclopediaData.map(entry => ({
      id: `static_encyclopedia_${entry.id}`,
      type: 'encyclopedia' as const,
      title: entry.title,
      category: entry.category,
      definition: entry.definition,
      urgencyLevel: entry.urgencyLevel,
      symptoms: entry.symptoms,
      whenToSeek: entry.whenToSeek,
      letter: entry.letter,
      tags: entry.tags,
      accessLevel: 'free' as const,
      isPublished: true,
      views: Math.floor(Math.random() * 300) + 30,
      priority: 1,
      language: 'ar' as const,
      authorId: 'dr_osman',
      createdAt: new Date(),
      updatedAt: new Date(),
      relatedEntries: entry.relatedArticles?.map(id => `static_article_${id}`) || []
    }));

    return [...staticEncyclopedia, ...dynamicEncyclopedia];
  }, [dynamicEncyclopedia, loading]);

  return {
    articles: allArticles,
    videos: allVideos,
    tips: allTips,
    encyclopedia: allEncyclopedia,
    loading,
    lastUpdate,
    // إحصائيات المحتوى
    stats: {
      totalArticles: allArticles.length,
      totalVideos: allVideos.length,
      totalTips: allTips.length,
      totalEncyclopedia: allEncyclopedia.length,
      dynamicContent: dynamicArticles.length + dynamicVideos.length + dynamicTips.length + dynamicEncyclopedia.length,
      staticContent: Object.keys(articlesData).length + allVideos.length + osmanTipsData.length + encyclopediaData.length
    }
  };
}

// مكون للتحديث التلقائي للمحتوى في جميع الصفحات
export function ContentSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // تحميل المحتوى من contentService عند بدء التطبيق
    const initializeContent = async () => {
      try {
        await contentService.loadFromLocalStorage();
        console.log('📚 Content loaded from local storage');
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    initializeContent();

    // استمع لتحديثات المحتوى ونقلها لجميع أجزاء التطبيق
    const unsubscribe = contentService.onContentUpdate((action, content) => {
      // إنشاء أحداث مخصصة لكل نوع محتوى
      const eventName = `${content.type}Updated`;
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { action, content, timestamp: new Date() }
      }));
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}