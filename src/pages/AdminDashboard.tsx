import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useUsers } from '@/hooks/useAuth';
import { usePaymentRequests, sendCredentialsToUser } from '@/hooks/usePaymentRequests';
import { toast } from '@/hooks/use-toast';
import { PaymentRequest, User } from '@/types/auth';
import { Doctor, Specialization, Appointment, Patient } from '@/types/booking';
import { bookingService } from '@/services/bookingService';
import { HospitalDashboard } from '@/components/booking/HospitalDashboard';
import { SimpleContentManager } from '@/components/cms/SimpleContentManager';
import MobileLayout from '@/components/layout/MobileLayout';
import UserCreationModal from '@/components/admin/UserCreationModal';
import { 
  Shield,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  LogOut,
  Crown,
  DollarSign,
  Clock,
  Calendar,
  UserCheck,
  Stethoscope,
  Building2,
  Plus,
  Settings,
  BarChart3,
  Activity,
  FileText,
  BookOpen
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout, createUser, generateCredentials } = useAuth();
  const { users, getUserStats } = useUsers();
  const { requests, updateRequestStatus, getRequestStats, getPendingRequests } = usePaymentRequests();
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingStats, setBookingStats] = useState<any>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  
  // User creation modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);

  // New doctor form state
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    title: 'دكتور' as const,
    experience: 0,
    consultationFee: 0,
    workingDays: [] as string[],
    phone: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      const [stats, doctorsList, specsList] = await Promise.all([
        bookingService.getDashboardStats(),
        bookingService.getAllDoctors(),
        bookingService.getAllSpecializations()
      ]);
      
      setBookingStats(stats);
      setDoctors(doctorsList);
      setSpecializations(specsList);
    } catch (error) {
      console.error('خطأ في تحميل بيانات النظام:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setShowUserModal(true);
  };

  const handleCreateUserAccount = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!selectedRequest) return;
    
    setIsProcessing(selectedRequest.id);
    try {
      // إنشاء المستخدم
      await createUser(userData);
      
      // تحديث حالة الطلب
      await updateRequestStatus(selectedRequest.id, 'approved', 'تم إنشاء الحساب بنجاح');
      
      // إرسال بيانات الدخول للمستخدم
      await sendCredentialsToUser(
        { username: userData.username, password: userData.password },
        selectedRequest.phoneNumber,
        selectedRequest.fullName
      );
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم إنشاء الحساب وإرسال بيانات الدخول للمستخدم",
      });
      
      setShowUserModal(false);
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "فشل في إنشاء الحساب. حاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doctorData = {
        ...newDoctor,
        isActive: true,
        availableSlots: [], // سيتم إضافة المواعيد لاحقاً
      };
      
      await bookingService.saveDoctor(doctorData);
      setNewDoctor({
        name: '',
        specialization: '',
        title: 'دكتور',
        experience: 0,
        consultationFee: 0,
        workingDays: [],
        phone: '',
        email: '',
        bio: '',
      });
      await loadBookingData();
      toast({
        title: "تم إضافة الطبيب بنجاح",
        description: "تم إضافة الطبيب الجديد إلى النظام",
      });
    } catch (error) {
      toast({
        title: "خطأ في إضافة الطبيب",
        description: "حدث خطأ أثناء إضافة الطبيب",
        variant: "destructive"
      });
    }
  };

  const userStats = getUserStats();
  const paymentStats = getRequestStats();
  const pendingRequests = getPendingRequests();

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen bg-background">
        {/* Header - محسن للهاتف */}
        <div className="border-b bg-card shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">لوحة تحكم المدير</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">مرحباً {currentUser?.fullName}</p>
                </div>
              </div>
              <Button onClick={() => { logout(); navigate('/login'); }} variant="outline" size="sm" className="self-end sm:self-auto">
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل خروج
              </Button>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* تحسين التنقل للهاتف */}
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-1 h-auto p-1 bg-muted/50 min-w-max">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4" />
                <span>نظرة عامة</span>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>إدارة المحتوى</span>
              </TabsTrigger>
              <TabsTrigger 
                value="medical" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <Activity className="w-4 h-4" />
                <span>النظام الطبي</span>
              </TabsTrigger>
              <TabsTrigger 
                value="doctors" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <Stethoscope className="w-4 h-4" />
                <span>الأطباء</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap relative"
              >
                <Users className="w-4 h-4" />
                <span>المستخدمين</span>
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <Settings className="w-4 h-4" />
                <span>الإعدادات</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* نظرة عامة - محسنة للهاتف */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* إحصائيات طبية */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                الإحصائيات الطبية
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{bookingStats.todayAppointments || 0}</p>
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">مواعيد اليوم</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">{bookingStats.totalPatients || 0}</p>
                        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">إجمالي المرضى</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-orange-700 dark:text-orange-300">{bookingStats.pendingAppointments || 0}</p>
                        <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">مواعيد معلقة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300">{bookingStats.revenue || 0}</p>
                        <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">إيرادات (ج.م)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* إحصائيات التطبيق */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                إحصائيات التطبيق
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-cyan-700 dark:text-cyan-300">{userStats.total}</p>
                        <p className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400">مستخدمين</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{userStats.premium}</p>
                        <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">مشتركين</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-teal-700 dark:text-teal-300">{doctors.length}</p>
                        <p className="text-xs sm:text-sm text-teal-600 dark:text-teal-400">أطباء</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300">{specializations.length}</p>
                        <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">تخصصات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* إدارة المحتوى */}
          <TabsContent value="content" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  إدارة محتوى التطبيق
                </CardTitle>
                <CardDescription>
                  إدارة المقالات والفيديوهات والنصائح والموسوعة الطبية
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <SimpleContentManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* النظام الطبي */}
          <TabsContent value="medical" className="space-y-6">
            <HospitalDashboard />
          </TabsContent>

          {/* إدارة الأطباء - محسنة للهاتف */}
          <TabsContent value="doctors" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* إضافة طبيب جديد */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    إضافة طبيب جديد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddDoctor} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctorName" className="text-sm">اسم الطبيب</Label>
                      <Input
                        id="doctorName"
                        value={newDoctor.name}
                        onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-sm">التخصص</Label>
                      <Select value={newDoctor.specialization} onValueChange={(value) => setNewDoctor(prev => ({ ...prev, specialization: value }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="اختر التخصص" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec.id} value={spec.name}>
                              {spec.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm">اللقب</Label>
                        <Select value={newDoctor.title} onValueChange={(value: any) => setNewDoctor(prev => ({ ...prev, title: value }))}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="دكتور">دكتور</SelectItem>
                            <SelectItem value="استشاري">استشاري</SelectItem>
                            <SelectItem value="أستاذ دكتور">أستاذ دكتور</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experience" className="text-sm">سنوات الخبرة</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={newDoctor.experience}
                          onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                          required
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee" className="text-sm">أجر الكشف (ج.م)</Label>
                      <Input
                        id="consultationFee"
                        type="number"
                        value={newDoctor.consultationFee}
                        onChange={(e) => setNewDoctor(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                        required
                        className="h-9"
                      />
                    </div>

                    <Button type="submit" className="w-full h-9">
                      إضافة الطبيب
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* قائمة الأطباء */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span>الأطباء المسجلون ({doctors.length})</span>
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] sm:max-h-96 overflow-y-auto">
                    {doctors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>لا يوجد أطباء مسجلون</p>
                      </div>
                    ) : (
                      doctors.map((doctor) => (
                        <Card key={doctor.id} className="p-3 sm:p-4 bg-muted/30">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm sm:text-base">{doctor.title} {doctor.name}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">{doctor.specialization}</p>
                              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {doctor.experience} سنة خبرة
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {doctor.consultationFee} ج.م
                                </span>
                              </div>
                            </div>
                            <Badge variant={doctor.isActive ? "default" : "secondary"} className="text-xs">
                              {doctor.isActive ? "نشط" : "معطل"}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* إدارة المستخدمين */}
          <TabsContent value="users" className="space-y-6">
            {/* طلبات الاشتراك المعلقة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>طلبات الاشتراك المعلقة</span>
                  <Badge variant="secondary">{getPendingRequests().length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getPendingRequests().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد طلبات معلقة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getPendingRequests().map((request) => (
                      <Card key={request.id} className="border-2 border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-yellow-800 dark:text-yellow-200">{request.fullName}</h4>
                              <div className="space-y-1 mt-2">
                                <p className="text-sm text-muted-foreground">📱 الهاتف: {request.phoneNumber}</p>
                                <p className="text-sm text-muted-foreground">📧 البريد: {request.email || 'غير محدد'}</p>
                                <p className="text-sm text-muted-foreground">🧾 رقم المعاملة: {request.transactionNumber}</p>
                                <p className="text-sm text-muted-foreground">📅 تاريخ التقديم: {new Date(request.submittedAt).toLocaleDateString('ar-SA')}</p>
                                <Badge variant={request.subscriptionType === 'yearly' ? 'default' : 'secondary'}>
                                  {request.subscriptionType === 'yearly' ? 'اشتراك سنوي' : 'اشتراك شهري'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                onClick={() => handleApproveRequest(request)}
                                disabled={isProcessing === request.id}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {isProcessing === request.id ? 'جاري المعالجة...' : 'موافقة وإنشاء حساب'}
                              </Button>
                              <Button
                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                رفض
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* قائمة جميع المستخدمين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>جميع المستخدمين</span>
                  <Badge variant="secondary">{users.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا يوجد مستخدمون مسجلون</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {users.map((user) => (
                      <Card key={user.id} className={`p-4 ${
                        user.type === 'admin' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' :
                        user.type === 'premium' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' :
                        'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{user.fullName}</h4>
                              <Badge variant={
                                user.type === 'admin' ? 'destructive' :
                                user.type === 'premium' ? 'default' :
                                'secondary'
                              }>
                                {user.type === 'admin' ? '👑 مدير' :
                                 user.type === 'premium' ? '💎 مدفوع' :
                                 user.type === 'free' ? '🆓 مجاني' : '👤 ضيف'}
                              </Badge>
                              <Badge variant={user.isActive ? 'outline' : 'secondary'}>
                                {user.isActive ? '✅ نشط' : '❌ معطل'}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">👤 اسم المستخدم: {user.username}</p>
                              <p className="text-sm text-muted-foreground">📱 الهاتف: {user.phoneNumber || 'غير محدد'}</p>
                              <p className="text-sm text-muted-foreground">📧 البريد: {user.email || 'غير محدد'}</p>
                              <p className="text-sm text-muted-foreground">📅 تاريخ التسجيل: {new Date(user.createdAt).toLocaleDateString('ar-SA')}</p>
                              {user.subscriptionExpiry && (
                                <p className="text-sm text-muted-foreground">⏰ انتهاء الاشتراك: {new Date(user.subscriptionExpiry).toLocaleDateString('ar-SA')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* الإعدادات */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النظام</CardTitle>
                <CardDescription>
                  إعدادات عامة للنظام وقاعدة البيانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={loadBookingData} variant="outline">
                  إعادة تحميل البيانات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Creation Modal */}
      <UserCreationModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedRequest(null);
        }}
        onCreateUser={handleCreateUserAccount}
        paymentRequest={selectedRequest}
      />
    </div>
    </MobileLayout>
  );
};

export default AdminDashboard;