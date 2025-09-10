import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientRegistration } from '@/components/booking/PatientRegistration';
import { AppointmentBooking } from '@/components/booking/AppointmentBooking';
import { HospitalDashboard } from '@/components/booking/HospitalDashboard';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Calendar, Settings } from 'lucide-react';
import { Patient, Appointment } from '@/types/booking';
import { bookingService } from '@/services/bookingService';
import { toast } from 'sonner';

export default function BookingSystem() {
  const [activeTab, setActiveTab] = useState('patient-search');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // تهيئة البيانات التجريبية عند التحميل الأول
    initializeApp();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPatients();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const initializeApp = async () => {
    try {
      await bookingService.initializeSampleData();
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
    }
  };

  const searchPatients = async () => {
    setIsSearching(true);
    try {
      const results = await bookingService.searchPatients(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      toast.error('حدث خطأ في البحث');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientCreated = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('book-appointment');
    toast.success('تم تسجيل المريض بنجاح، يمكنك الآن حجز موعد');
  };

  const handlePatientSelected = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('book-appointment');
  };

  const handleAppointmentCreated = (appointment: Appointment) => {
    setActiveTab('dashboard');
    setSelectedPatient(null);
    toast.success('تم حجز الموعد بنجاح');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              نظام إدارة الحجوزات الطبية
            </CardTitle>
            <p className="text-center text-muted-foreground">
              نظام شامل لإدارة حجوزات المرضى ومواعيد العيادة
            </p>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patient-search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              البحث عن مريض
            </TabsTrigger>
            <TabsTrigger value="register-patient" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              مريض جديد
            </TabsTrigger>
            <TabsTrigger value="book-appointment" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              حجز موعد
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              لوحة التحكم
            </TabsTrigger>
          </TabsList>

          {/* البحث عن مريض */}
          <TabsContent value="patient-search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>البحث عن مريض موجود</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="ابحث باسم المريض أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {isSearching && (
                  <div className="text-center py-4">جاري البحث...</div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">نتائج البحث:</h3>
                    {searchResults.map((patient) => (
                      <Card 
                        key={patient.id} 
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handlePatientSelected(patient)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.phone}</p>
                            <p className="text-xs text-muted-foreground">
                              {patient.gender === 'male' ? 'ذكر' : 'أنثى'} - {patient.dateOfBirth}
                            </p>
                          </div>
                          <Button size="sm">اختيار</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>لم يتم العثور على مرضى بهذا الاسم أو رقم الهاتف</p>
                    <p className="text-sm mt-2">يمكنك تسجيل مريض جديد إذا لم يكن مسجل من قبل</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab('register-patient')}
                    >
                      تسجيل مريض جديد
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تسجيل مريض جديد */}
          <TabsContent value="register-patient">
            <PatientRegistration 
              onPatientCreated={handlePatientCreated}
              onCancel={() => setActiveTab('patient-search')}
            />
          </TabsContent>

          {/* حجز موعد */}
          <TabsContent value="book-appointment">
            {selectedPatient ? (
              <AppointmentBooking 
                patient={selectedPatient}
                onAppointmentCreated={handleAppointmentCreated}
                onCancel={() => {
                  setSelectedPatient(null);
                  setActiveTab('patient-search');
                }}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    يرجى اختيار مريض أولاً لحجز موعد
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setActiveTab('patient-search')}>
                      البحث عن مريض
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('register-patient')}>
                      تسجيل مريض جديد
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* لوحة التحكم */}
          <TabsContent value="dashboard">
            <HospitalDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}