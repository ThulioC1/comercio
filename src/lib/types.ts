import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'system-admin' | 'business-owner' | 'client';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  businessIds?: string[]; // For business owners or staff
}

export interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  address: string;
  phone: string;
  businessType: string;
  timeZone: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
  };
  ownerId: string;
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
  isActive: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  staffIds: string[]; // IDs of staff who can perform this service
}

export interface StaffMember {
  id: string;
  businessId: string;
  userId: string;
  name: string;
  services: string[]; // Service IDs
}

export interface Schedule {
  id: string; // e.g., 'monday', 'tuesday'
  businessId: string;
  isOpen: boolean;
  openTime: string; // e.g., '09:00'
  closeTime: string; // e.g., '18:00'
  breakTimes?: { start: string; end: string }[];
}

export interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  serviceId: string;
  staffId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}
