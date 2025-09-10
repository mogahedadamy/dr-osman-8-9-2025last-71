import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drosman.pregnancycompanion',
  appName: 'Osman Pregnancy companion - رفيق الحمل الذكي',
  webDir: 'dist',
  // Production mode - use local files only (NO SERVER)
  plugins: {
    App: {
      androidBackButton: "enabled"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#ff6b9d",
      sound: "default",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Camera: {
      ios: {
        allowsEditing: true,
        quality: 80
      },
      android: {
        allowEditing: true,
        quality: 80,
        saveToGallery: true
      }
    },
    Filesystem: {
      iosDatabaseLocation: "Library/CapacitorDatabase"
    },
    Device: {}
  },
};

export default config;