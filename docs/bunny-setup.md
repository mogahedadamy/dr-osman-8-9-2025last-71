# إعداد Bunny.net للفيديوهات

## خطوات الإعداد

### 1. إنشاء حساب Bunny.net
- اذهب إلى [bunny.net](https://bunny.net)
- سجل حساب جديد
- فعّل الحساب

### 2. إنشاء Storage Zone
```
اسم المنطقة: dr-osman-videos
المنطقة الجغرافية: اختر الأقرب لجمهورك (Europe/Middle East)
```

### 3. إنشاء Pull Zone (CDN)
```
اسم المنطقة: dr-osman-cdn
ربطها بـ Storage Zone: dr-osman-videos
تفعيل CORS: نعم
```

### 4. تحديث بيانات الفيديوهات
في ملف `src/data/videosData.ts`، استبدل:
```typescript
remoteUrl: 'https://your-bunny-zone.b-cdn.net/videos/intro-complete.mp4'
```

بالروابط الفعلية من Bunny.net:
```typescript
remoteUrl: 'https://dr-osman-cdn.b-cdn.net/videos/intro-complete.mp4'
```

### 5. رفع الفيديوهات
استخدم Bunny.net Dashboard أو FTP لرفع الفيديوهات إلى مجلد `/videos/`

### 6. تحسين الفيديوهات
قبل الرفع، ضغط الفيديوهات باستخدام:
- الدقة: 720p (1280x720)
- معدل البت: 1.5 Mbps
- الترميز: H.264 + AAC
- الحاوي: MP4

### 7. إعدادات CORS
في Bunny.net Dashboard:
```
Pull Zone → Security → CORS
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Range, Content-Range
```

## هيكل الملفات المقترح

```
public/videos/          (فيديوهات مضمّنة صغيرة)
├── intro.mp4          (2MB - مقدمة سريعة)
├── breathing.mp4      (3MB - تمارين التنفس الأساسية)
└── thumbs/            (صور مصغرة اختيارية)
    ├── intro.jpg
    └── breathing.jpg

Bunny.net Storage:     (فيديوهات كاملة عبر CDN)
├── videos/
│   ├── intro-complete.mp4      (15MB)
│   ├── breathing-complete.mp4  (25MB)
│   ├── nutrition-basics.mp4    (35MB)
│   ├── month1-exercises.mp4    (40MB)
│   └── early-checkups.mp4      (30MB)
└── premium/           (محتوى مدفوع)
    ├── birth-preparation.mp4
    └── advanced-exercises.mp4
```

## اختبار التشغيل

### في المتصفح
- الفيديوهات المضمّنة تعمل مباشرة
- الفيديوهات عبر CDN تحتاج اتصال إنترنت

### في التطبيق (Android/iOS)
```bash
npm run build
npx cap sync
npx cap run android
```

- اختبر تحميل فيديو للأوفلاين
- تأكد من التشغيل بدون إنترنت
- فحص مساحة التخزين في الإعدادات

## مراقبة الاستخدام
- Bunny.net Dashboard يوضح:
  - عدد المشاهدات
  - استهلاك البيانات
  - التكلفة الشهرية