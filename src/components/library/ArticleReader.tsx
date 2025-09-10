import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Share, Heart, ArrowLeft, AlertTriangle, Lightbulb } from "lucide-react";
import { Article } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";
import { articlesData } from "@/data/articlesData";

interface ArticleReaderProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

const ArticleReader = ({ article, isOpen, onClose }: ArticleReaderProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  if (!article) return null;

  console.log("📖 ArticleReader: عرض قارئ المقالات", { 
    article: article.title, 
    category: article.category,
    readTime: article.readTime,
    isOpen 
  });

  // Get dynamic article content
  const articleContent = articlesData[article.id];
  
  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case 'list':
        return (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-bold mb-3">{section.title}</h2>
            <ul className="list-disc list-inside space-y-2">
              {section.items?.map((item: string, itemIndex: number) => (
                <li key={itemIndex} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        );
      
      case 'tip':
        return (
          <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 {section.title}</h3>
                <p className="text-blue-800 dark:text-blue-200">{section.content}</p>
              </div>
            </div>
          </div>
        );
      
      case 'warning':
        return (
          <div key={index} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ {section.title}</h3>
                <p className="text-red-800 dark:text-red-200">{section.content}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div key={index} className="mb-6">
            {section.title && <h2 className="text-xl font-bold mb-3">{section.title}</h2>}
            <p className="leading-relaxed">{section.content}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh]" dir="rtl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 ml-1" />
              رجوع
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button 
                variant={isFavorite(article.id, 'article') ? "default" : "ghost"}
                size="sm"
                onClick={() => toggleFavorite(article.id, 'article')}
              >
                <Heart className={`w-4 h-4 ${isFavorite(article.id, 'article') ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
          
          <DialogTitle className="text-right text-2xl">{article.title}</DialogTitle>
          <DialogDescription className="text-right">
            مقال تعليمي شامل - وقت القراءة {article.readTime}
          </DialogDescription>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </div>
              <span>•</span>
              <span>للقراءة</span>
            </div>
            
            <Badge variant="secondary">
              {article.category}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Article Header */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-3xl">
                {article.emoji}
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none text-right" dir="rtl">
              <div className="bg-primary-light p-4 rounded-lg mb-6">
                <p className="text-foreground font-medium mb-0">
                  {articleContent?.summary || article.summary}
                </p>
              </div>
              
              <div className="space-y-6 text-foreground">
                {articleContent?.sections.map((section, index) => renderSection(section, index))}
                
                {/* Tags */}
                {articleContent?.tags && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">الكلمات المفتاحية</h3>
                    <div className="flex flex-wrap gap-2">
                      {articleContent.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Sources */}
                {articleContent?.sources && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">المصادر العلمية</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {articleContent.sources.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleReader;