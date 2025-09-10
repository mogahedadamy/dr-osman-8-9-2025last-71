import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// Loading spinner for full screen
export const FullScreenLoader = () => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <motion.div
      className="relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
    </motion.div>
    <motion.p
      className="mt-4 text-sm text-muted-foreground absolute bottom-1/3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      جاري التحميل...
    </motion.p>
  </div>
);

// Card skeleton for lists
export const CardSkeleton = () => (
  <motion.div
    className="bg-card rounded-xl p-4 border border-border shadow-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start gap-3">
      <Skeleton className="w-12 h-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-muted" />
        <Skeleton className="h-3 w-1/2 bg-muted" />
        <Skeleton className="h-3 w-full bg-muted" />
      </div>
    </div>
  </motion.div>
);

// List skeleton
export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <CardSkeleton />
      </motion.div>
    ))}
  </div>
);

// Header skeleton
export const HeaderSkeleton = () => (
  <motion.div
    className="px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full bg-muted" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32 bg-muted" />
          <Skeleton className="h-3 w-20 bg-muted" />
        </div>
      </div>
      <Skeleton className="w-10 h-10 rounded-full bg-muted" />
    </div>
  </motion.div>
);

// Button loading state
export const ButtonLoader = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  return (
    <motion.div
      className={`${sizes[size]} border-2 border-primary/20 border-t-primary rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// Pulse animation for placeholders
export const PulsePlaceholder = ({ 
  className = "", 
  children 
}: { 
  className?: string;
  children?: React.ReactNode;
}) => (
  <motion.div
    className={`bg-muted/50 rounded-lg ${className}`}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Loading dots
export const LoadingDots = () => (
  <div className="flex gap-1">
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: index * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);