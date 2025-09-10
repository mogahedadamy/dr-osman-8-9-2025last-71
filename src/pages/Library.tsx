import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Star, Heart, Search, Stethoscope, Filter, Download, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import VideoCard from "@/components/library/VideoCard";
import ArticleCard from "@/components/library/ArticleCard";
import TabSwitcher from "@/components/library/TabSwitcher";
import VideoPlayer from "@/components/library/VideoPlayer";
import ArticleReader from "@/components/library/ArticleReader";
import SearchAndFilter from "@/components/library/SearchAndFilter";
import Encyclopedia from "@/components/library/Encyclopedia";
import AdvancedSearch from "@/components/library/AdvancedSearch";
import OfflineManager from "@/components/library/OfflineManager";
import QuickHelp from "@/components/shared/QuickHelp";
import { ContentLoadingSkeleton } from "@/components/shared/EnhancedLoadingStates";
import { ListSkeleton } from "@/components/mobile/LoadingStates";
import { AnimatedPage, FadeIn, AnimatedList, AnimatedListItem } from "@/components/mobile/AnimatedPage";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLibraryData } from "@/hooks/useLibraryData";
import { LibraryTab } from "@/hooks/useLibrary";
import { useOfflineContent } from "@/hooks/useOfflineContent";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SearchResult } from "@/hooks/useAdvancedSearch";
import { useFavorites } from "@/hooks/useFavorites";

const Library = () => {
  const navigate = useNavigate();
  
  // استخدام بيانات المكتبة المحدثة مع المحتوى الديناميكي
  const { articles, videos, categories, isLoading } = useLibraryData();
  
  // استخدام المفضلة
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // الحالة المحلية
  const [activeTab, setActiveTab] = useState<LibraryTab>('videos');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isArticleReaderOpen, setIsArticleReaderOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // تصفية المحتوى
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

  // وظائف التشغيل والقراءة
  const playVideo = (id: number) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      setSelectedVideo(video);
      setIsVideoPlayerOpen(true);
    }
  };

  const readArticle = (id: number) => {
    const article = articles.find(a => a.id === id);
    if (article) {
      setSelectedArticle(article);
      setIsArticleReaderOpen(true);
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

  const {
    isContentAvailableOffline,
    saveContentOffline,
    removeOfflineContent,
    offlineContent,
    storageStats,
    isDownloading,
    downloadProgress
  } = useOfflineContent();

  const {
    trackContentView,
    trackFavorite,
    trackSearch,
    trackFeatureUsage,
    getUserStats
  } = useAnalytics();

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // استمع لتحديثات المحتوى من لوحة التحكم
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      const { action, content } = event.detail;
      console.log(`📚 Library received content update: ${action} - ${content.title}`);
      setLastUpdate(new Date());
      
      // إجبار إعادة تحميل المحتوى
      window.location.reload();
    };

    // استمع لأحداث التحديث الخاصة بالمقالات والفيديوهات
    window.addEventListener('articleUpdated', handleContentUpdate as EventListener);
    window.addEventListener('videoUpdated', handleContentUpdate as EventListener);
    window.addEventListener('contentUpdate', handleContentUpdate as EventListener);

    return () => {
      window.removeEventListener('articleUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('videoUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('contentUpdate', handleContentUpdate as EventListener);
    };
  }, []);

  // تتبع عرض المحتوى
  const handleContentView = (contentId: string, contentType: 'article' | 'video' | 'encyclopedia' | 'tip', title: string, category: string) => {
    trackContentView(contentId, contentType, title, category);
  };

  // التعامل مع نتائج البحث المتقدم
  const handleAdvancedSearchResult = (result: SearchResult) => {
    trackSearch(result.title, 1);
    setShowAdvancedSearch(false);
    
    // التنقل إلى المحتوى المحدد
    if (result.type === 'article') {
      const article = articles.find(a => a.id.toString() === result.id.split('-')[1]);
      if (article) {
        readArticle(article.id);
        handleContentView(article.id.toString(), 'article', article.title, article.category);
      }
    } else if (result.type === 'video') {
      const video = videos.find(v => v.id.toString() === result.id.split('-')[1]);
      if (video) {
        playVideo(video.id);
        handleContentView(video.id.toString(), 'video', video.title, video.category);
      }
    }
  };

  // التعامل مع المفضلة مع التتبع
  const handleToggleFavorite = (contentId: number, contentType: 'article' | 'video') => {
    const wasAdded = !isFavorite(contentId, contentType);
    toggleFavorite(contentId, contentType);
    trackFavorite(contentId.toString(), contentType, wasAdded);
  };

  // حفظ محتوى أوفلاين
  const handleSaveOffline = async (contentId: string, contentType: 'article' | 'video' | 'encyclopedia' | 'tip') => {
    const success = await saveContentOffline(contentId, contentType);
    if (success) {
      trackFeatureUsage('offline_download');
    }
  };

  return (
    <MobileLayout>
      <AnimatedPage>
        {/* Mobile Header */}
        <MobileHeader 
          title="المكتبة التعليمية"
          subtitle={
            activeTab === 'videos' ? `${videos.length} فيديو` :
            activeTab === 'articles' ? `${articles.length} مقال` :
            'موسوعة الحمل A-Z'
          }
          showBackButton={true}
          onBack={() => navigate(-1)}
        />

        <div className="px-4 py-4 space-y-6">

          {/* Tab Switcher */}
          <FadeIn delay={0.05}>
            <TabSwitcher 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
          </FadeIn>

          {/* Search and Filters - إخفاء للموسوعة لأن لها نظام بحث خاص */}
          {activeTab !== 'encyclopedia' && (
            <FadeIn delay={0.1}>
              <div className="space-y-4">
                <SearchAndFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  activeTab={activeTab}
                  totalResults={activeTab === 'videos' ? filteredVideos.length : filteredArticles.length}
                />
                
                <div className="flex gap-3 justify-center">
                  <TouchFeedback>
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className="flex items-center gap-2 touch-target"
                      size="sm"
                    >
                      <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                      {showFavoritesOnly ? `المفضلة` : 'عرض المفضلة فقط'}
                    </Button>
                  </TouchFeedback>

                  <TouchFeedback>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(true)}
                      className="flex items-center gap-2 touch-target"
                      size="sm"
                    >
                      <Search className="w-4 h-4" />
                      بحث متقدم
                    </Button>
                  </TouchFeedback>
                  
                  <TouchFeedback>
                    <Button
                      variant="outline"
                      onClick={() => setShowOfflineManager(true)}
                      className="flex items-center gap-2 touch-target relative"
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                      أوفلاين
                      {offlineContent.length > 0 && (
                        <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs min-w-5 h-5">
                          {offlineContent.length}
                        </Badge>
                      )}
                    </Button>
                  </TouchFeedback>
                  
                  <TouchFeedback onClick={() => navigate('/premium-access')}>
                    <Button
                      variant="default"
                      className="flex items-center gap-2 bg-gradient-primary touch-target"
                      size="sm"
                    >
                      <Star className="w-4 h-4" />
                      المحتوى المدفوع
                    </Button>
                  </TouchFeedback>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Content */}
          {activeTab === "videos" ? (
            <FadeIn delay={0.2}>
              {isLoading ? (
                <ContentLoadingSkeleton type="video" />
              ) : filteredVideos.length > 0 ? (
                <AnimatedList className="space-y-4">
                  {filteredVideos.map((video) => (
                    <AnimatedListItem key={`video_${video.id}`}>
                      <VideoCard
                        video={video}
                        onPlay={(video) => {
                          playVideo(video.id);
                          handleContentView(video.id.toString(), 'video', video.title, video.category);
                        }}
                        isFavorite={isFavorite(video.id, 'video')}
                        onToggleFavorite={() => handleToggleFavorite(video.id, 'video')}
                        isOfflineAvailable={isContentAvailableOffline(video.id.toString(), 'video')}
                        onSaveOffline={() => handleSaveOffline(video.id.toString(), 'video')}
                        downloadProgress={downloadProgress[video.id.toString()]}
                      />
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {showFavoritesOnly ? "لا توجد فيديوهات في المفضلة" : "لا توجد فيديوهات"}
                  </h3>
                  <p className="text-sm text-muted-foreground">جربي تغيير كلمات البحث أو الفئة</p>
                </div>
              )}
            </FadeIn>
          ) : activeTab === "articles" ? (
            <FadeIn delay={0.2}>
              {isLoading ? (
                <ContentLoadingSkeleton type="article" />
              ) : filteredArticles.length > 0 ? (
                <AnimatedList className="space-y-4">
                  {filteredArticles.map((article) => (
                    <AnimatedListItem key={`article_${article.id}`}>
                      <ArticleCard
                        article={article}
                        onRead={(article) => {
                          readArticle(article.id);
                          handleContentView(article.id.toString(), 'article', article.title, article.category);
                        }}
                        isFavorite={isFavorite(article.id, 'article')}
                        onToggleFavorite={() => handleToggleFavorite(article.id, 'article')}
                        isOfflineAvailable={isContentAvailableOffline(article.id.toString(), 'article')}
                        onSaveOffline={() => handleSaveOffline(article.id.toString(), 'article')}
                        downloadProgress={downloadProgress[article.id.toString()]}
                      />
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {showFavoritesOnly ? "لا توجد مقالات في المفضلة" : "لا توجد مقالات"}
                  </h3>
                  <p className="text-sm text-muted-foreground">جربي تغيير كلمات البحث أو الفئة</p>
                </div>
              )}
            </FadeIn>
          ) : (
            <FadeIn delay={0.2}>
              <Encyclopedia />
            </FadeIn>
          )}
        </div>
        
        {/* Video Player Modal */}
        <VideoPlayer
          video={selectedVideo}
          isOpen={isVideoPlayerOpen}
          onClose={closeVideoPlayer}
        />
        
        {/* Article Reader Modal */}
        <ArticleReader
          article={selectedArticle}
          isOpen={isArticleReaderOpen}
          onClose={closeArticleReader}
        />

        {/* Advanced Search Modal */}
        <AdvancedSearch
          isOpen={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          onSelectResult={handleAdvancedSearchResult}
        />

        {/* Offline Manager Modal */}
        <OfflineManager
          isOpen={showOfflineManager}
          onClose={() => setShowOfflineManager(false)}
        />

        {/* Quick Help */}
        <QuickHelp pageType="library" />
      </AnimatedPage>
    </MobileLayout>
  );
};

export default Library;