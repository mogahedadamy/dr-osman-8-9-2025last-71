import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useReminders } from '@/hooks/useReminders';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/bookingService';
import { Doctor } from '@/types/booking';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  Plus,
  Stethoscope,
  Heart,
  Baby
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AppointmentForm {
  title: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: Date | undefined;
  time: string;
  location: string;
  phoneNumber: string;
  notes: string;
  appointmentType: 'checkup' | 'ultrasound' | 'test' | 'consultation';
}

const appointmentTypes = {
  checkup: { label: 'فحص دوري', icon: Stethoscope, color: 'bg-primary' },
  ultrasound: { label: 'أشعة تلفزيونية', icon: Baby, color: 'bg-secondary' },
  test: { label: 'تحاليل طبية', icon: Heart, color: 'bg-success' },
  consultation: { label: 'استشارة طبية', icon: User, color: 'bg-warning' }
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

interface AppointmentSchedulerProps {
  openDialog?: boolean;
  onDialogChange?: (open: boolean) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ 
  openDialog = false, 
  onDialogChange 
}) => {
  const { reminders, addReminder } = useReminders();
  const { scheduleAppointment } = useAdvancedNotifications();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(openDialog);

  // Sync with external control
  useEffect(() => {
    setIsDialogOpen(openDialog);
  }, [openDialog]);

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    onDialogChange?.(open);
  };
  const [formData, setFormData] = useState<AppointmentForm>({
    title: '',
    doctorId: '',
    doctorName: '',
    specialty: '',
    date: undefined,
    time: '',
    location: '',
    phoneNumber: '',
    notes: '',
    appointmentType: 'checkup'
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // الحصول على المواعيد الطبية فقط
  const appointments = reminders.filter(r => r.type === 'appointment' || r.type === 'medical');

  // تحميل الأطباء عند فتح الحوار
  useEffect(() => {
    if (isDialogOpen) {
      loadDoctors();
    }
  }, [isDialogOpen]);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const doctorsList = await bookingService.getAllDoctors();
      setDoctors(doctorsList.filter(doctor => doctor.isActive));
    } catch (error) {
      console.error('خطأ في تحميل الأطباء:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل قائمة الأطباء",
        variant: "destructive"
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  // عند اختيار طبيب، ملء البيانات تلقائياً
  const handleDoctorSelect = (doctorId: string) => {
    const selectedDoctor = doctors.find(d => d.id === doctorId);
    if (selectedDoctor) {
      updateFormData('doctorId', doctorId);
      updateFormData('doctorName', selectedDoctor.name);
      updateFormData('specialty', selectedDoctor.specialization);
      // يمكن إضافة معلومات أخرى مثل رقم الهاتف والموقع إذا كانت متوفرة
      if (selectedDoctor.phone) {
        updateFormData('phoneNumber', selectedDoctor.phone);
      }
    }
  };

  // إضافة موعد جديد
  const handleAddAppointment = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال العنوان والتاريخ والوقت على الأقل",
        variant: "destructive"
      });
      return;
    }

    if (!formData.doctorId) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار طبيب من القائمة",
        variant: "destructive"
      });
      return;
    }

    try {
      const appointmentId = Date.now();
      const dateString = format(formData.date, 'yyyy-MM-dd');
      
      // إنشاء التذكير للتقويم
      const newReminder = {
        id: appointmentId,
        title: formData.title,
        time: formData.time,
        date: dateString,
        type: 'appointment' as const,
        enabled: true,
        completed: false,
        description: formData.notes,
        // معلومات إضافية للمواعيد الطبية
        doctorName: formData.doctorName,
        specialty: formData.specialty,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        appointmentType: formData.appointmentType
      };

      // حفظ التذكير
      await addReminder(newReminder);

      // إضافة الموعد إلى نظام الحجوزات الطبية
      try {
        // البحث عن مريض بنفس الاسم أو إنشاء مريض جديد
        let patientId = '';
        const existingPatients = await bookingService.getAllPatients();
        
        // محاولة العثور على مريض بنفس الاسم (إذا كان مذكور في العنوان)
        const patientNameMatch = formData.title.match(/للمريض[ة]?\s*:?\s*(.+?)(?:\s|$)/);
        const patientName = patientNameMatch ? patientNameMatch[1].trim() : `مريض - ${formData.title}`;
        
        let existingPatient = existingPatients.find(p => 
          p.name.toLowerCase().includes(patientName.toLowerCase()) ||
          patientName.toLowerCase().includes(p.name.toLowerCase())
        );

        if (!existingPatient) {
          // إنشاء مريض جديد للموعد
          const newPatient = await bookingService.savePatient({
            name: patientName,
            phone: formData.phoneNumber || 'غير محدد',
            dateOfBirth: '1990-01-01', // تاريخ افتراضي
            gender: 'male' as const, // جنس افتراضي
            email: undefined,
            nationalId: undefined,
            address: formData.location || undefined,
            emergencyContact: undefined,
            medicalHistory: undefined,
            allergies: undefined,
            currentMedications: undefined,
          });
          patientId = newPatient.id;
        } else {
          patientId = existingPatient.id;
        }

        // الحصول على معلومات الطبيب
        const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
        
        // إنشاء الموعد في نظام الحجوزات
        const appointmentData = {
          patientId: patientId,
          doctorId: formData.doctorId,
          date: dateString,
          time: formData.time,
          status: 'confirmed' as const, // المواعيد من التقويم تعتبر مؤكدة
          type: formData.appointmentType === 'consultation' ? 'consultation' as const : 'consultation' as const,
          symptoms: formData.notes || undefined,
          notes: `موعد مضاف من التقويم - ${formData.title}`,
          estimatedDuration: 30,
          consultationFee: selectedDoctor?.consultationFee || 0,
          isPaid: false,
          paymentMethod: 'cash' as const,
        };

        await bookingService.createAppointment(appointmentData);
        
        toast({
          title: "تم إضافة الموعد ✅",
          description: `تم حفظ الموعد في التقويم ونظام الحجوزات الطبية`
        });

      } catch (bookingError) {
        console.error('خطأ في إضافة الموعد لنظام الحجوزات:', bookingError);
        // الموعد سيبقى في التقويم حتى لو فشل في نظام الحجوزات
        toast({
          title: "تم حفظ الموعد جزئياً",
          description: "تم حفظ الموعد في التقويم، لكن لم يتم إضافته لنظام الحجوزات",
          variant: "destructive"
        });
      }

      // جدولة الإشعارات
      await scheduleAppointment({
        id: appointmentId,
        title: formData.title,
        doctorName: formData.doctorName,
        location: formData.location,
        date: dateString,
        time: formData.time
      });

      // إعادة تعيين النموذج
      setFormData({
        title: '',
        doctorId: '',
        doctorName: '',
        specialty: '',
        date: undefined,
        time: '',
        location: '',
        phoneNumber: '',
        notes: '',
        appointmentType: 'checkup'
      });

      setIsDialogOpen(false);
      onDialogChange?.(false);

    } catch (error) {
      console.error('خطأ في إضافة الموعد:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الموعد",
        variant: "destructive"
      });
    }
  };

  // تحديث بيانات النموذج
  const updateFormData = (field: keyof AppointmentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          المواعيد الطبية
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إضافة موعد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة موعد طبي جديد</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4" role="form" aria-describedby="appointment-form-description">
              <p id="appointment-form-description" className="sr-only">
                نموذج لإضافة موعد طبي جديد مع تفاصيل الطبيب والوقت والمكان
              </p>
              {/* نوع الموعد */}
              <div>
                <Label>نوع الموعد</Label>
                <Select 
                  value={formData.appointmentType} 
                  onValueChange={(value) => updateFormData('appointmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(appointmentTypes).map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* عنوان الموعد */}
              <div>
                <Label htmlFor="title">عنوان الموعد *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="مثال: فحص شهري للمريضة: سارة أحمد"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يمكنك إضافة اسم المريض في العنوان (مثال: للمريض: أحمد محمد)
                </p>
              </div>

              {/* اختيار الطبيب */}
              <div>
                <Label>اختيار الطبيب *</Label>
                {loadingDoctors ? (
                  <div className="p-3 text-center text-muted-foreground">
                    جاري تحميل الأطباء...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground">
                    لا توجد أطباء مسجلين في النظام
                  </div>
                ) : (
                  <Select 
                    value={formData.doctorId} 
                    onValueChange={handleDoctorSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطبيب من القائمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex flex-col items-start w-full">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{doctor.name}</span>
                              <span className="text-sm font-bold text-primary">{doctor.consultationFee} ج.م</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{doctor.specialization}</span>
                              <span>•</span>
                              <span>{doctor.title}</span>
                              <span>•</span>
                              <span>{doctor.experience} سنة خبرة</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* عرض التخصص (للقراءة فقط عند اختيار طبيب) */}
              {formData.specialty && (
                <div>
                  <Label>التخصص</Label>
                  <Input
                    value={formData.specialty}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              )}

              {/* التاريخ */}
              <div>
                <Label>تاريخ الموعد *</Label>
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => updateFormData('date', date)}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border p-3 pointer-events-auto"
                />
              </div>

              {/* الوقت */}
              <div>
                <Label>وقت الموعد *</Label>
                <Select 
                  value={formData.time} 
                  onValueChange={(value) => updateFormData('time', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوقت" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* الموقع */}
              <div>
                <Label htmlFor="location">موقع العيادة</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="عيادة النخبة - الدور الثالث"
                />
              </div>

              {/* رقم الهاتف */}
              <div>
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                  placeholder="01xxxxxxxxx"
                />
              </div>

              {/* ملاحظات */}
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>

              <Button onClick={handleAddAppointment} className="w-full">
                حفظ الموعد
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* قائمة المواعيد */}
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                لا توجد مواعيد مجدولة
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                قم بإضافة موعدك الطبي الأول لتتبع مواعيدك بسهولة
              </p>
            </CardContent>
          </Card>
        ) : (
          appointments.map(appointment => {
            const appointmentType = appointmentTypes[appointment.appointmentType as keyof typeof appointmentTypes];
            const Icon = appointmentType?.icon || CalendarIcon;
            
            return (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${appointmentType?.color || 'bg-primary'}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{appointment.title}</h3>
                        <Badge variant="secondary">
                          {appointmentType?.label || 'موعد طبي'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ar })}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {appointment.time}
                        </div>
                        
                        {appointment.doctorName && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {appointment.doctorName}
                          </div>
                        )}
                        
                        {appointment.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {appointment.location}
                          </div>
                        )}
                        
                        {appointment.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {appointment.phoneNumber}
                          </div>
                        )}
                      </div>
                      
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};