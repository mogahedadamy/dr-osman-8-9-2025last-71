import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, 
  Download, 
  MessageSquare, 
  BookOpen, 
  Calendar,
  Heart,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";

// Enhanced Loading Spinner with Context
interface SmartLoadingProps {
  type?: 'chat' | 'content' | 'booking' | 'general';
  progress?: number;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SmartLoading = ({ 
  type = 'general', 
  progress, 
  message,
  size = 'md' 
}: SmartLoadingProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const loadingMessages = {
    chat: `🤖 المساعد يفكر${dots}`,
    content: `📚 جاري تحميل المحتوى${dots}`,
    booking: `📅 جاري حجز موعدك${dots}`,
    general: `⏳ جاري التحميل${dots}`
  };

  const icons = {
    chat: <MessageSquare className="w-5 h-5 text-primary" />,
    content: <BookOpen className="w-5 h-5 text-primary" />,
    booking: <Calendar className="w-5 h-5 text-primary" />,
    general: <Loader2 className="w-5 h-5 text-primary animate-spin" />
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Card className="shadow-card border-primary/20">
      <CardContent className="p-4 text-center">
        <div className={`mx-auto mb-3 ${sizes[size]} flex items-center justify-center`}>
          {type === 'general' ? (
            <Loader2 className={`${sizes[size]} text-primary animate-spin`} />
          ) : (
            icons[type]
          )}
        </div>
        
        <p className="text-sm text-primary font-medium mb-2">
          {message || loadingMessages[type]}
        </p>
        
        {progress !== undefined && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{Math.round(progress)}% مكتمل</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced Content Loading with Preview
export const ContentLoadingSkeleton = ({ type }: { type: 'video' | 'article' | 'tips' }) => {
  const skeletonCount = type === 'tips' ? 6 : 3;
  
  return (
    <div className="space-y-4">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Card key={index} className="shadow-card animate-pulse">
          <CardContent className="p-4">
            {type === 'video' && (
              <div className="flex gap-3">
                <Skeleton className="w-20 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            )}
            
            {type === 'article' && (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            )}
            
            {type === 'tips' && (
              <div className="text-center space-y-2">
                <Skeleton className="w-8 h-8 rounded-full mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
                <Skeleton className="h-3 w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Interactive Progress States
interface InteractiveProgressProps {
  step: number;
  totalSteps: number;
  stepLabels: string[];
  currentStepMessage?: string;
}

export const InteractiveProgress = ({ 
  step, 
  totalSteps, 
  stepLabels, 
  currentStepMessage 
}: InteractiveProgressProps) => {
  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-foreground mb-2">
            {currentStepMessage || 'جاري المعالجة...'}
          </h3>
          <Badge variant="outline" className="mb-4">
            الخطوة {step} من {totalSteps}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <Progress value={(step / totalSteps) * 100} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {stepLabels.map((label, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${
                  index < step ? 'text-primary' : 
                  index === step - 1 ? 'text-secondary' : ''
                }`}
              >
                {index < step ? (
                  <CheckCircle2 className="w-4 h-4 mb-1" />
                ) : index === step - 1 ? (
                  <AlertCircle className="w-4 h-4 mb-1 animate-pulse" />
                ) : (
                  <div className="w-4 h-4 border border-muted rounded-full mb-1" />
                )}
                <span className="text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Download Progress Component
interface DownloadProgressProps {
  fileName: string;
  progress: number;
  speed?: string;
  isCompleted?: boolean;
}

export const DownloadProgress = ({ 
  fileName, 
  progress, 
  speed, 
  isCompleted = false 
}: DownloadProgressProps) => {
  return (
    <Card className="shadow-card border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Download className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-foreground truncate">
              {fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {isCompleted ? 'تم التحميل بنجاح' : 'جاري التحميل...'}
            </p>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              {speed && <span>{speed}</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Pulsing Dots for Chat Loading
export const ChatLoadingDots = () => {
  return (
    <div className="flex items-center gap-1 py-2">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};