// أنواع البيانات لنظام الحجوزات

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationalId?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  title: string; // دكتور، استشاري، أستاذ دكتور
  experience: number; // سنوات الخبرة
  consultationFee: number;
  availableSlots: TimeSlot[];
  workingDays: string[]; // أيام العمل
  phone?: string;
  email?: string;
  bio?: string;
  image?: string;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string;
  isAvailable: boolean;
  date: string; // YYYY-MM-DD format
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  symptoms?: string;
  referralFrom?: string;
  estimatedDuration: number; // دقائق
  consultationFee: number;
  isPaid: boolean;
  paymentMethod?: 'cash' | 'card' | 'insurance';
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface Specialization {
  id: string;
  name: string;
  nameEn: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface HospitalSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  workingHours: {
    [day: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  emergencyAvailable: boolean;
  insuranceAccepted: string[];
  paymentMethods: string[];
  bookingSettings: {
    maxAdvanceBookingDays: number;
    cancellationHours: number;
    confirmationRequired: boolean;
    depositRequired: boolean;
    depositAmount?: number;
  };
}

export interface BookingStats {
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalPatients: number;
  newPatients: number;
  revenue: number;
}

export interface BookingFilters {
  status?: Appointment['status'][];
  doctorId?: string;
  specialization?: string;
  dateFrom?: string;
  dateTo?: string;
  patientName?: string;
  type?: Appointment['type'];
}