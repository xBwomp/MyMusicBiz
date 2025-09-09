export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  userId: string; // Reference to User
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialties: string[]; // e.g., ['Piano', 'Guitar', 'Voice']
  bio?: string;
  hourlyRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  familyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  secondaryContactName?: string;
  secondaryContactEmail?: string;
  secondaryContactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  students: string[]; // Array of student IDs
  notes?: string;
  status?: string; // Family status (active, inactive)
  statusChangedAt?: Date;
  statusChangedBy?: string;
  statusChangeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  offeringId: string;
  enrollmentDate: Date;
  status: 'enrolled' | 'waitlist' | 'completed' | 'dropped';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  totalFees: number;
  paidAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}