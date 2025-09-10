import { Video } from '@/types';

// فيديوهات مجانية مع دعم Bunny.net CDN والملفات المضمّنة
export const freeVideos: Video[] = [
  {
    id: 1,
    title: "مقدمة عن الحمل الصحي",
    duration: "3:45",
    category: "أساسيات",
    thumbnail: "🤰",
    rating: 4.9,
    views: "25K",
    accessLevel: 'free',
    localPath: '/videos/intro.mp4', // فيديو مضمّن صغير
    remoteUrl: 'https://your-bunny-zone.b-cdn.net/videos/intro-complete.mp4'
  },
  {
    id: 2,
    title: "تمارين التنفس للحامل",
    duration: "8:30",
    category: "تمارين",
    thumbnail: "🫁",
    rating: 4.8,
    views: "18K",
    accessLevel: 'free',
    localPath: '/videos/breathing.mp4', // فيديو مضمّن صغير
    remoteUrl: 'https://your-bunny-zone.b-cdn.net/videos/breathing-complete.mp4'
  },
  {
    id: 3,
    title: "التغذية الأساسية للحامل",
    duration: "12:15",
    category: "تغذية",
    thumbnail: "🥗",
    rating: 4.7,
    views: "22K",
    accessLevel: 'free',
    // هذا فيديو كبير فقط عبر CDN
    remoteUrl: 'https://your-bunny-zone.b-cdn.net/videos/nutrition-basics.mp4'
  },
  {
    id: 4,
    title: "تمارين الحمل الآمنة - الشهر الأول",
    duration: "15:20",
    category: "تمارين",
    thumbnail: "🤸‍♀️",
    rating: 4.6,
    views: "15K",
    accessLevel: 'free',
    remoteUrl: 'https://your-bunny-zone.b-cdn.net/videos/month1-exercises.mp4'
  },
  {
    id: 5,
    title: "الفحوصات المهمة في الشهور الأولى",
    duration: "10:30",
    category: "صحة",
    thumbnail: "🏥",
    rating: 4.8,
    views: "20K",
    accessLevel: 'free',
    remoteUrl: 'https://your-bunny-zone.b-cdn.net/videos/early-checkups.mp4'
  }
];

// فيديوهات مدفوعة (متاحة فقط للمشتركين)
export const premiumVideos: Video[] = [
  {
    id: 101,
    title: "دورة شاملة: الاستعداد للولادة",
    duration: "45:30",
    category: "ولادة",
    thumbnail: "👶",
    rating: 5.0,
    views: "8K",
    accessLevel: 'premium',
    remoteUrl: 'https://your-bunny-zone.b-cdn.net/premium/birth-preparation.mp4'
  },
  {
    id: 102,
    title: "التمارين المتقدمة للحمل",
    duration: "35:20",
    category: "تمارين",
    thumbnail: "💪",
    rating: 4.9,
    views: "5K",
    accessLevel: 'premium',
    remoteUrl: 'https://your-bunny-zone.b-cdn.net/premium/advanced-exercises.mp4'
  }
];

// دمج كل الفيديوهات
export const allVideos: Video[] = [...freeVideos, ...premiumVideos];