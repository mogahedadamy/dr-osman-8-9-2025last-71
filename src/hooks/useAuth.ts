import { useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, AuthResponse, UserCredentials } from '@/types/auth';
import { localDB } from '@/lib/localDatabase';

// Simple notification function without using useToast
const showToast = (title: string, description?: string, variant?: 'default' | 'destructive') => {
  console.log(`${variant === 'destructive' ? '❌' : '✅'} ${title}${description ? ': ' + description : ''}`);
};

// Hook للمصادقة وإدارة المستخدمين
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // تحميل المستخدم الحالي من التخزين المحلي
  const loadCurrentUser = useCallback(async () => {
    try {
      const savedUser = await localDB.get<User>('currentUser', 'active');
      if (savedUser && savedUser.isActive) {
        // التحقق من انتهاء الاشتراك للمستخدمين المدفوعين
        if (savedUser.type === 'premium' && savedUser.subscriptionExpiry) {
          const now = new Date();
          const expiry = new Date(savedUser.subscriptionExpiry);
          if (now > expiry) {
            // انتهى الاشتراك - تحويل إلى مستخدم مجاني
            const updatedUser = { ...savedUser, type: 'free' as const };
            await localDB.save('currentUser', { ...updatedUser, id: 'active' });
            setCurrentUser(updatedUser);
            showToast("انتهى اشتراكك", "تم تحويلك إلى الحساب المجاني. يمكنك تجديد اشتراكك في أي وقت.", "destructive");
          } else {
            setCurrentUser(savedUser);
          }
        } else {
          setCurrentUser(savedUser);
        }
        setIsAuthenticated(true);
      } else {
        // إنشاء مستخدم ضيف افتراضي
        const guestUser: User = {
          id: 'guest',
          username: 'guest',
          password: '',
          fullName: 'مستخدم ضيف',
          type: 'guest',
          createdAt: new Date(),
          isActive: true
        };
        setCurrentUser(guestUser);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('خطأ في تحميل المستخدم:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تسجيل الدخول
  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // التأكد من تهيئة قاعدة البيانات
      await localDB.init();
      
      // البحث عن المستخدم في قاعدة البيانات
      const users = await localDB.getAll<User>('users');
      const user = users.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password &&
        u.isActive
      );

      if (!user) {
        return {
          success: false,
          error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        };
      }

      // التحقق من انتهاء الاشتراك
      if (user.type === 'premium' && user.subscriptionExpiry) {
        const now = new Date();
        const expiry = new Date(user.subscriptionExpiry);
        if (now > expiry) {
          user.type = 'free';
          await localDB.update('users', user.id, { type: 'free' });
        }
      }

      // حفظ المستخدم الحالي
      await localDB.save('currentUser', { ...user, id: 'active' });
      setCurrentUser(user);
      setIsAuthenticated(true);

      showToast("مرحباً بك!", `أهلاً وسهلاً ${user.fullName}`);

      return {
        success: true,
        user
      };

    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء تسجيل الدخول'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // تسجيل دخول المدير بكلمة مرور فقط
  const adminLogin = async (password: string): Promise<AuthResponse> => {
    const ADMIN_PASSWORD = '0906346';
    
    if (password !== ADMIN_PASSWORD) {
      return {
        success: false,
        error: 'كلمة مرور المدير غير صحيحة'
      };
    }

    try {
      // إنشاء مستخدم مدير مؤقت
      const adminUser: User = {
        id: 'temp-admin',
        username: 'admin',
        password: ADMIN_PASSWORD,
        fullName: 'المدير العام',
        type: 'admin',
        createdAt: new Date(),
        isActive: true,
        email: 'admin@drosman.com'
      };

      // حفظ المستخدم الحالي
      await localDB.save('currentUser', { ...adminUser, id: 'active' });
      setCurrentUser(adminUser);
      setIsAuthenticated(true);

      return {
        success: true,
        user: adminUser
      };

    } catch (error) {
      console.error('خطأ في تسجيل دخول المدير:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء تسجيل الدخول'
      };
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      await localDB.delete('currentUser', 'active');
      
      // إنشاء مستخدم ضيف افتراضي
      const guestUser: User = {
        id: 'guest',
        username: 'guest',
        password: '',
        fullName: 'مستخدم ضيف',
        type: 'guest',
        createdAt: new Date(),
        isActive: true
      };
      
      setCurrentUser(guestUser);
      setIsAuthenticated(false);

      showToast("تم تسجيل الخروج", "نراك قريباً!");

    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  // إنشاء مستخدم جديد (للمدير)
  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date(),
        // التأكد من أن الحساب مدفوع افتراضياً عند الإنشاء من لوحة التحكم
        type: userData.type || 'premium'
      };

      await localDB.save('users', newUser);
      
      // حفظ البيانات في الملف الشخصي للمستخدم الجديد
      const profileData = {
        name: newUser.fullName,
        email: newUser.email || '',
        phone: newUser.phoneNumber || '',
        userId: newUser.id,
        createdAt: new Date().toISOString(),
        isPremium: newUser.type === 'premium' || newUser.type === 'admin'
      };
      
      await localDB.save('userProfiles', { ...profileData, id: newUser.id });
      
      console.log('تم إنشاء المستخدم وحفظ ملفه الشخصي:', newUser.fullName);
      
      return newUser;

    } catch (error) {
      console.error('خطأ في إنشاء المستخدم:', error);
      throw error;
    }
  };

  // توليد بيانات دخول عشوائية
  const generateCredentials = (): UserCredentials => {
    const adjectives = ['سريع', 'ذكي', 'قوي', 'نشيط', 'متميز'];
    const nouns = ['طبيب', 'مساعد', 'خبير', 'محترف', 'استشاري'];
    const numbers = Math.floor(Math.random() * 1000);
    
    const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;
    const password = Math.random().toString(36).slice(-8);

    return { username, password };
  };

  // التحقق من صلاحية الوصول للمحتوى
  const canAccessContent = (contentAccessLevel: 'free' | 'premium'): boolean => {
    if (!currentUser) return contentAccessLevel === 'free';
    
    if (currentUser.type === 'admin') return true;
    if (contentAccessLevel === 'free') return true;
    if (currentUser.type === 'premium') return true;
    
    return false;
  };

  // التحقق من صلاحية الإدارة
  const isAdmin = (): boolean => {
    return currentUser?.type === 'admin' || false;
  };

  // التحقق من اشتراك مدفوع
  const isPremium = (): boolean => {
    return currentUser?.type === 'premium' || false;
  };

  // الحصول على أيام باقية في الاشتراك
  const getDaysLeft = (): number | null => {
    if (!currentUser || currentUser.type !== 'premium' || !currentUser.subscriptionExpiry) {
      return null;
    }

    const now = new Date();
    const expiry = new Date(currentUser.subscriptionExpiry);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    login,
    adminLogin,
    logout,
    createUser,
    generateCredentials,
    canAccessContent,
    isAdmin,
    isPremium,
    getDaysLeft,
    reloadUser: loadCurrentUser,
    // إضافة دالة لتحديث الملف الشخصي
    updateUserProfile: async (profileData: any) => {
      if (!currentUser) return;
      
      // حفظ محلي للجميع
      await localDB.save('userProfiles', { ...profileData, id: currentUser.id });
      
      // للمستخدمين المدفوعين، يمكن إضافة حفظ في قاعدة البيانات هنا مستقبلاً
      if (currentUser.type === 'premium' || currentUser.type === 'admin') {
        console.log('حفظ بيانات المستخدم المدفوع في قاعدة البيانات:', profileData);
        // هنا يمكن إضافة كود للحفظ في Supabase مستقبلاً
      }
    }
  };
};

// Hook للمستخدمين (للمدير)
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const allUsers = await localDB.getAll<User>('users');
      setUsers(allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await localDB.update('users', userId, updates);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await localDB.delete('users', userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
    }
  };

  const getUserStats = () => {
    const total = users.length;
    const premium = users.filter(u => u.type === 'premium').length;
    const free = users.filter(u => u.type === 'free').length;
    const admins = users.filter(u => u.type === 'admin').length;
    const active = users.filter(u => u.isActive).length;

    return { total, premium, free, admins, active };
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    updateUser,
    deleteUser,
    getUserStats,
    reloadUsers: loadUsers
  };
};