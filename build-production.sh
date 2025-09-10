#!/bin/bash

# 🎯 سكريبت البناء الصحيح للإنتاج
# يضمن إنشاء تطبيق مستقل يعمل بدون انترنت

echo "🚀 بدء بناء التطبيق للإنتاج..."

# 1. تنظيف البناء السابق
echo "🧹 تنظيف ملفات البناء السابقة..."
rm -rf dist/
rm -rf android/app/build/

# 2. بناء التطبيق بتكوين الإنتاج
echo "📦 بناء التطبيق بتكوين الإنتاج..."
npm run build -- --config vite.config.production.ts

if [ $? -ne 0 ]; then
    echo "❌ فشل في بناء التطبيق"
    exit 1
fi

# 3. مزامنة مع Capacitor
echo "🔄 مزامنة الملفات مع Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ فشل في مزامنة Capacitor"
    exit 1
fi

# 4. بناء APK
echo "📱 بناء APK للأندرويد..."
cd android
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ فشل في بناء APK"
    exit 1
fi

cd ..

# 5. العثور على ملف APK الجديد
echo "🔍 البحث عن ملف APK الجديد..."
APK_PATH=$(find android -name "*.apk" -type f)

if [ -z "$APK_PATH" ]; then
    echo "❌ لم يتم العثور على ملف APK"
    exit 1
fi

echo "✅ تم بناء التطبيق بنجاح!"
echo "📱 مسار ملف APK: $APK_PATH"
echo ""
echo "🎉 التطبيق جاهز الآن للتثبيت والعمل بدون انترنت!"
echo "📝 تأكد من حذف النسخة القديمة قبل تثبيت الجديدة"