import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shuffle, Copy, User, Lock, Phone, Mail, Crown, Calendar } from 'lucide-react';
import { PaymentRequest, User as UserType } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: Omit<UserType, 'id' | 'createdAt'>) => Promise<void>;
  paymentRequest: PaymentRequest | null;
}

const UserCreationModal = ({ isOpen, onClose, onCreateUser, paymentRequest }: UserCreationModalProps) => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    fullName: paymentRequest?.fullName || '',
    phoneNumber: paymentRequest?.phoneNumber || '',
    email: paymentRequest?.email || '',
    type: 'premium' as const,
    subscriptionExpiry: new Date(),
    isActive: true
  });

  const [isGeneratingCredentials, setIsGeneratingCredentials] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);

  // تحديد تاريخ انتهاء الاشتراك بناءً على نوع الاشتراك
  const updateSubscriptionExpiry = () => {
    const expiry = new Date();
    const days = paymentRequest?.subscriptionType === 'yearly' ? 365 : 30;
    expiry.setDate(expiry.getDate() + days);
    setUserData(prev => ({ ...prev, subscriptionExpiry: expiry }));
  };

  // توليد بيانات دخول عشوائية
  const generateCredentials = () => {
    setIsGeneratingCredentials(true);
    
    // توليد اسم مستخدم باستخدام اسم المستخدم + أرقام عشوائية
    const baseUsername = paymentRequest?.fullName
      ?.replace(/\s+/g, '')
      ?.toLowerCase()
      ?.replace(/[^\w]/g, '') || 'user';
    
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    const username = `${baseUsername}${randomNum}`;
    
    // توليد كلمة مرور قوية
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setUserData(prev => ({ ...prev, username, password }));
    
    setTimeout(() => {
      setIsGeneratingCredentials(false);
      toast({
        title: "تم توليد بيانات الدخول",
        description: "تم إنشاء اسم مستخدم وكلمة مرور قويين"
      });
    }, 1000);
  };

  // نسخ النص للحافظة
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: `تم نسخ ${label} للحافظة`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData.username || !userData.password) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    if (!userData.fullName.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب إدخال الاسم الكامل للمستخدم",
        variant: "destructive"
      });
      return;
    }

    try {
      // التأكد من أن الحساب مدفوع مع البيانات المحدثة
      const premiumUserData = {
        ...userData,
        type: 'premium' as const,
        fullName: userData.fullName.trim(),
        phoneNumber: userData.phoneNumber.trim(),
        email: userData.email.trim()
      };
      
      await onCreateUser(premiumUserData);
      onClose();
      
      toast({
        title: "تم إنشاء الحساب بنجاح ✅",
        description: `تم إنشاء حساب مدفوع للمستخدم ${userData.fullName} مع البيانات المحدثة وحفظها في الملف الشخصي تلقائياً`
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
    }
  };

  // تحديث تاريخ الانتهاء عند فتح الـ modal
  useState(() => {
    if (paymentRequest) {
      updateSubscriptionExpiry();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            إنشاء حساب مستخدم جديد
          </DialogTitle>
          <DialogDescription>
            إنشاء حساب مدفوع - يمكنك مراجعة وتعديل البيانات قبل الإنشاء
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* معلومات الطلب الأصلي */}
          <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-4 space-y-2">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 بيانات الطلب الأصلي</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">الاسم الأصلي:</span>
                  <p className="font-medium">{paymentRequest?.fullName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">الهاتف الأصلي:</span>
                  <p className="font-medium">{paymentRequest?.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">البريد الأصلي:</span>
                  <p className="font-medium">{paymentRequest?.email || 'غير محدد'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">رقم المعاملة:</span>
                  <p className="font-medium">{paymentRequest?.transactionNumber}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <span className="text-sm font-medium">نوع الاشتراك:</span>
                <Badge variant="secondary">
                  {paymentRequest?.subscriptionType === 'yearly' ? 'سنوي (365 يوم)' : 'شهري (30 يوم)'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">صالح حتى:</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {userData.subscriptionExpiry.toLocaleDateString('ar-EG')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* معلومات المستخدم الأساسية */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم الكامل
                <span className="text-xs text-muted-foreground">(يمكن التعديل)</span>
              </Label>
              <Input
                id="fullName"
                value={userData.fullName}
                onChange={(e) => setUserData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                placeholder="ادخل الاسم الكامل للمستخدم"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
                <span className="text-xs text-muted-foreground">(يمكن التعديل)</span>
              </Label>
              <Input
                id="phoneNumber"
                value={userData.phoneNumber}
                onChange={(e) => setUserData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="ادخل رقم الهاتف"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
                <span className="text-xs text-muted-foreground">(اختياري - يمكن التعديل)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ادخل البريد الإلكتروني (اختياري)"
                className="text-right"
              />
            </div>
          </div>

          {/* خيارات توليد بيانات الدخول */}
          <Card className="border-primary/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoGenerate" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  توليد بيانات الدخول تلقائياً
                </Label>
                <Switch
                  id="autoGenerate"
                  checked={autoGenerate}
                  onCheckedChange={setAutoGenerate}
                />
              </div>

              {autoGenerate && (
                <Button
                  type="button"
                  onClick={generateCredentials}
                  disabled={isGeneratingCredentials}
                  variant="outline"
                  className="w-full"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {isGeneratingCredentials ? 'جاري التوليد...' : 'توليد بيانات جديدة'}
                </Button>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      value={userData.username}
                      onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={autoGenerate}
                      className={autoGenerate ? "bg-muted" : ""}
                    />
                    {userData.username && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(userData.username, 'اسم المستخدم')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      value={userData.password}
                      onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={autoGenerate}
                      className={autoGenerate ? "bg-muted" : ""}
                    />
                    {userData.password && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(userData.password, 'كلمة المرور')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* نوع الحساب */}
          <div className="space-y-2">
            <Label htmlFor="userType" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              نوع الحساب
            </Label>
            <Select 
              value={userData.type} 
              onValueChange={(value: any) => setUserData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">مشترك مدفوع</SelectItem>
                <SelectItem value="free">مجاني</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            إنشاء الحساب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationModal;