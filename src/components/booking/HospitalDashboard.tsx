import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Filter,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { Appointment, Patient, Doctor, BookingFilters } from '@/types/booking';
import { bookingService } from '@/services/bookingService';
import { toast } from 'sonner';

export function HospitalDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [filters, setFilters] = useState<BookingFilters>({
    status: [],
    dateFrom: new Date().toISOString().split('T')[0],
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // تحميل الحجوزات
      const appointmentsList = await bookingService.getFilteredAppointments(filters);
      setAppointments(appointmentsList);

      // تحميل بيانات المرضى
      const patientsList = await bookingService.getAllPatients();
      const patientsMap = patientsList.reduce((acc, patient) => {
        acc[patient.id] = patient;
        return acc;
      }, {} as Record<string, Patient>);
      setPatients(patientsMap);

      // تحميل بيانات الأطباء
      const doctorsList = await bookingService.getAllDoctors();
      const doctorsMap = doctorsList.reduce((acc, doctor) => {
        acc[doctor.id] = doctor;
        return acc;
      }, {} as Record<string, Doctor>);
      setDoctors(doctorsMap);

      // تحميل الإحصائيات
      const dashboardStats = await bookingService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('خطأ في تحميل بيانات اللوحة:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await bookingService.updateAppointmentStatus(appointmentId, newStatus);
      setAppointments(prev => 
        prev.map(app => app.id === appointmentId ? { ...app, status: newStatus } : app)
      );
      toast.success('تم تحديث حالة الموعد بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث حالة الموعد:', error);
      toast.error('حدث خطأ في تحديث حالة الموعد');
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const, icon: AlertCircle },
      confirmed: { label: 'مؤكد', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'مكتمل', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'ملغي', variant: 'destructive' as const, icon: XCircle },
      'no-show': { label: 'لم يحضر', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const patient = patients[appointment.patientId];
    const doctor = doctors[appointment.doctorId];
    
    return (
      patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.phone.includes(searchTerm) ||
      doctor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const todayAppointments = filteredAppointments.filter(
    app => app.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6 p-6">
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مواعيد اليوم</p>
                <p className="text-2xl font-bold">{stats.todayAppointments || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">في الانتظار</p>
                <p className="text-2xl font-bold">{stats.pendingAppointments || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المرضى</p>
                <p className="text-2xl font-bold">{stats.totalPatients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات</p>
                <p className="text-2xl font-bold">{stats.revenue || 0} ج.م</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والتصفية */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة المواعيد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث باسم المريض، رقم الهاتف، أو اسم الطبيب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  status: value === 'all' ? [] : [value as Appointment['status']]
                }));
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
                <SelectItem value="no-show">لم يحضر</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-48"
            />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">جميع المواعيد</TabsTrigger>
              <TabsTrigger value="today">مواعيد اليوم</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <AppointmentsList 
                appointments={filteredAppointments}
                patients={patients}
                doctors={doctors}
                onStatusUpdate={handleStatusUpdate}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="today" className="space-y-4">
              <AppointmentsList 
                appointments={todayAppointments}
                patients={patients}
                doctors={doctors}
                onStatusUpdate={handleStatusUpdate}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface AppointmentsListProps {
  appointments: Appointment[];
  patients: Record<string, Patient>;
  doctors: Record<string, Doctor>;
  onStatusUpdate: (id: string, status: Appointment['status']) => void;
  loading: boolean;
}

function AppointmentsList({ appointments, patients, doctors, onStatusUpdate, loading }: AppointmentsListProps) {
  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (appointments.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">لا توجد مواعيد</div>;
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const patient = patients[appointment.patientId];
        const doctor = doctors[appointment.doctorId];

        return (
          <Card key={appointment.id} className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{patient?.name || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{patient?.phone || 'غير محدد'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </div>
                  <span>د. {doctor?.name || 'غير محدد'}</span>
                  <span>{doctor?.specialization}</span>
                </div>

                {appointment.symptoms && (
                  <p className="text-sm text-muted-foreground">
                    الأعراض: {appointment.symptoms}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(appointment.status)}
                
                {appointment.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
                    >
                      تأكيد
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                    >
                      إلغاء
                    </Button>
                  </div>
                )}

                {appointment.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate(appointment.id, 'completed')}
                    >
                      مكتمل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusUpdate(appointment.id, 'no-show')}
                    >
                      لم يحضر
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  function getStatusBadge(status: Appointment['status']) {
    const statusConfig = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const, icon: AlertCircle },
      confirmed: { label: 'مؤكد', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'مكتمل', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'ملغي', variant: 'destructive' as const, icon: XCircle },
      'no-show': { label: 'لم يحضر', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  }
}