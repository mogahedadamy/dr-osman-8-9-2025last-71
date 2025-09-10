import { useState, useEffect, useCallback } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { getFCMToken, onForegroundMessage } from '@/config/firebase';

interface PushNotificationPermission {
  receive: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<PushNotificationPermission>({ receive: 'prompt' });
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    const supported = Capacitor.isPluginAvailable('PushNotifications') || !Capacitor.isNativePlatform();
    setIsSupported(supported);

    if (supported) {
      initializePushNotifications();
    }
  }, []);

  const initializePushNotifications = async () => {
    if (Capacitor.isNativePlatform()) {
      // Native platform initialization
      await initializeNativePush();
    } else {
      // Web platform initialization
      await initializeWebPush();
    }
  };

  const initializeNativePush = async () => {
    // Request permission
    const permissionStatus = await PushNotifications.requestPermissions();
    setPermission(permissionStatus);

    if (permissionStatus.receive === 'granted') {
      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration token
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        setToken(token.value);
        setIsRegistered(true);
        
        // Save token to backend/storage
        saveTokenToStorage(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        toast({
          title: "خطأ في تسجيل الإشعارات",
          description: "فشل في تسجيل الإشعارات",
          variant: "destructive"
        });
      });

      // Listen for push notification received
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        
        // Show in-app notification
        toast({
          title: notification.title || "إشعار جديد",
          description: notification.body || "لديك إشعار جديد"
        });
      });

      // Listen for push notification action performed
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification);
        
        // Handle notification tap actions
        handleNotificationAction(notification);
      });
    }
  };

  const initializeWebPush = async () => {
    try {
      // Register service worker for web push
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      }

      // Get FCM token for web
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        setToken(fcmToken);
        setIsRegistered(true);
        saveTokenToStorage(fcmToken);
      }

      // Listen for foreground messages
      onForegroundMessage((payload) => {
        toast({
          title: payload.notification?.title || "إشعار جديد",
          description: payload.notification?.body || "لديك إشعار جديد"
        });
      });

      setPermission({ receive: 'granted' });
    } catch (error) {
      console.error('Error initializing web push:', error);
      setPermission({ receive: 'denied' });
    }
  };

  const saveTokenToStorage = (tokenValue: string) => {
    localStorage.setItem('fcm_token', tokenValue);
    console.log('FCM Token saved:', tokenValue);
    
    // Here you would typically send the token to your backend
    // Example: sendTokenToBackend(tokenValue);
  };

  const handleNotificationAction = (notification: ActionPerformed) => {
    const data = notification.notification.data;
    
    // Navigate based on notification data
    if (data?.page) {
      // Use your router to navigate
      console.log('Navigate to:', data.page);
      // Example: navigate(data.page);
    }

    if (data?.action) {
      // Perform specific actions based on notification type
      console.log('Perform action:', data.action);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "الإشعارات غير مدعومة",
        description: "جهازك لا يدعم الإشعارات",
        variant: "destructive"
      });
      return false;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const permissionStatus = await PushNotifications.requestPermissions();
        setPermission(permissionStatus);
        
        if (permissionStatus.receive === 'granted') {
          await PushNotifications.register();
          return true;
        }
      } else {
        // Web permission request
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPermission({ receive: 'granted' });
          await initializeWebPush();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }, [isSupported, toast]);

  const sendTestNotification = useCallback(() => {
    if (Capacitor.isNativePlatform()) {
      // For native, you would typically trigger this from your backend
      console.log('Test notification should be sent from backend');
    } else {
      // For web, show a test notification
      if (Notification.permission === 'granted') {
        new Notification('إشعار تجريبي', {
          body: 'هذا إشعار تجريبي للتأكد من عمل النظام',
          icon: '/favicon.ico',
          tag: 'test-notification'
        });
      }
    }
  }, []);

  return {
    permission: permission.receive,
    token,
    isSupported,
    isRegistered,
    requestPermission,
    sendTestNotification
  };
};