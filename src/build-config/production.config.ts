// Production build configuration for Google Play Store release

export const productionConfig = {
  // App identification
  appId: 'com.drosman.pregnancycompanion',
  appName: 'Osman Pregnancy companion - رفيق الحمل الذكي',
  version: '1.0.0',
  versionCode: 1,
  
  // Target specifications for Google Play
  targetSdkVersion: 34, // Android 14 (Required for new apps)
  minSdkVersion: 21,    // Android 5.0 (Lollipop)
  compileSdkVersion: 34,
  
  // Content rating and categories
  contentRating: {
    type: 'health',
    category: 'pregnancy',
    ageRating: 'everyone',
    containsMedicalInfo: true,
    requiresDisclaimer: true
  },
  
  // Google Play Console requirements
  playConsole: {
    // Privacy policy URL (update with your actual URL)
    privacyPolicyUrl: 'https://your-domain.com/privacy-policy',
    
    // Support contact
    supportEmail: 'support@drosman.app',
    supportWebsite: 'https://your-domain.com/support',
    
    // App description for store
    shortDescription: 'رفيق الحمل الذكي - نصائح وتذكيرات طبية للحوامل',
    fullDescription: `
      تطبيق Osman Pregnancy companion هو رفيقك الذكي في رحلة الحمل.
      يوفر نصائح أسبوعية مخصصة، تذكيرات طبية، مكتبة تعليمية شاملة 
      ومساعد ذكي لدعم الحوامل. التطبيق مصمم للأغراض التعليمية 
      ولا يُغني عن الاستشارة الطبية المتخصصة.
    `,
    
    // Keywords for store optimization
    keywords: [
      'حمل', 'حوامل', 'نصائح طبية', 'تطبيق حمل', 
      'رعاية الحمل', 'تذكيرات طبية', 'صحة الحامل'
    ]
  },
  
  // Security and permissions
  permissions: {
    camera: {
      required: false,
      description: 'لالتقاط صور تتبع نمو البطن'
    },
    notifications: {
      required: true,
      description: 'لإرسال التذكيرات الطبية والمواعيد'
    },
    storage: {
      required: true,
      description: 'لحفظ البيانات والصور محلياً'
    }
  },
  
  // Build optimizations
  build: {
    enableProguard: true,
    enableR8: true,
    minifyEnabled: true,
    shrinkResources: true,
    useAndroidX: true,
    targetArchitectures: ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64']
  }
};

export default productionConfig;