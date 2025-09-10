import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface UseBackButtonOptions {
  enabled?: boolean;
  onBack?: () => void;
  fallbackPath?: string;
  exitOnHome?: boolean; // السماح بالخروج من التطبيق في الصفحة الرئيسية
}

export const useBackButton = ({ 
  enabled = true, 
  onBack, 
  fallbackPath = '/',
  exitOnHome = true
}: UseBackButtonOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // التعامل مع زر الرجوع في الهاتف والمتصفح
  useEffect(() => {
    if (!enabled) return;

    let backButtonListener: any = null;

    const handleBackButton = () => {
      console.log('Hardware back button pressed, current path:', location.pathname);
      
      if (onBack) {
        onBack();
        return;
      }

      // إذا كنا في الصفحة الرئيسية والسماح بالخروج مفعل
      if (location.pathname === '/' && exitOnHome) {
        // إظهار تأكيد الخروج أو الخروج مباشرة
        if (Capacitor.isNativePlatform()) {
          App.exitApp();
        }
        return;
      }

      // الرجوع للصفحة السابقة
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackPath);
      }
    };

    // إذا كنا في منصة أصلية (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      App.addListener('backButton', handleBackButton).then(listener => {
        backButtonListener = listener;
      });
    }

    // التعامل مع زر الرجوع في المتصفح أيضاً
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      handleBackButton();
    };

    window.addEventListener('popstate', handlePopState);

    // تنظيف
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, onBack, navigate, location.pathname, fallbackPath, exitOnHome]);

  // دالة للرجوع يدوياً
  const goBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return { goBack };
};