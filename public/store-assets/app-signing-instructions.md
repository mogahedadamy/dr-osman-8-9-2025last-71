# إرشادات توقيع التطبيق للنشر على Google Play Store

## إنشاء Keystore للتوقيع

### 1. إنشاء ملف Keystore جديد
```bash
# إنشاء keystore جديد
keytool -genkey -v -keystore dr-osman-release-key.keystore -alias dr-osman-key -keyalg RSA -keysize 2048 -validity 10000

# سيطلب منك إدخال:
# - كلمة مرور للـ keystore (احفظها بأمان!)
# - كلمة مرور للـ key (يُفضل أن تكون نفس كلمة مرور الـ keystore)
# - معلومات الشهادة (الاسم، المؤسسة، المدينة، البلد)
```

### 2. إعدادات ملف gradle.properties
أضف هذه الإعدادات لملف `android/gradle.properties`:

```properties
# Keystore information
MYAPP_UPLOAD_STORE_FILE=dr-osman-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=dr-osman-key
MYAPP_UPLOAD_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

### 3. إعدادات ملف build.gradle
في ملف `android/app/build.gradle`, أضف:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

## بناء APK موقع للإنتاج

### 1. بناء Release Build
```bash
# تنظيف وبناء المشروع
cd android
./gradlew clean
./gradlew assembleRelease

# أو لبناء AAB (Android App Bundle) - مُفضل لـ Google Play
./gradlew bundleRelease
```

### 2. التحقق من التوقيع
```bash
# التحقق من توقيع الـ APK
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk

# أو للـ AAB
jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab
```

## أمان Keystore

⚠️ **مهم جداً:**
- احتفظ بنسخة احتياطية من ملف الـ keystore في مكان آمن
- لا تشارك كلمة المرور مع أحد
- إذا فقدت الـ keystore، لن تتمكن من تحديث التطبيق على Google Play

## ملفات الإخراج

بعد البناء ستجد الملفات في:
- **APK:** `android/app/build/outputs/apk/release/app-release.apk`
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`

يُنصح برفع ملف AAB لـ Google Play Store لأنه يوفر حجماً أصغر وأداءً أفضل.