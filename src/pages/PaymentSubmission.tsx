import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import { usePaymentRequests } from '@/hooks/usePaymentRequests';
import { toast } from '@/hooks/use-toast';
import { SubscriptionPlan, PaymentRequest } from '@/types/auth';
import { 
  Upload, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  User,
  DollarSign
} from 'lucide-react';

const PaymentSubmission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitPaymentRequest } = usePaymentRequests();
  
  const selectedPlan = location.state?.selectedPlan as SubscriptionPlan;
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    transactionNumber: '',
    notes: ''
  });
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "نوع ملف غير صحيح",
          description: "يرجى رفع صورة فقط (JPG, PNG, إلخ)",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير",
          description: "يرجى رفع صورة أصغر من 5 ميجابايت",
          variant: "destructive"
        });
        return;
      }
      
      setReceiptFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phoneNumber || !formData.transactionNumber || !receiptFile) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة ورفع صورة الإيصال",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        const requestData: Omit<PaymentRequest, 'id' | 'submittedAt' | 'status'> = {
          ...formData,
          receiptImage: base64Image,
          subscriptionType: selectedPlan?.id === 'yearly' ? 'yearly' : 'monthly'
        };
        
        await submitPaymentRequest(requestData);
        setIsSuccess(true);
      };
      
      reader.readAsDataURL(receiptFile);
      
    } catch (error) {
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الطلب. حاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setIsSuccess(false);
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      transactionNumber: '',
      notes: ''
    });
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <PageHeader title="تم إرسال الطلب" showBack />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                
                <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
                  تم إرسال طلب الاشتراك بنجاح! 🎉
                </h1>
                
                <div className="space-y-4 text-right">
                  <p className="text-muted-foreground">
                    شكراً لك! تم إرسال طلب اشتراكك وإثبات الدفع بنجاح.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">الخطوات التالية:</h3>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li>✅ سيتم مراجعة طلبك خلال 24 ساعة</li>
                      <li>📱 ستصلك بيانات الدخول عبر WhatsApp</li>
                      <li>🎯 يمكنك البدء باستخدام النظام فور الموافقة</li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      onClick={() => navigate('/')}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      العودة للصفحة الرئيسية
                    </Button>
                    <Button
                      onClick={handleNewRequest}
                      variant="outline"
                      className="flex-1"
                    >
                      إرسال طلب آخر
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="إرسال إثبات الدفع" showBack />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {selectedPlan && (
            <Card className="mb-6 border-primary shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>خطة الاشتراك المختارة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan.duration === 30 ? 'كل شهر' : 'كل سنة'}
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span className="text-2xl font-bold text-primary">{selectedPlan.price}</span>
                      <span className="text-muted-foreground">{selectedPlan.currency}</span>
                    </div>
                    {selectedPlan.isPopular && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
                        الأكثر شعبية
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse text-blue-700 dark:text-blue-300">
                <CreditCard className="w-5 h-5" />
                <span>تفاصيل التحويل</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">رقم الحساب:</p>
                  <p className="font-mono text-lg font-semibold">3691314</p>
                </div>
                <div>
                  <p className="text-muted-foreground">اسم صاحب الحساب:</p>
                  <p className="font-semibold">مجاهد ادم يعقوب يحى</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">البنك:</p>
                  <p className="font-semibold">بنك الخرطوم – فرع الحصاحيصا</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Upload className="w-5 h-5 text-primary" />
                <span>بيانات إثبات الدفع</span>
              </CardTitle>
              <CardDescription>
                املأ البيانات التالية وارفق صورة إثبات الدفع
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center space-x-1 space-x-reverse">
                      <User className="w-4 h-4" />
                      <span>الاسم الكامل *</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="ادخل اسمك الكامل"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fullName: e.target.value
                      }))}
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center space-x-1 space-x-reverse">
                      <Phone className="w-4 h-4" />
                      <span>رقم الهاتف *</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+249xxxxxxxxx"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        phoneNumber: e.target.value
                      }))}
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-1 space-x-reverse">
                    <Mail className="w-4 h-4" />
                    <span>البريد الإلكتروني (اختياري)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionNumber" className="flex items-center space-x-1 space-x-reverse">
                    <FileText className="w-4 h-4" />
                    <span>رقم المعاملة *</span>
                  </Label>
                  <Input
                    id="transactionNumber"
                    type="text"
                    placeholder="رقم المعاملة من إيصال التحويل"
                    value={formData.transactionNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      transactionNumber: e.target.value
                    }))}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptFile" className="flex items-center space-x-1 space-x-reverse">
                    <Upload className="w-4 h-4" />
                    <span>صورة إثبات الدفع *</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-primary transition-colors">
                    <input
                      id="receiptFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="receiptFile"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium">انقر لرفع صورة الإيصال</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG حتى 5MB</p>
                      </div>
                    </label>
                  </div>

                  {receiptPreview && (
                    <div className="mt-4">
                      <img
                        src={receiptPreview}
                        alt="معاينة الإيصال"
                        className="max-w-full h-48 object-contain rounded-lg border"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        ملف مرفوع: {receiptFile?.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    placeholder="أي ملاحظات أو معلومات إضافية..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    className="text-right"
                    rows={3}
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-semibold mb-1">تأكد من صحة البيانات</p>
                      <p>تأكد من إدخال جميع البيانات بشكل صحيح. سيتم التواصل معك عبر رقم الهاتف المدخل.</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      إرسال طلب الاشتراك
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default PaymentSubmission;