import { ReactNode, useState, useRef, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useToast } from "@/hooks/use-toast";

interface PullToRefreshWrapperProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  refreshThreshold?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefreshWrapper = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  disabled = false,
  className = ""
}: PullToRefreshWrapperProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const { lightTap, mediumTap } = useHapticFeedback();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;

    const { offset } = info;
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    // Only allow pull down when at the top of the scroll
    if (scrollTop === 0 && offset.y > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(offset.y, refreshThreshold * 1.5));
      
      // Haptic feedback when reaching threshold
      if (offset.y >= refreshThreshold && pullDistance < refreshThreshold) {
        mediumTap();
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, refreshThreshold, pullDistance, mediumTap]);

  const handleDragEnd = useCallback(async (event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;

    const { offset } = info;
    const scrollTop = containerRef.current?.scrollTop || 0;

    if (scrollTop === 0 && offset.y >= refreshThreshold) {
      setIsRefreshing(true);
      lightTap();
      
      try {
        await onRefresh();
        toast({
          title: "تم التحديث",
          description: "تم تحديث المحتوى بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ في التحديث",
          description: "حدث خطأ أثناء التحديث، حاول مرة أخرى",
          variant: "destructive"
        });
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  }, [disabled, isRefreshing, refreshThreshold, onRefresh, lightTap, toast]);

  const pullProgress = Math.min(pullDistance / refreshThreshold, 1);
  const shouldTriggerRefresh = pullDistance >= refreshThreshold;

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{
        y: isPulling || isRefreshing ? Math.min(pullDistance * 0.5, refreshThreshold * 0.5) : 0
      }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 120 
      }}
    >
      {/* Pull Indicator */}
      {(isPulling || isRefreshing) && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ 
            opacity: isPulling || isRefreshing ? 1 : 0, 
            y: isPulling || isRefreshing ? 0 : -50 
          }}
          transition={{ duration: 0.2 }}
          style={{
            height: Math.min(pullDistance, refreshThreshold),
            background: "linear-gradient(180deg, transparent 0%, rgba(var(--background), 0.8) 50%, rgba(var(--background), 0.95) 100%)"
          }}
        >
          <motion.div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              shouldTriggerRefresh ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            } shadow-lg`}
            animate={{ 
              scale: isPulling ? 1 : 0.8,
              rotate: isRefreshing ? 360 : pullProgress * 180 
            }}
            transition={{ 
              rotate: { 
                duration: isRefreshing ? 1 : 0.3, 
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear" 
              },
              scale: { duration: 0.2 }
            }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
          
          <motion.p
            className={`text-xs font-medium mt-2 ${
              shouldTriggerRefresh ? "text-primary" : "text-muted-foreground"
            }`}
            animate={{ opacity: isPulling ? 1 : 0 }}
          >
            {isRefreshing 
              ? "جاري التحديث..." 
              : shouldTriggerRefresh 
                ? "اتركي للتحديث" 
                : "اسحبي للتحديث"
            }
          </motion.p>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>
    </motion.div>
  );
};

export default PullToRefreshWrapper;