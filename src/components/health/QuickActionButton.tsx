import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

const QuickActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = 'outline',
  className = ''
}: QuickActionButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant={variant}
        onClick={onClick}
        className={`flex-1 h-auto py-4 px-3 flex flex-col gap-2 ${className}`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-xs font-medium">{label}</span>
      </Button>
    </motion.div>
  );
};

export default QuickActionButton;