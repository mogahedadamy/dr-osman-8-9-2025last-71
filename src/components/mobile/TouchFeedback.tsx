import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy';
}

export const TouchFeedback = ({ 
  children, 
  className = "", 
  onClick, 
  disabled = false,
  haptic = true,
  hapticType = 'light'
}: TouchFeedbackProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const { lightTap, mediumTap, heavyTap } = useHapticFeedback();

  const handleTouchStart = () => {
    if (disabled) return;
    setIsPressed(true);
    
    // Add haptic feedback if supported
    if (haptic) {
      switch (hapticType) {
        case 'light':
          lightTap();
          break;
        case 'medium':
          mediumTap();
          break;
        case 'heavy':
          heavyTap();
          break;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => setIsPressed(false)}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      animate={{
        scale: isPressed && !disabled ? 0.98 : 1,
      }}
      transition={{
        duration: 0.1,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export default TouchFeedback;