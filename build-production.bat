@echo off
REM 🎯 سكريبت البناء الصحيح للإنتاج (Windows)
REM يضمن إنشاء تطبيق مستقل يعمل بدون انترنت

echo 🚀 بدء بناء التطبيق للإنتاج...

REM 1. تنظيف البناء السابق
echo 🧹 تنظيف ملفات البناء السابقة...
if exist dist rmdir /s /q dist
if exist android\app\build rmdir /s /q android\app\build

REM 2. بناء التطبيق بتكوين الإنتاج
echo 📦 بناء التطبيق بتكوين الإنتاج...
call npm run build -- --config vite.config.production.ts

if %ERRORLEVEL% neq 0 (
    echo ❌ فشل في بناء التطبيق
    pause
    exit /b 1
)

REM 3. مزامنة مع Capacitor
echo 🔄 مزامنة الملفات مع Capacitor...
call npx cap sync android

if %ERRORLEVEL% neq 0 (
    echo ❌ فشل في مزامنة Capacitor
    pause
    exit /b 1
)

REM 4. بناء APK
echo 📱 بناء APK للأندرويد...
cd android
call gradlew assembleDebug

if %ERRORLEVEL% neq 0 (
    echo ❌ فشل في بناء APK
    pause
    exit /b 1
)

cd ..

REM 5. العثور على ملف APK الجديد
echo 🔍 البحث عن ملف APK الجديد...
for /r android %%i in (*.apk) do echo 📱 مسار ملف APK: %%i

echo.
echo ✅ تم بناء التطبيق بنجاح!
echo 🎉 التطبيق جاهز الآن للتثبيت والعمل بدون انترنت!
echo 📝 تأكد من حذف النسخة القديمة قبل تثبيت الجديدة
pause