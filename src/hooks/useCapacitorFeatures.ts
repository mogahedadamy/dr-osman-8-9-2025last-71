import { useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { useToast } from '@/hooks/use-toast';

export const useCapacitorFeatures = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const info = await Device.getInfo();
        setDeviceInfo(info);
        setIsNativeApp(info.platform !== 'web');
        
        // Request notification permissions if native
        if (info.platform !== 'web') {
          await LocalNotifications.requestPermissions();
        }
      } catch (error) {
        console.log('Running in web mode');
        setIsNativeApp(false);
      }
    };

    initializeDevice();
  }, []);

  const takePhoto = async (saveToGallery = true) => {
    if (!isNativeApp) {
      toast({
        title: "ميزة الكاميرا",
        description: "هذه الميزة متاحة في التطبيق المحمول فقط",
        variant: "destructive"
      });
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery
      });

      toast({
        title: "تم التقاط الصورة بنجاح! 📸",
        description: "تم حفظ الصورة في معرض الصور"
      });

      return photo.webPath;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "خطأ في التقاط الصورة",
        description: "حدث خطأ أثناء استخدام الكاميرا",
        variant: "destructive"
      });
      return null;
    }
  };

  const scheduleNotification = async (
    title: string, 
    body: string, 
    scheduleAt: Date,
    id?: number
  ) => {
    if (!isNativeApp) {
      toast({
        title: "إشعار محلي",
        description: body,
      });
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: id || Date.now(),
            schedule: { at: scheduleAt },
            sound: 'default',
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });

      toast({
        title: "تم جدولة التذكير ✅",
        description: `سيتم تذكيرك: ${title}`
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: "خطأ في التذكير",
        description: "حدث خطأ أثناء جدولة التذكير",
        variant: "destructive"
      });
    }
  };

  const cancelNotification = async (id: number) => {
    if (!isNativeApp) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      toast({
        title: "تم إلغاء التذكير",
        description: "تم حذف التذكير بنجاح"
      });
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const saveFile = async (data: string, fileName: string) => {
    if (!isNativeApp) {
      // Fallback for web - use localStorage
      localStorage.setItem(fileName, data);
      return fileName;
    }

    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      toast({
        title: "تم حفظ الملف ✅",
        description: `حُفظ الملف: ${fileName}`
      });

      return result.uri;
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الملف",
        variant: "destructive"
      });
      return null;
    }
  };

  const readFile = async (fileName: string) => {
    if (!isNativeApp) {
      // Fallback for web
      return localStorage.getItem(fileName);
    }

    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      return result.data as string;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  };

  const getDeviceInfo = () => {
    return {
      isNativeApp,
      deviceInfo,
      platform: deviceInfo?.platform || 'web',
      model: deviceInfo?.model || 'Unknown',
      operatingSystem: deviceInfo?.operatingSystem || 'Web'
    };
  };

  return {
    isNativeApp,
    deviceInfo,
    takePhoto,
    scheduleNotification,
    cancelNotification,
    saveFile,
    readFile,
    getDeviceInfo
  };
};