import { useState } from 'react';
import { Video, Article } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { freeVideos, premiumVideos } from '@/data/videosData';

export type LibraryTab = 'videos' | 'articles' | 'encyclopedia';

// استخدام الفيديوهات المجانية كافتراضي في قسم المكتبة
const videos = freeVideos;

const articles: Article[] = [
  {
    id: 1,
    title: "علامات الولادة المبكرة",
    readTime: "5 دقائق",
    category: "صحة",
    emoji: "⚠️",
    summary: "تعرفي على العلامات التي تشير إلى احتمالية الولادة المبكرة"
  },
  {
    id: 2,
    title: "نصائح للتعامل مع غثيان الحمل",
    readTime: "7 دقائق",
    category: "نصائح",
    emoji: "🤢",
    summary: "طرق طبيعية وآمنة للتخفيف من أعراض الغثيان"
  },
  {
    id: 3,
    title: "تحضير غرفة الطفل",
    readTime: "10 دقائق",
    category: "استعداد",
    emoji: "🍼",
    summary: "دليل شامل لتحضير غرفة مثالية لاستقبال المولود"
  }
];

export const useLibrary = () => {
  const { toast } = useToast();
  const { isFavorite, toggleFavorite, getFavoriteVideos, getFavoriteArticles } = useFavorites();
  const [activeTab, setActiveTab] = useState<LibraryTab>("videos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isArticleReaderOpen, setIsArticleReaderOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ["الكل", "تمارين", "تغذية", "ولادة", "نمو الطفل", "صحة", "نصائح", "استعداد"];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || video.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || isFavorite(video.id, 'video');
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || article.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || isFavorite(article.id, 'article');
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const playVideo = (id: number) => {
    setIsLoading(true);
    const video = videos.find(v => v.id === id);
    if (video) {
      setTimeout(() => {
        setSelectedVideo(video);
        setIsVideoPlayerOpen(true);
        setIsLoading(false);
        toast({
          title: "تشغيل الفيديو",
          description: `بدء تشغيل: ${video.title}`,
        });
      }, 500);
    }
  };

  const readArticle = (id: number) => {
    setIsLoading(true);
    const article = articles.find(a => a.id === id);
    if (article) {
      setTimeout(() => {
        setSelectedArticle(article);
        setIsArticleReaderOpen(true);
        setIsLoading(false);
        toast({
          title: "فتح المقال",
          description: `قراءة: ${article.title}`,
        });
      }, 300);
    }
  };

  const closeVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setSelectedVideo(null);
  };

  const closeArticleReader = () => {
    setIsArticleReaderOpen(false);
    setSelectedArticle(null);
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    videos: filteredVideos,
    articles: filteredArticles,
    playVideo,
    readArticle,
    selectedVideo,
    selectedArticle,
    isVideoPlayerOpen,
    isArticleReaderOpen,
    closeVideoPlayer,
    closeArticleReader,
    showFavoritesOnly,
    setShowFavoritesOnly,
    isLoading,
    isFavorite,
    toggleFavorite,
    getFavoriteVideos,
    getFavoriteArticles
  };
};