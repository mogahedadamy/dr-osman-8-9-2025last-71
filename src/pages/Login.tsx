import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/shared/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserCheck, Crown, AlertCircle, Eye, EyeOff } from 'lucide-react';
const Login = () => {
  const navigate = useNavigate();
  const {
    login,
    isLoading
  } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(credentials);
      if (result.success && result.user) {
        // توجيه المستخدم حسب نوعه
        if (result.user.type === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: result.error || "تحقق من بيانات الدخول",
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
  const handleGuestAccess = () => {
    navigate('/');
  };
  const handleGetPremium = () => {
    navigate('/premium-access');
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="تسجيل الدخول" showBack />
      
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* Main Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
              <CardDescription>
                ادخل بياناتك للوصول إلى حسابك المدفوع
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input id="username" type="text" placeholder="ادخل اسم المستخدم" value={credentials.username} onChange={e => setCredentials(prev => ({
                  ...prev,
                  username: e.target.value
                }))} className="text-right" disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="ادخل كلمة المرور" value={credentials.password} onChange={e => setCredentials(prev => ({
                    ...prev,
                    password: e.target.value
                  }))} className="text-right pr-10" disabled={isSubmitting} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" disabled={isSubmitting || isLoading} size="lg">
                  {isSubmitting ? <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      جاري تسجيل الدخول...
                    </> : <>
                      <LogIn className="w-4 h-4 mr-2" />
                      دخول
                    </>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <div className="space-y-3">
            {/* Admin Account */}
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              
            </Card>

            {/* Premium User Account */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              
            </Card>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-3">
            <Separator className="my-4" />
            
            <Button onClick={handleGuestAccess} variant="outline" className="w-full" size="lg">
              <UserCheck className="w-4 h-4 mr-2" />
              تصفح كضيف (محتوى مجاني فقط)
            </Button>

            <Button onClick={handleGetPremium} variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300" size="lg">
              <Crown className="w-4 h-4 mr-2" />
              احصل على اشتراك مدفوع
            </Button>
          </div>

          {/* Support Info */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                هل تحتاج مساعدة؟
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                تواصل معنا عبر WhatsApp: +249903646148
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>;
};
export default Login;