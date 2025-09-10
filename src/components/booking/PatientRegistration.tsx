import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, User, Mail, Calendar, MapPin, UserPlus } from 'lucide-react';
import { Patient } from '@/types/booking';
import { bookingService } from '@/services/bookingService';
import { toast } from 'sonner';

interface PatientRegistrationProps {
  onPatientCreated?: (patient: Patient) => void;
  onCancel?: () => void;
}

export function PatientRegistration({ onPatientCreated, onCancel }: PatientRegistrationProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | '',
    nationalId: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.dateOfBirth || !formData.gender) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    // التحقق من عدم وجود المريض مسبقاً
    const existingPatients = await bookingService.searchPatients(formData.phone);
    if (existingPatients.length > 0) {
      toast.error('مريض بهذا الرقم موجود بالفعل، يرجى البحث عنه في قائمة المرضى');
      return;
    }

    setLoading(true);
    try {
      const patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationalId: formData.nationalId || undefined,
        address: formData.address || undefined,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        } : undefined,
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(h => h.trim()) : undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : undefined,
        currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map(m => m.trim()) : undefined,
      };

      const newPatient = await bookingService.savePatient(patientData);
      toast.success('تم تسجيل المريض بنجاح');
      onPatientCreated?.(newPatient);
    } catch (error) {
      console.error('خطأ في تسجيل المريض:', error);
      toast.error('حدث خطأ في تسجيل المريض');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          تسجيل مريض جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* البيانات الأساسية */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">البيانات الأساسية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    placeholder="ادخل الاسم الكامل"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">تاريخ الميلاد *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">الجنس *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalId">الرقم القومي</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  placeholder="14 رقم"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="pl-10"
                  placeholder="ادخل العنوان كاملاً"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* بيانات الاتصال في حالات الطوارئ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">جهة الاتصال في حالات الطوارئ</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">الاسم</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  placeholder="اسم جهة الاتصال"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">رقم الهاتف</Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">صلة القرابة</Label>
                <Input
                  id="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                  placeholder="زوج، أب، أم، أخ، الخ"
                />
              </div>
            </div>
          </div>

          {/* التاريخ الطبي */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">التاريخ الطبي</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">التاريخ المرضي</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  placeholder="اذكر الأمراض السابقة مفصولة بفاصلة (اختياري)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">الحساسية</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="اذكر أنواع الحساسية مفصولة بفاصلة (اختياري)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">الأدوية الحالية</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                  placeholder="اذكر الأدوية التي يتناولها حالياً مفصولة بفاصلة (اختياري)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'جاري التسجيل...' : 'تسجيل المريض'}
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