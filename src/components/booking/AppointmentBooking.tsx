import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, User, Stethoscope, CreditCard } from 'lucide-react';
import { Patient, Doctor, Specialization, TimeSlot, Appointment } from '@/types/booking';
import { bookingService } from '@/services/bookingService';
import { toast } from 'sonner';

interface AppointmentBookingProps {
  patient?: Patient;
  onAppointmentCreated?: (appointment: Appointment) => void;
  onCancel?: () => void;
}

export function AppointmentBooking({ patient, onAppointmentCreated, onCancel }: AppointmentBookingProps) {
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState({
    specialization: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation' as Appointment['type'],
    symptoms: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'insurance',
  });

  useEffect(() => {
    loadSpecializations();
  }, []);

  useEffect(() => {
    if (formData.specialization) {
      loadDoctorsBySpecialization(formData.specialization);
    }
  }, [formData.specialization]);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      loadAvailableSlots(formData.doctorId, formData.date);
    }
  }, [formData.doctorId, formData.date]);

  const loadSpecializations = async () => {
    try {
      const specs = await bookingService.getAllSpecializations();
      setSpecializations(specs.filter(s => s.isActive));
    } catch (error) {
      console.error('خطأ في تحميل التخصصات:', error);
    }
  };

  const loadDoctorsBySpecialization = async (specialization: string) => {
    try {
      const doctorsList = await bookingService.getDoctorsBySpecialization(specialization);
      setDoctors(doctorsList);
      setFormData(prev => ({ ...prev, doctorId: '', date: '', time: '' }));
      setAvailableSlots([]);
    } catch (error) {
      console.error('خطأ في تحميل الأطباء:', error);
    }
  };

  const loadAvailableSlots = async (doctorId: string, date: string) => {
    try {
      const slots = await bookingService.getAvailableSlots(doctorId, date);
      setAvailableSlots(slots);
      setFormData(prev => ({ ...prev, time: '' }));
      
      const doctor = doctors.find(d => d.id === doctorId);
      setSelectedDoctor(doctor || null);
    } catch (error) {
      console.error('خطأ في تحميل المواعيد المتاحة:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // حجز لمدة شهر مقدماً
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient) {
      toast.error('يرجى تحديد المريض أولاً');
      return;
    }

    if (!formData.doctorId || !formData.date || !formData.time) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId: patient.id,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        type: formData.type,
        symptoms: formData.symptoms || undefined,
        notes: formData.notes || undefined,
        estimatedDuration: 30, // 30 دقيقة افتراضياً
        consultationFee: selectedDoctor?.consultationFee || 0,
        isPaid: false,
        paymentMethod: formData.paymentMethod,
      };

      const newAppointment = await bookingService.createAppointment(appointmentData);
      toast.success('تم حجز الموعد بنجاح');
      onAppointmentCreated?.(newAppointment);
    } catch (error) {
      console.error('خطأ في حجز الموعد:', error);
      toast.error('حدث خطأ في حجز الموعد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          حجز موعد جديد
        </CardTitle>
        {patient && (
          <p className="text-sm text-muted-foreground">
            للمريض: {patient.name} - {patient.phone}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار التخصص */}
          <div className="space-y-2">
            <Label htmlFor="specialization">التخصص المطلوب *</Label>
            <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec.id} value={spec.name}>
                    <div className="flex items-center gap-2">
                      <span>{spec.icon}</span>
                      {spec.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* اختيار الطبيب */}
          {doctors.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="doctor">اختيار الطبيب *</Label>
              <Select value={formData.doctorId} onValueChange={(value) => handleInputChange('doctorId', value)}>
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
                          <span>{doctor.title}</span>
                          <span>•</span>
                          <span>{doctor.experience} سنة خبرة</span>
                          {doctor.workingDays.length > 0 && (
                            <>
                              <span>•</span>
                              <span>يعمل {doctor.workingDays.length} أيام/أسبوع</span>
                            </>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* اختيار التاريخ */}
          {formData.doctorId && (
            <div className="space-y-2">
              <Label htmlFor="date">تاريخ الموعد *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="pl-10"
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </div>
            </div>
          )}

          {/* اختيار الوقت */}
          {availableSlots.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="time">وقت الموعد *</Label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    type="button"
                    variant={formData.time === slot.startTime ? "default" : "outline"}
                    onClick={() => handleInputChange('time', slot.startTime)}
                    className="p-2 h-auto"
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.startTime}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* نوع الزيارة */}
          <div className="space-y-2">
            <Label htmlFor="type">نوع الزيارة</Label>
            <Select value={formData.type} onValueChange={(value: Appointment['type']) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الزيارة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">كشف أول</SelectItem>
                <SelectItem value="follow-up">متابعة</SelectItem>
                <SelectItem value="emergency">طارئ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* الأعراض */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">الأعراض أو سبب الزيارة</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              placeholder="اذكر الأعراض أو سبب الزيارة"
              rows={3}
            />
          </div>

          {/* ملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="أي ملاحظات إضافية"
              rows={2}
            />
          </div>

          {/* طريقة الدفع */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <Select value={formData.paymentMethod} onValueChange={(value: 'cash' | 'card' | 'insurance') => handleInputChange('paymentMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">نقداً</SelectItem>
                <SelectItem value="card">بطاقة ائتمانية</SelectItem>
                <SelectItem value="insurance">تأمين صحي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ملخص الطبيب والتكلفة */}
          {selectedDoctor && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    <span className="font-medium">الطبيب المختار:</span>
                  </div>
                  <span className="font-medium">{selectedDoctor.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">التخصص والخبرة:</span>
                  <span className="text-sm">{selectedDoctor.specialization} - {selectedDoctor.experience} سنة</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">إجمالي التكلفة:</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {selectedDoctor.consultationFee} ج.م
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* أزرار التحكم */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || !formData.time} className="flex-1">
              {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}