// خدمة إدارة الحجوزات المحلية
import { Patient, Doctor, Appointment, Specialization, HospitalSettings, TimeSlot, BookingFilters } from '@/types/booking';
import { localDB } from '@/lib/localDatabase';

class BookingService {
  // إدارة المرضى
  async savePatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: `patient_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await localDB.save('patients', newPatient);
    return newPatient;
  }

  async getPatient(id: string): Promise<Patient | null> {
    return await localDB.get<Patient>('patients', id);
  }

  async getAllPatients(): Promise<Patient[]> {
    return await localDB.getAll<Patient>('patients');
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<void> {
    await localDB.update('patients', id, { ...updates, updatedAt: new Date().toISOString() });
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const patients = await this.getAllPatients();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone.includes(query) ||
      patient.email?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // إدارة الأطباء
  async saveDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const newDoctor: Doctor = {
      ...doctor,
      id: `doctor_${Date.now()}`,
    };
    
    await localDB.save('doctors', newDoctor);
    return newDoctor;
  }

  async getDoctor(id: string): Promise<Doctor | null> {
    return await localDB.get<Doctor>('doctors', id);
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return await localDB.getAll<Doctor>('doctors');
  }

  async getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    const doctors = await this.getAllDoctors();
    return doctors.filter(doctor => doctor.specialization === specialization && doctor.isActive);
  }

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<void> {
    await localDB.update('doctors', id, updates);
  }

  // إدارة التخصصات
  async saveSpecialization(specialization: Omit<Specialization, 'id'>): Promise<Specialization> {
    const newSpec: Specialization = {
      ...specialization,
      id: `spec_${Date.now()}`,
    };
    
    await localDB.save('specializations', newSpec);
    return newSpec;
  }

  async getAllSpecializations(): Promise<Specialization[]> {
    return await localDB.getAll<Specialization>('specializations');
  }

  // إدارة الحجوزات
  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: `appointment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await localDB.save('appointments', newAppointment);
    
    // تحديث توفر الموعد
    await this.updateTimeSlotAvailability(appointment.doctorId, appointment.date, appointment.time, false);
    
    return newAppointment;
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    return await localDB.get<Appointment>('appointments', id);
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await localDB.getAll<Appointment>('appointments');
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const appointments = await this.getAllAppointments();
    return appointments.filter(app => app.patientId === patientId)
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const appointments = await this.getAllAppointments();
    return appointments.filter(app => app.doctorId === doctorId)
      .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
  }

  async updateAppointmentStatus(id: string, status: Appointment['status'], notes?: string): Promise<void> {
    const updates: Partial<Appointment> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (notes) updates.notes = notes;
    if (status === 'cancelled') {
      updates.cancelledAt = new Date().toISOString();
      
      // إعادة توفر الموعد
      const appointment = await this.getAppointment(id);
      if (appointment) {
        await this.updateTimeSlotAvailability(appointment.doctorId, appointment.date, appointment.time, true);
      }
    }

    await localDB.update('appointments', id, updates);
  }

  async getFilteredAppointments(filters: BookingFilters): Promise<Appointment[]> {
    let appointments = await this.getAllAppointments();

    if (filters.status?.length) {
      appointments = appointments.filter(app => filters.status!.includes(app.status));
    }

    if (filters.doctorId) {
      appointments = appointments.filter(app => app.doctorId === filters.doctorId);
    }

    if (filters.dateFrom) {
      appointments = appointments.filter(app => app.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      appointments = appointments.filter(app => app.date <= filters.dateTo!);
    }

    if (filters.type) {
      appointments = appointments.filter(app => app.type === filters.type);
    }

    if (filters.patientName) {
      const patients = await this.getAllPatients();
      const matchingPatients = patients.filter(p => 
        p.name.toLowerCase().includes(filters.patientName!.toLowerCase())
      );
      const patientIds = matchingPatients.map(p => p.id);
      appointments = appointments.filter(app => patientIds.includes(app.patientId));
    }

    return appointments.sort((a, b) => 
      new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
    );
  }

  // إدارة المواعيد المتاحة
  async updateTimeSlotAvailability(doctorId: string, date: string, time: string, isAvailable: boolean): Promise<void> {
    const doctor = await this.getDoctor(doctorId);
    if (!doctor) return;

    const updatedSlots = doctor.availableSlots.map(slot => {
      if (slot.date === date && slot.startTime === time) {
        return { ...slot, isAvailable };
      }
      return slot;
    });

    await this.updateDoctor(doctorId, { availableSlots: updatedSlots });
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const doctor = await this.getDoctor(doctorId);
    if (!doctor) return [];

    return doctor.availableSlots.filter(slot => 
      slot.date === date && slot.isAvailable
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // إحصائيات
  async getDashboardStats(): Promise<any> {
    const appointments = await this.getAllAppointments();
    const patients = await this.getAllPatients();
    const today = new Date().toISOString().split('T')[0];

    const todayAppointments = appointments.filter(app => app.date === today);
    const pendingCount = appointments.filter(app => app.status === 'pending').length;
    const completedCount = appointments.filter(app => app.status === 'completed').length;
    const cancelledCount = appointments.filter(app => app.status === 'cancelled').length;
    const noShowCount = appointments.filter(app => app.status === 'no-show').length;

    const thisMonth = new Date().toISOString().substring(0, 7);
    const newPatientsThisMonth = patients.filter(p => 
      p.createdAt.substring(0, 7) === thisMonth
    ).length;

    const revenue = appointments
      .filter(app => app.status === 'completed' && app.isPaid)
      .reduce((sum, app) => sum + app.consultationFee, 0);

    return {
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingCount,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,
      noShowAppointments: noShowCount,
      totalPatients: patients.length,
      newPatients: newPatientsThisMonth,
      revenue,
    };
  }

  // تهيئة البيانات التجريبية
  async initializeSampleData(): Promise<void> {
    const existingSpecs = await this.getAllSpecializations();
    if (existingSpecs.length > 0) return; // البيانات موجودة بالفعل

    // إضافة التخصصات
    const specializations = [
      { name: 'النساء والتوليد', nameEn: 'Obstetrics & Gynecology', color: '#ec4899', icon: '👶', isActive: true },
      { name: 'الباطنة', nameEn: 'Internal Medicine', color: '#3b82f6', icon: '🩺', isActive: true },
      { name: 'الأطفال', nameEn: 'Pediatrics', color: '#10b981', icon: '🧸', isActive: true },
      { name: 'العظام', nameEn: 'Orthopedics', color: '#f59e0b', icon: '🦴', isActive: true },
      { name: 'القلب', nameEn: 'Cardiology', color: '#ef4444', icon: '❤️', isActive: true },
    ];

    for (const spec of specializations) {
      await this.saveSpecialization(spec);
    }

    // إضافة أطباء تجريبيين
    const today = new Date();
    const generateTimeSlots = (date: string) => {
      const slots: TimeSlot[] = [];
      const times = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00'];
      
      times.forEach((time, index) => {
        slots.push({
          id: `slot_${date}_${time}`,
          startTime: time,
          endTime: `${parseInt(time.split(':')[0]) + 1}:00`,
          isAvailable: true,
          date,
        });
      });
      
      return slots;
    };

    const doctors = [
      {
        name: 'د. سارة أحمد',
        specialization: 'النساء والتوليد',
        title: 'استشاري',
        experience: 12,
        consultationFee: 200,
        workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
        isActive: true,
        availableSlots: generateTimeSlots(today.toISOString().split('T')[0]),
      },
      {
        name: 'د. محمد حسن',
        specialization: 'الباطنة',
        title: 'أستاذ دكتور',
        experience: 20,
        consultationFee: 300,
        workingDays: ['sunday', 'tuesday', 'thursday'],
        isActive: true,
        availableSlots: generateTimeSlots(today.toISOString().split('T')[0]),
      },
      {
        name: 'د. فاطمة علي',
        specialization: 'الأطفال',
        title: 'استشاري',
        experience: 8,
        consultationFee: 180,
        workingDays: ['sunday', 'monday', 'wednesday', 'thursday'],
        isActive: true,
        availableSlots: generateTimeSlots(today.toISOString().split('T')[0]),
      },
      {
        name: 'د. أحمد محمود',
        specialization: 'العظام',
        title: 'أستاذ مساعد',
        experience: 15,
        consultationFee: 250,
        workingDays: ['sunday', 'tuesday', 'wednesday', 'thursday'],
        isActive: true,
        availableSlots: generateTimeSlots(today.toISOString().split('T')[0]),
      },
      {
        name: 'د. ليلى إبراهيم',
        specialization: 'القلب',
        title: 'استشاري',
        experience: 18,
        consultationFee: 350,
        workingDays: ['sunday', 'monday', 'tuesday', 'thursday'],
        isActive: true,
        availableSlots: generateTimeSlots(today.toISOString().split('T')[0]),
      },
      {
        name: 'د. عمر سالم',
        specialization: 'النساء والتوليد',
        title: 'دكتور',
        experience: 6,
        consultationFee: 150,
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        isActive: true,
        availableSlots: generateTimeSlots(today.toISOString().split('T')[0]),
      },
    ];

    for (const doctor of doctors) {
      await this.saveDoctor(doctor);
    }
  }
}

export const bookingService = new BookingService();