import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, isLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال كلمة مرور المدير",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await adminLogin(password);
      
      if (result.success) {
        navigate('/admin');
        toast({
          title: "مرحباً بك في لوحة التحكم",
          description: "تم تسجيل دخولك كمدير بنجاح"
        });
      } else {
        toast({
          title: "كلمة مرور خاطئة",
          description: "تأكد من كلمة مرور المدير وحاول مرة أخرى",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ غير متوقع. حاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="دخول المدير" showBack />
      
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* Admin Login Card */}
          <Card className="shadow-xl border-0 border-red-200 dark:border-red-800">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-300">
                دخول المدير
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                ادخل كلمة مرور المدير للوصول إلى لوحة التحكم
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-red-700 dark:text-red-300">
                    <Lock className="w-4 h-4 inline mr-2" />
                    كلمة مرور المدير
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="ادخل كلمة مرور المدير"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-right pr-10 border-red-200 focus:border-red-400 dark:border-red-700"
                      disabled={isSubmitting}
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-red-500 hover:text-red-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  disabled={isSubmitting || isLoading}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      دخول لوحة التحكم
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
                <Shield className="w-5 h-5 text-red-500" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  منطقة آمنة
                </p>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                هذه منطقة محمية خاصة بإدارة النظام
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                يُمنع الوصول غير المصرح به
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;