import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Star, Clock, Heart, Download } from "lucide-react";
import { Video } from "@/types";
import { Progress } from "@/components/ui/progress";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import LazyImage from "@/components/ui/lazy-image";

interface VideoCardProps {
  video: Video;
  onPlay?: (video: Video) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isOfflineAvailable?: boolean;
  onSaveOffline?: () => Promise<void>;
  downloadProgress?: number;
}

const VideoCard = ({ 
  video, 
  onPlay, 
  isFavorite = false, 
  onToggleFavorite,
  isOfflineAvailable = false,
  onSaveOffline,
  downloadProgress
}: VideoCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      "تمارين": "bg-wellness-soft text-wellness-foreground",
      "تغذية": "bg-secondary-soft text-secondary-foreground",
      "ولادة": "bg-primary-light text-primary-foreground",
      "نمو الطفل": "bg-accent-soft text-accent-foreground",
      "صحة": "bg-primary-soft text-primary-foreground"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="shadow-card hover:shadow-soft transition-all duration-300 hover:scale-102 cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <LazyImage
            src={video.thumbnail}
            alt={video.title}
            className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center text-6xl"
            fallback={
              <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center text-6xl">
                🎥
              </div>
            }
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {video.duration}
          </div>
          {onToggleFavorite && (
            <TouchFeedback>
              <Button
                size="sm"
                variant="ghost"
                className={`absolute top-2 left-2 p-2 rounded-full ${
                  isFavorite ? 'text-red-500 bg-white/20' : 'text-white bg-black/20'
                } hover:text-red-500 hover:bg-white/30`}
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
                className={`absolute top-2 right-2 p-2 rounded-full ${
                  isOfflineAvailable ? 'text-green-500 bg-white/20' : 'text-white bg-black/20'
                } hover:text-blue-500 hover:bg-white/30`}
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
              size="sm"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-12 h-12 p-0"
              onClick={() => onPlay?.(video)}
            >
              <Play className="w-6 h-6" />
            </Button>
          </TouchFeedback>
          
          {downloadProgress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
              <Progress value={downloadProgress} className="h-1" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge className={getCategoryColor(video.category)}>
              {video.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              {video.rating}
            </div>
          </div>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
            {video.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{video.views} مشاهدة</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {video.duration}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;