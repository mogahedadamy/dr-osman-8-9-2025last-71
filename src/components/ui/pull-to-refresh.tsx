import { ReactNode, useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className = ""
}: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  // Transform the pull distance to rotation and opacity
  const rotate = useTransform(y, [0, threshold], [0, 180]);
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const scale = useTransform(y, [0, threshold], [0.8, 1]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsAtTop(container.scrollTop <= 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (disabled || !isAtTop || info.offset.y < threshold) {
      y.set(0);
      return;
    }

    setIsRefreshing(true);
    y.set(threshold);

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      y.set(0);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || !isAtTop || info.offset.y < 0) {
      return;
    }
    
    // Apply resistance to the pull
    const resistance = Math.min(info.offset.y * 0.5, threshold);
    y.set(resistance);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 bg-gradient-to-b from-background to-background/0"
        style={{
          y: useTransform(y, [0, threshold], [-50, 10]),
          opacity,
          height: threshold
        }}
      >
        <motion.div
          className="flex items-center gap-2 text-primary"
          style={{ scale }}
        >
          <motion.div style={{ rotate }}>
            <RotateCcw className="w-5 h-5" />
          </motion.div>
          <span className="text-sm font-medium">
            {isRefreshing ? "جاري التحديث..." : "اسحبي للتحديث"}
          </span>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="h-full overflow-auto mobile-scroll"
      >
        {children}
      </motion.div>
    </div>
  );
};