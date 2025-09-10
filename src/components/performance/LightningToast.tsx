import { useEffect, useState } from 'react';
import { useLightningPerformance } from '@/hooks/useLightningPerformance';

interface LightningToastProps {
  message: string;
  type: 'success' | 'warning' | 'info' | 'boost';
  duration?: number;
  onClose?: () => void;
}

const LightningToast = ({ message, type, duration = 3000, onClose }: LightningToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'info':
        return 'bg-blue-500 text-white border-blue-600';
      case 'boost':
        return 'bg-gradient-lightning text-white border-primary shadow-glow';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'boost': return '⚡';
      default: return '';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 p-4 rounded-lg border-2 shadow-lg
        animate-in slide-in-from-right-full duration-300
        ${getToastStyles()}
        ${type === 'boost' ? 'speed-boost' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

// Hook لعرض التوست
export const useLightningToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'boost';
  }>>([]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'boost' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSpeedBoost = () => {
    showToast('تم تسريع التطبيق بنجاح! ⚡', 'boost');
  };

  return {
    toasts,
    showToast,
    showSpeedBoost,
    removeToast,
    ToastContainer: () => (
      <>
        {toasts.map(toast => (
          <LightningToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </>
    )
  };
};

export default LightningToast;