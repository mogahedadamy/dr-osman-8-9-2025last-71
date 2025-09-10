import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "dr-osman-pregnancy.firebaseapp.com",
  projectId: "dr-osman-pregnancy",
  storageBucket: "dr-osman-pregnancy.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging (Web only)
let messaging: any = null;
if (!Capacitor.isNativePlatform() && typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase messaging not available:', error);
  }
}

export { messaging };

// Get FCM token for web
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY" // Add your VAPID key here
    });
    
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages (Web only)
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};