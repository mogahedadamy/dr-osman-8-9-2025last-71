import { useState, useEffect } from 'react';
import { Video } from '@/types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useToast } from '@/hooks/use-toast';

interface OfflineVideoData {
  id: number;
  fileUri: string;
  size: number;
  downloadedAt: string;
}

export const useVideoOffline = () => {
  const { toast } = useToast();
  const [offlineVideos, setOfflineVideos] = useState<OfflineVideoData[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // تحميل بيانات الفيديوهات المحفوظة من التخزين المحلي
  useEffect(() => {
    loadOfflineVideos();
  }, []);

  const loadOfflineVideos = async () => {
    try {
      const stored = localStorage.getItem('offline-videos');
      if (stored) {
        setOfflineVideos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading offline videos:', error);
    }
  };

  const saveOfflineVideosData = (videos: OfflineVideoData[]) => {
    try {
      localStorage.setItem('offline-videos', JSON.stringify(videos));
      setOfflineVideos(videos);
    } catch (error) {
      console.error('Error saving offline videos:', error);
    }
  };

  // تحديد مصدر الفيديو بالأولوية الصحيحة
  const getVideoSource = (video: Video): string => {
    // الأولوية 1: الملف المحمّل أوفلاين
    const offlineVideo = offlineVideos.find(v => v.id === video.id);
    if (offlineVideo?.fileUri) {
      return Capacitor.convertFileSrc(offlineVideo.fileUri);
    }

    // الأولوية 2: الملف المضمّن في التطبيق
    if (video.localPath) {
      return video.localPath;
    }

    // الأولوية 3: الرابط عبر الإنترنت
    return video.remoteUrl || '';
  };

  // فحص إذا كان الفيديو متاح أوفلاين
  const isOfflineAvailable = (videoId: number): boolean => {
    return offlineVideos.some(v => v.id === videoId);
  };

  // تحميل الفيديو للأوفلاين
  const downloadVideo = async (video: Video): Promise<boolean> => {
    if (!video.remoteUrl) {
      toast({
        title: "خطأ",
        description: "لا يوجد رابط لتحميل هذا الفيديو",
        variant: "destructive"
      });
      return false;
    }

    // التحقق من المنصة
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "تنبيه",
        description: "تحميل الفيديوهات للأوفلاين متاح فقط في التطبيق على الهاتف",
        variant: "destructive"
      });
      return false;
    }

    try {
      const videoKey = video.id.toString();
      setDownloadProgress(prev => ({ ...prev, [videoKey]: 0 }));

      toast({
        title: "بدء التحميل",
        description: `جاري تحميل: ${video.title}`
      });

      // تحميل الفيديو
      const response = await fetch(video.remoteUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            loaded += value.length;
            
            if (total > 0) {
              const progress = Math.round((loaded / total) * 100);
              setDownloadProgress(prev => ({ ...prev, [videoKey]: progress }));
            }
          }
        }
      }

      // دمج البيانات وتحويلها إلى base64
      const videoData = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        videoData.set(chunk, offset);
        offset += chunk.length;
      }

      const base64Data = btoa(String.fromCharCode(...videoData));

      // حفظ الملف باستخدام Capacitor Filesystem
      const fileName = `video_${video.id}.mp4`;
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data
      });

      // حفظ بيانات الفيديو المحمّل
      const offlineVideoData: OfflineVideoData = {
        id: video.id,
        fileUri: result.uri,
        size: loaded,
        downloadedAt: new Date().toISOString()
      };

      const updatedVideos = [...offlineVideos.filter(v => v.id !== video.id), offlineVideoData];
      saveOfflineVideosData(updatedVideos);

      // إزالة شريط التقدم
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[videoKey];
        return updated;
      });

      toast({
        title: "تم التحميل بنجاح",
        description: `${video.title} متاح الآن للمشاهدة أوفلاين`
      });

      return true;

    } catch (error) {
      console.error('Error downloading video:', error);
      
      // إزالة شريط التقدم
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[video.id.toString()];
        return updated;
      });

      toast({
        title: "فشل التحميل",
        description: "حدث خطأ أثناء تحميل الفيديو",
        variant: "destructive"
      });

      return false;
    }
  };

  // حذف الفيديو من الأوفلاين
  const deleteOfflineVideo = async (videoId: number): Promise<boolean> => {
    try {
      const offlineVideo = offlineVideos.find(v => v.id === videoId);
      if (!offlineVideo) return true;

      // حذف الملف من النظام
      if (Capacitor.isNativePlatform()) {
        const fileName = `video_${videoId}.mp4`;
        await Filesystem.deleteFile({
          path: fileName,
          directory: Directory.Data
        });
      }

      // إزالة من البيانات المحفوظة
      const updatedVideos = offlineVideos.filter(v => v.id !== videoId);
      saveOfflineVideosData(updatedVideos);

      toast({
        title: "تم الحذف",
        description: "تم حذف الفيديو من التخزين المحلي"
      });

      return true;

    } catch (error) {
      console.error('Error deleting offline video:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الفيديو",
        variant: "destructive"
      });
      return false;
    }
  };

  // الحصول على حجم التخزين المستخدم
  const getStorageSize = (): number => {
    return offlineVideos.reduce((total, video) => total + video.size, 0);
  };

  // تنظيف الفيديوهات القديمة (أكثر من 30 يوم)
  const cleanupOldVideos = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldVideos = offlineVideos.filter(video => 
      new Date(video.downloadedAt) < thirtyDaysAgo
    );

    for (const video of oldVideos) {
      await deleteOfflineVideo(video.id);
    }
  };

  return {
    getVideoSource,
    isOfflineAvailable,
    downloadVideo,
    deleteOfflineVideo,
    downloadProgress,
    offlineVideos,
    getStorageSize,
    cleanupOldVideos
  };
};