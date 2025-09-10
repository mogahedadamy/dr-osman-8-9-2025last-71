# دليل بناء التطبيق للنشر على Google Play Store

## المتطلبات الأساسية

### 1. تحديث معرف التطبيق
```typescript
// في capacitor.config.ts
appId: 'com.drosman.pregnancycompanion'
```

### 2. إعداد بيانات التطبيق
- **اسم التطبيق**: Osman Pregnancy companion - رفيق الحمل الذكي
- **الإصدار**: 1.0.0
- **رقم الإصدار**: 1
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 21 (Android 5.0)

## خطوات البناء

### 1. تحضير البيئة
```bash
# تثبيت المتطلبات
npm install

# إضافة منصة Android
npx cap add android

# تحديث التبعيات
npx cap update android
```

### 2. بناء التطبيق
```bash
# بناء المشروع
npm run build

# مزامنة الملفات مع Android
npx cap sync android
```

### 3. إعداد التوقيع
```bash
# إنشاء keystore للتوقيع
keytool -genkey -v -keystore drosman-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias drosman-key

# إعداد gradle.properties
echo "MYAPP_RELEASE_STORE_FILE=drosman-release-key.keystore" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_ALIAS=drosman-key" >> android/gradle.properties
echo "MYAPP_RELEASE_STORE_PASSWORD=your_password" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_PASSWORD=your_password" >> android/gradle.properties
```

### 4. بناء APK للإنتاج
```bash
# فتح مشروع Android Studio
npx cap open android

# أو بناء من سطر الأوامر
cd android
./gradlew assembleRelease

# إنشاء AAB للـ Play Store
./gradlew bundleRelease
```

## متطلبات Google Play Console

### 1. سياسة الخصوصية
- ✅ تم إنشاؤها في `/privacy-policy`
- ✅ تحتوي على تنبيه طبي
- ⚠️ تحتاج رابط صالح: `https://your-domain.com/privacy-policy`

### 2. التصريحات الطبية
- ✅ تنبيه طبي في بداية التطبيق
- ✅ إخلاء مسؤولية واضح
- ✅ تأكيد أن التطبيق لا يُغني عن الاستشارة الطبية

### 3. بيانات المتجر المطلوبة
```
العنوان: Osman Pregnancy companion - رفيق الحمل الذكي
الوصف المختصر: رفيق الحمل الذكي - نصائح وتذكيرات طبية للحوامل
الفئة: الصحة واللياقة البدنية > الطب
تقييم المحتوى: للجميع
البلدان المستهدفة: المملكة العربية السعودية، الإمارات، مصر
```

### 4. الصور المطلوبة
- ✅ أيقونة التطبيق: 512x512 (متوفرة)
- ✅ لقطات الشاشة: 16:9 أو 9:16 (متوفرة)
- ⚠️ صورة المميزة: 1024x500 (تحتاج إنشاء)
- ⚠️ بانر التلفزيون: 1280x720 (اختياري)

## قائمة المراجعة النهائية

### التقنية
- [x] Target SDK 34
- [x] 64-bit support
- [x] إشعارات محلية
- [x] دعم الكاميرا
- [x] حفظ البيانات محلياً
- [x] دعم RTL كامل

### المحتوى
- [x] سياسة خصوصية شاملة
- [x] تنبيه طبي واضح
- [x] إخلاء مسؤولية
- [x] معلومات اتصال

### المتجر
- [ ] رابط سياسة خصوصية صالح
- [ ] حساب Google Play Console
- [ ] Keystore للتوقيع
- [ ] صورة مميزة 1024x500
- [ ] اختبار على أجهزة مختلفة

## نصائح مهمة

1. **اختبر التطبيق شامل** على أجهزة Android مختلفة
2. **تأكد من الإشعارات** تعمل بشكل صحيح
3. **اختبر الكاميرا** والتصاريح
4. **راجع النصوص العربية** على شاشات مختلفة
5. **تأكد من عدم وجود معلومات Lovable** في التطبيق النهائي

## الدعم
- البريد الإلكتروني: support@drosman.app
- الموقع: https://your-domain.com
- سياسة الخصوصية: https://your-domain.com/privacy-policy