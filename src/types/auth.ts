// أنواع البيانات للمصادقة ونظام المستخدمين

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  type: 'guest' | 'free' | 'premium' | 'admin';
  subscriptionExpiry?: Date;
  createdAt: Date;
  isActive: boolean;
  phoneNumber?: string;
  email?: string;
}

export interface PaymentRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  transactionNumber: string;
  receiptImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  subscriptionType: 'monthly' | 'yearly';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number; // بالأيام
  features: string[];
  isPopular?: boolean;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}