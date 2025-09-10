// إعداد البيانات الأولية للنظام
import { localDB } from './localDatabase';
import { User } from '@/types/auth';
import { bookingService } from '@/services/bookingService';

export const initData = async () => {
  try {
    // تحديث بنية قاعدة البيانات أولاً
    await localDB.init();
    
    // إنشاء حساب المدير الافتراضي
    const adminUser: User = {
      id: 'admin-001',
      username: 'admin',
      password: 'admin123',
      fullName: 'المدير العام',
      type: 'admin',
      createdAt: new Date(),
      isActive: true,
      email: 'admin@drosman.com'
    };

    // إنشاء حساب مستخدم تجريبي مميز
    const testUser: User = {
      id: 'user-001',
      username: 'user',
      password: 'user123',
      fullName: 'مستخدم تجريبي',
      type: 'premium',
      createdAt: new Date(),
      isActive: true,
      email: 'user@drosman.com',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // سنة كاملة
    };

    // ضمان وجود/تحديث حساب المدير بواسطة اسم المستخدم (لتفادي اختلاف المعرف id)
    const existingAdmins = await localDB.getByIndex<User>('users', 'username', 'admin');
    if (existingAdmins && existingAdmins.length > 0) {
      const existing = existingAdmins[0];
      await localDB.update<User>('users', existing.id, {
        password: 'admin123',
        isActive: true,
        type: 'admin',
        fullName: 'المدير العام',
        email: 'admin@drosman.com'
      });
      console.log('تم تحديث بيانات حساب المدير الافتراضي');
    } else {
      await localDB.save('users', adminUser);
      console.log('تم إنشاء حساب المدير الافتراضي');
    }

    // ضمان وجود/تحديث حساب المستخدم التجريبي المميز بواسطة اسم المستخدم
    const existingUsers = await localDB.getByIndex<User>('users', 'username', 'user');
    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      await localDB.update<User>('users', existing.id, {
        password: 'user123',
        isActive: true,
        type: 'premium',
        fullName: 'مستخدم تجريبي',
        email: 'user@drosman.com',
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
      console.log('تم تحديث حساب المستخدم التجريبي');
    } else {
      await localDB.save('users', testUser);
      console.log('تم إنشاء حساب المستخدم التجريبي');
    }

    // تهيئة البيانات التجريبية لنظام الحجوزات
    await bookingService.initializeSampleData();
    
    console.log('تم تهيئة التطبيق بنجاح');
  } catch (error) {
    console.error('خطأ في تهيئة التطبيق:', error);
  }
};