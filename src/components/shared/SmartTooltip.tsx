import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";

interface SmartTooltipProps {
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  onClose?: () => void;
  showOnce?: boolean;
  storageKey?: string;
}

const SmartTooltip = ({
  targetSelector,
  title,
  description,
  position = 'auto',
  onClose,
  showOnce = false,
  storageKey
}: SmartTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if should show based on storage
    if (showOnce && storageKey) {
      const hasShown = localStorage.getItem(`tooltip-${storageKey}`);
      if (hasShown) return;
    }

    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    const showTooltip = () => {
      const rect = targetElement.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let pos = position;
      let style: React.CSSProperties = {};

      // Auto-calculate position if needed
      if (position === 'auto') {
        const spaceTop = rect.top;
        const spaceBottom = viewport.height - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewport.width - rect.right;

        if (spaceBottom > 200) pos = 'bottom';
        else if (spaceTop > 200) pos = 'top';
        else if (spaceRight > 300) pos = 'right';
        else pos = 'left';
      }

      // Calculate position
      switch (pos) {
        case 'top':
          style = {
            left: rect.left + rect.width / 2,
            top: rect.top - 10,
            transform: 'translate(-50%, -100%)'
          };
          break;
        case 'bottom':
          style = {
            left: rect.left + rect.width / 2,
            top: rect.bottom + 10,
            transform: 'translate(-50%, 0)'
          };
          break;
        case 'left':
          style = {
            left: rect.left - 10,
            top: rect.top + rect.height / 2,
            transform: 'translate(-100%, -50%)'
          };
          break;
        case 'right':
          style = {
            left: rect.right + 10,
            top: rect.top + rect.height / 2,
            transform: 'translate(0, -50%)'
          };
          break;
      }

      setCalculatedPosition(pos as 'top' | 'bottom' | 'left' | 'right');
      setTooltipStyle(style);
      setIsVisible(true);

      // Add highlight to target element
      const htmlElement = targetElement as HTMLElement;
      htmlElement.classList.add('tooltip-highlighted');
      htmlElement.style.position = 'relative';
      htmlElement.style.zIndex = '45';
      htmlElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
      htmlElement.style.borderRadius = '8px';
    };

    // Show tooltip after a small delay
    const timer = setTimeout(showTooltip, 500);

    return () => {
      clearTimeout(timer);
      // Remove highlight
      const element = document.querySelector(targetSelector);
      if (element) {
        element.classList.remove('tooltip-highlighted');
        (element as HTMLElement).style.boxShadow = '';
        (element as HTMLElement).style.zIndex = '';
      }
    };
  }, [targetSelector, position]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Save to storage if needed
    if (showOnce && storageKey) {
      localStorage.setItem(`tooltip-${storageKey}`, 'true');
    }

    // Remove highlight
    const element = document.querySelector(targetSelector);
    if (element) {
      element.classList.remove('tooltip-highlighted');
      (element as HTMLElement).style.boxShadow = '';
      (element as HTMLElement).style.zIndex = '';
    }

    onClose?.();
  };

  const getArrowIcon = () => {
    switch (calculatedPosition) {
      case 'top': return <ArrowDown className="w-4 h-4 text-primary" />;
      case 'bottom': return <ArrowUp className="w-4 h-4 text-primary" />;
      case 'left': return <ArrowRight className="w-4 h-4 text-primary" />;
      case 'right': return <ArrowLeft className="w-4 h-4 text-primary" />;
      default: return <Lightbulb className="w-4 h-4 text-primary" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 max-w-xs"
      style={tooltipStyle}
    >
      <Card className="shadow-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getArrowIcon()}
              <h4 className="font-semibold text-sm text-foreground">{title}</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="w-6 h-6 p-0 hover:bg-muted/50"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {description}
          </p>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1"
            >
              فهمت ✓
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Arrow pointer */}
      <div
        className={`absolute w-3 h-3 bg-background border-r border-b border-primary/30 transform rotate-45 ${
          calculatedPosition === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2' :
          calculatedPosition === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2' :
          calculatedPosition === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2' :
          'left-[-6px] top-1/2 -translate-y-1/2'
        }`}
      />
    </div>
  );
};

export default SmartTooltip;