import { useState, useEffect } from 'react';
import { PaymentRequest } from '@/types/auth';
import { localDB } from '@/lib/localDatabase';
import { toast } from '@/hooks/use-toast';

// Hook لإدارة طلبات الدفع
export const usePaymentRequests = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const allRequests = await localDB.getAll<PaymentRequest>('paymentRequests');
      setRequests(allRequests.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ));
    } catch (error) {
      console.error('خطأ في تحميل طلبات الدفع:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitPaymentRequest = async (requestData: Omit<PaymentRequest, 'id' | 'submittedAt' | 'status'>): Promise<PaymentRequest> => {
    try {
      const newRequest: PaymentRequest = {
        ...requestData,
        id: Date.now().toString(),
        submittedAt: new Date(),
        status: 'pending'
      };

      await localDB.save('paymentRequests', newRequest);
      setRequests(prev => [newRequest, ...prev]);

      // إرسال إلى WhatsApp
      await sendToWhatsApp(newRequest);

      toast({
        title: "تم إرسال طلب الاشتراك",
        description: "سيتم مراجعة طلبك خلال 24 ساعة وإرسال بيانات الدخول عبر WhatsApp",
      });

      return newRequest;

    } catch (error) {
      console.error('خطأ في إرسال طلب الدفع:', error);
      throw error;
    }
  };

  const updateRequestStatus = async (
    requestId: string, 
    status: 'approved' | 'rejected', 
    notes?: string
  ) => {
    try {
      const updates = {
        status,
        reviewedAt: new Date(),
        reviewedBy: 'admin', // يمكن تحديثها لاحقاً
        notes
      };

      await localDB.update('paymentRequests', requestId, updates);
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, ...updates } : req
      ));

      toast({
        title: status === 'approved' ? "تم قبول الطلب" : "تم رفض الطلب",
        description: status === 'approved' 
          ? "سيتم إنشاء حساب المستخدم وإرسال بيانات الدخول"
          : "تم رفض طلب الاشتراك",
      });

    } catch (error) {
      console.error('خطأ في تحديث حالة الطلب:', error);
      throw error;
    }
  };

  const getRequestStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    // حساب الإيرادات التقديرية (بناءً على الطلبات المقبولة)
    const monthlyRevenue = approved * 50; // 50 ريال لكل اشتراك شهري
    
    return { total, pending, approved, rejected, monthlyRevenue };
  };

  const getPendingRequests = () => {
    return requests.filter(r => r.status === 'pending');
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return {
    requests,
    loading,
    submitPaymentRequest,
    updateRequestStatus,
    getRequestStats,
    getPendingRequests,
    reloadRequests: loadRequests
  };
};

// دالة إرسال البيانات إلى WhatsApp
const sendToWhatsApp = async (request: PaymentRequest) => {
  try {
    const message = `🔔 طلب اشتراك جديد - Dr. Osman Premium

👤 الاسم: ${request.fullName}
📱 الهاتف: ${request.phoneNumber}
📧 البريد: ${request.email || 'غير محدد'}
🧾 رقم المعاملة: ${request.transactionNumber}
💳 نوع الاشتراك: ${request.subscriptionType === 'monthly' ? 'شهري (50 ريال)' : 'سنوي (500 ريال)'}
⏰ تاريخ الإرسال: ${new Date(request.submittedAt).toLocaleString('ar-SA')}

📸 تم رفع صورة إثبات الدفع
🆔 رقم الطلب: ${request.id}

يرجى مراجعة الطلب والرد في أقرب وقت ممكن.`;

    // إنشاء رابط WhatsApp
    const phoneNumber = '249903646148'; // رقم المدير
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // فتح WhatsApp في نافذة جديدة
    window.open(whatsappUrl, '_blank');

    console.log('تم إرسال الطلب إلى WhatsApp بنجاح');

  } catch (error) {
    console.error('خطأ في إرسال الطلب إلى WhatsApp:', error);
    // لا نرمي خطأ هنا لأن حفظ الطلب نجح، فقط الإرسال فشل
  }
};

// دالة إرسال بيانات الدخول للمستخدم الجديد
export const sendCredentialsToUser = async (
  credentials: { username: string; password: string }, 
  phoneNumber: string,
  fullName: string
) => {
  try {
    const message = `🎉 مرحباً بك في Dr. Osman Premium!

تم قبول طلب اشتراكك بنجاح ✅

📱 بيانات الدخول الخاصة بك:
👤 اسم المستخدم: ${credentials.username}
🔐 كلمة المرور: ${credentials.password}

🔗 رابط التطبيق: ${window.location.origin}

💡 نصائح مهمة:
• احتفظ ببيانات الدخول في مكان آمن
• يمكنك تغيير كلمة المرور من الإعدادات
• استمتع بالمحتوى الحصري المتاح لك

شكراً لثقتك بنا! 🌟
فريق Dr. Osman`;

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    console.log('تم إرسال بيانات الدخول للمستخدم بنجاح');

  } catch (error) {
    console.error('خطأ في إرسال بيانات الدخول:', error);
  }
};