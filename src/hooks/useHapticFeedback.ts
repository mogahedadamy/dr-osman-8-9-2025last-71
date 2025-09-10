import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticOptions {
  pattern?: HapticPattern;
  enabled?: boolean;
}

export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: HapticPattern = 'light', enabled: boolean = true) => {
    if (!enabled || !('vibrate' in navigator)) {
      return;
    }

    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
      success: [10, 50, 10],
      warning: [50, 100, 50],
      error: [100, 50, 100, 50, 100]
    };

    const vibrationPattern = patterns[pattern];
    navigator.vibrate(vibrationPattern);
  }, []);

  const lightTap = useCallback((enabled = true) => vibrate('light', enabled), [vibrate]);
  const mediumTap = useCallback((enabled = true) => vibrate('medium', enabled), [vibrate]);
  const heavyTap = useCallback((enabled = true) => vibrate('heavy', enabled), [vibrate]);
  
  const success = useCallback((enabled = true) => vibrate('success', enabled), [vibrate]);
  const warning = useCallback((enabled = true) => vibrate('warning', enabled), [vibrate]);
  const error = useCallback((enabled = true) => vibrate('error', enabled), [vibrate]);

  const isSupported = 'vibrate' in navigator;

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    isSupported
  };
};