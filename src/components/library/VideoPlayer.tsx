import React, { useState, useRef, useEffect } from 'react';
import { Video } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize, Heart, Share2 } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useVideoOffline } from '@/hooks/useVideoOffline';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayer = ({ video, isOpen, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getVideoSource, isOfflineAvailable } = useVideoOffline();
  const { toast } = useToast();

  // تحديث المصدر عند تغيير الفيديو
  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      
      // استعادة آخر موقع تشغيل
      const savedTime = localStorage.getItem(`video-time-${video.id}`);
      if (savedTime) {
        videoRef.current.currentTime = parseFloat(savedTime);
        setCurrentTime(parseFloat(savedTime));
      }
    }
  }, [video]);

  // حفظ موقع التشغيل كل 5 ثوانٍ
  useEffect(() => {
    const interval = setInterval(() => {
      if (video && currentTime > 0) {
        localStorage.setItem(`video-time-${video.id}`, currentTime.toString());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [video, currentTime]);

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    console.log("🎬 VideoPlayer: تبديل تشغيل الفيديو", { 
      videoTitle: video.title, 
      wasPlaying: isPlaying, 
      willBePlaying: !isPlaying 
    });
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const handleProgressChange = (newProgress: number[]) => {
    const progressValue = newProgress[0];
    setProgress(progressValue);
    if (videoRef.current) {
      const newTime = (progressValue / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!video) return null;

  const videoSource = getVideoSource(video);
  const isVideoOffline = isOfflineAvailable(video.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{video.title}</DialogTitle>
          <DialogDescription className="text-right">
            مشغل فيديو تعليمي - مدة العرض {video.duration}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Video Container */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"><rect width="400" height="225" fill="#1a1a1a"/><text x="200" y="112.5" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dy=".3em">${video.thumbnail}</text></svg>`)}`}
            >
              {videoSource && <source src={videoSource} type="video/mp4" />}
              متصفحك لا يدعم تشغيل الفيديو
            </video>
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <span className="text-sm min-w-[80px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>

                {/* سرعة التشغيل */}
                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                  className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </div>
          {/* Video Info */}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">{video.title}</h2>
                  {isVideoOffline && (
                    <Badge variant="secondary" className="text-xs">
                      متاح أوفلاين
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">
                  وصف تفصيلي للفيديو سيتم إضافته هنا. يحتوي هذا الفيديو على معلومات مهمة حول {video.category}.
                </p>
              </div>
            </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>🕐</span>
                {video.duration}
              </div>
              <div className="flex items-center gap-1">
                <span>👁️</span>
                {video.views} مشاهدة
              </div>
              <div className="flex items-center gap-1">
                <span>⭐</span>
                {video.rating}
              </div>
            </div>
            
            <Badge variant="secondary">
              {video.category}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end" dir="rtl">
            <Button 
              variant={isFavorite(video.id, 'video') ? "default" : "outline"}
              onClick={() => toggleFavorite(video.id, 'video')}
              className="flex items-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isFavorite(video.id, 'video') ? 'fill-current' : ''}`} />
              {isFavorite(video.id, 'video') ? 'في المفضلة' : 'إضافة للمفضلة'}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              مشاركة
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;