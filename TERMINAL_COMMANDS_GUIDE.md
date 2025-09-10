# 🚀 دليل أوامر التيرمينال الكامل - من البناء إلى Android Studio

## خطوات البناء والتطوير كاملة:

### 1️⃣ تحضير المشروع
```bash
# تثبيت المتطلبات
npm install

# إضافة منصة Android (إذا لم تكن موجودة)
npx cap add android
```

### 2️⃣ بناء التطبيق للإنتاج
```bash
# بناء التطبيق بتكوين الإنتاج (مهم جداً!)
npm run build -- --config vite.config.production.ts

# مزامنة الملفات مع Capacitor
npx cap sync android
```

### 3️⃣ فتح Android Studio
```bash
# فتح المشروع في Android Studio
npx cap open android
```

## 🎯 أوامر بديلة حسب نظام التشغيل:

### Windows:
```cmd
# بناء التطبيق
npm run build -- --config vite.config.production.ts

# مزامنة
npx cap sync android

# فتح Android Studio
npx cap open android

# أو بناء APK مباشرة من التيرمينال
cd android
gradlew assembleDebug
```

### macOS/Linux:
```bash
# بناء التطبيق
npm run build -- --config vite.config.production.ts

# مزامنة
npx cap sync android

# فتح Android Studio
npx cap open android

# أو بناء APK مباشرة من التيرمينال
cd android
./gradlew assembleDebug
```

## 📱 في Android Studio:

### بعد فتح Android Studio:
1. **انتظر تحميل المشروع** (قد يستغرق دقائق في المرة الأولى)
2. **Sync Project with Gradle Files** (إذا طُلب منك)
3. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. أو اضغط على **Run** لتشغيل على محاكي/جهاز

### مسار ملف APK النهائي:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔧 حل المشاكل الشائعة:

### إذا لم يفتح Android Studio:
```bash
# تأكد من تثبيت Android Studio أولاً
# ثم حاول:
npx cap sync android
npx cap open android

# إذا فشل، افتح Android Studio يدوياً واختر:
# Open an Existing Project → android folder
```

### إذا كانت هناك أخطاء Gradle:
```bash
cd android
./gradlew clean
./gradlew build
```

## 🎊 السكريبت السريع الكامل:
```bash
#!/bin/bash
echo "🚀 بناء وفتح Android Studio..."

# بناء التطبيق
npm run build -- --config vite.config.production.ts

# مزامنة
npx cap sync android

# فتح Android Studio
npx cap open android

echo "✅ تم فتح Android Studio بنجاح!"
```

## 📝 ملاحظات هامة:
- **دائماً استخدم** `vite.config.production.ts` للبناء النهائي
- **لا تنس** `npx cap sync android` بعد كل تغيير
- **Android Studio** سيفتح مجلد `android` من مشروعك تلقائياً