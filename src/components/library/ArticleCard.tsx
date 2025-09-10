import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Download } from "lucide-react";
import { Article } from "@/types";
import { Progress } from "@/components/ui/progress";
import TouchFeedback from "@/components/mobile/TouchFeedback";

interface ArticleCardProps {
  article: Article;
  onRead?: (article: Article) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isOfflineAvailable?: boolean;
  onSaveOffline?: () => Promise<void>;
  downloadProgress?: number;
}

const ArticleCard = ({ 
  article, 
  onRead, 
  isFavorite = false, 
  onToggleFavorite,
  isOfflineAvailable = false,
  onSaveOffline,
  downloadProgress
}: ArticleCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      "تمارين": "bg-wellness-soft text-wellness-foreground",
      "تغذية": "bg-secondary-soft text-secondary-foreground",
      "ولادة": "bg-primary-light text-primary-foreground",
      "نمو الطفل": "bg-accent-soft text-accent-foreground",
      "صحة": "bg-primary-soft text-primary-foreground",
      "نصائح": "bg-secondary-soft text-secondary-foreground",
      "استعداد": "bg-accent-soft text-accent-foreground"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="shadow-card hover:shadow-soft transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{article.emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              <span className="text-sm text-muted-foreground">{article.readTime}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {article.summary}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            {onToggleFavorite && (
              <TouchFeedback>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`p-2 ${isFavorite ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </TouchFeedback>
            )}
            
            {onSaveOffline && (
              <TouchFeedback>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`p-2 ${isOfflineAvailable ? 'text-green-500' : 'text-muted-foreground'} hover:text-blue-500`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveOffline();
                  }}
                  disabled={downloadProgress !== undefined}
                >
                  <Download className={`w-4 h-4 ${isOfflineAvailable ? 'text-green-500' : ''}`} />
                </Button>
              </TouchFeedback>
            )}
            
            <TouchFeedback>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRead?.(article)}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </TouchFeedback>
          </div>
        </div>
        {downloadProgress !== undefined && (
          <div className="mt-2">
            <Progress value={downloadProgress} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleCard;