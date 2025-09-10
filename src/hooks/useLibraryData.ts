// Hook لجلب ودمج بيانات المكتبة من المصادر المختلفة
import { useState, useEffect } from 'react';
import { useDynamicContentContext } from '@/components/mobile/DynamicContentProvider';
import { articlesData } from '@/data/articlesData';
import { freeVideos } from '@/data/videosData';

export function useLibraryData() {
  const { 
    articles: dynamicArticles, 
    videos: dynamicVideos, 
    categories: dynamicCategories,
    loading: dynamicLoading 
  } = useDynamicContentContext();

  // تحويل البيانات الثابتة للشكل المطلوب
  const staticArticles = Object.values(articlesData).map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    readTime: article.readTime,
    summary: article.summary,
    content: article.sections?.map(s => s.content).join('\n') || '',
    emoji: article.emoji,
    sections: article.sections || [],
    accessLevel: 'free' as const,
    tags: article.tags || [article.category]
  }));

  const staticVideos = freeVideos.map(video => ({
    id: video.id,
    title: video.title,
    category: video.category,
    duration: video.duration,
    thumbnail: video.thumbnail,
    description: video.title,
    url: video.localPath || video.remoteUrl || '',
    accessLevel: video.accessLevel as 'free' | 'premium',
    rating: 4.5,
    views: video.views || '0'
  }));

  const staticCategories = ['صحة', 'تغذية', 'تمارين', 'نفسية', 'طبية', 'عام'];

  // دمج البيانات الثابتة والديناميكية
  const articles = [
    ...staticArticles,
    ...dynamicArticles.filter(item => item.type === 'article' && item.isPublished).map(item => ({
      id: parseInt(item.id.split('-')[1]) || Date.now(),
      title: item.title,
      category: item.category,
      readTime: (item as any).readTime || '5 دقائق',
      summary: (item as any).summary || '',
      content: (item as any).content || '',
      emoji: (item as any).emoji || '📄',
      sections: (item as any).sections || [],
      accessLevel: item.accessLevel as 'free' | 'premium',
      tags: item.tags || [item.category]
    }))
  ];

  const videos = [
    ...staticVideos,
    ...dynamicVideos.filter(item => item.type === 'video' && item.isPublished).map(item => ({
      id: parseInt(item.id.split('-')[1]) || Date.now(),
      title: item.title,
      category: item.category,
      duration: (item as any).duration || '10:00',
      thumbnail: (item as any).thumbnail || '/placeholder.svg',
      description: (item as any).description || '',
      url: (item as any).videoUrl || '',
      accessLevel: item.accessLevel as 'free' | 'premium',
      rating: 4.5,
      views: item.views.toString()
    }))
  ];

  // دمج الفئات
  const categories = [
    ...staticCategories,
    ...dynamicCategories.map(cat => cat.name)
  ].filter((category, index, self) => self.indexOf(category) === index);

  return {
    articles,
    videos,
    categories,
    isLoading: dynamicLoading,
    stats: {
      totalArticles: articles.length,
      totalVideos: videos.length,
      freeContent: [...articles, ...videos].filter(item => item.accessLevel === 'free').length,
      premiumContent: [...articles, ...videos].filter(item => item.accessLevel === 'premium').length
    }
  };
}