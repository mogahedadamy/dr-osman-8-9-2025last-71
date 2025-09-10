import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

// Page transition variants - محسنة لمنع الرجفة
const pageVariants = {
  initial: {
    opacity: 0,
    y: 4, // قلل من 20 إلى 4 لتجنب الرجفة
    scale: 1 // غير من 0.98 إلى 1
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -4, // قلل من -20 إلى -4
    scale: 1 // غير من 0.98 إلى 1
  }
};

const pageTransition = {
  duration: 0.2, // قلل من 0.4 إلى 0.2
  ease: [0.4, 0, 0.2, 1] as const
};

// Slide in from bottom (like mobile apps)
const slideUpVariants = {
  initial: {
    opacity: 0,
    y: "100%"
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: "100%"
  }
};

const slideTransition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1] as const
};

// Stagger animation for lists
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  }
};

const itemTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1] as const
};

// Main animated page wrapper - محسن لمنع الرجفة
export const AnimatedPage = ({ children, className = "" }: AnimatedPageProps) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    className={`stable-content smooth-page-transition ${className}`}
  >
    {children}
  </motion.div>
);

// Slide up page (for modals, sheets)
export const SlideUpPage = ({ children, className = "" }: AnimatedPageProps) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={slideUpVariants}
    transition={slideTransition}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated list container
export const AnimatedList = ({ children, className = "" }: AnimatedPageProps) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={containerVariants}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated list item
export const AnimatedListItem = ({ children, className = "" }: AnimatedPageProps) => (
  <motion.div
    variants={itemVariants}
    transition={itemTransition}
    className={className}
  >
    {children}
  </motion.div>
);

// Fade in wrapper
export const FadeIn = ({ 
  children, 
  delay = 0, 
  className = "" 
}: AnimatedPageProps & { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ 
      duration: 0.4, 
      delay,
      ease: [0.4, 0, 0.2, 1] as const
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale in animation (for buttons, cards)
export const ScaleIn = ({ 
  children, 
  delay = 0, 
  className = "" 
}: AnimatedPageProps & { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ 
      duration: 0.3, 
      delay,
      ease: [0.4, 0, 0.2, 1] as const
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Hover animation wrapper
export const HoverScale = ({ children, className = "" }: AnimatedPageProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Page route wrapper with exit animations
export const PageRouteWrapper = ({ children }: { children: ReactNode }) => (
  <AnimatePresence mode="wait">
    {children}
  </AnimatePresence>
);