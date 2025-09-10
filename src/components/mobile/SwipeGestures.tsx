import { ReactNode } from "react";
import { motion, PanInfo } from "framer-motion";

interface SwipeGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeGestures = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = "",
  disabled = false
}: SwipeGesturesProps) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;

    const { offset, velocity } = info;
    const absOffsetX = Math.abs(offset.x);
    const absOffsetY = Math.abs(offset.y);

    // Determine if swipe is strong enough
    const isStrongSwipe = absOffsetX > threshold || absOffsetY > threshold;
    const hasVelocity = Math.abs(velocity.x) > 500 || Math.abs(velocity.y) > 500;

    if (!isStrongSwipe && !hasVelocity) return;

    // Horizontal swipes
    if (absOffsetX > absOffsetY) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    // Vertical swipes
    else {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
  };

  return (
    <motion.div
      drag={disabled ? false : true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Quick swipe actions for common patterns
export const SwipeToNavigate = ({
  children,
  onNext,
  onPrevious,
  className = ""
}: {
  children: ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}) => (
  <SwipeGestures
    onSwipeLeft={onNext}
    onSwipeRight={onPrevious}
    className={className}
  >
    {children}
  </SwipeGestures>
);

export const SwipeToDelete = ({
  children,
  onDelete,
  className = ""
}: {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}) => (
  <SwipeGestures
    onSwipeLeft={onDelete}
    threshold={100}
    className={className}
  >
    {children}
  </SwipeGestures>
);