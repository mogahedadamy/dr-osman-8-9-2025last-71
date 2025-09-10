import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-muted border-t-primary", sizeClasses[size], className)} />
  );
};

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({ message = "جاري التحميل...", className }: LoadingStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 space-y-4", className)}>
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard = ({ className }: LoadingCardProps) => {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-muted rounded-lg h-48 mb-4"></div>
      <div className="space-y-2">
        <div className="bg-muted rounded h-4 w-3/4"></div>
        <div className="bg-muted rounded h-4 w-1/2"></div>
      </div>
    </div>
  );
};