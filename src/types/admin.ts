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

export interface Schedule {
  id: string;
  offeringId: string;
  teacherId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "14:30" format
  endTime: string; // "15:30" format
  location: string;
  maxStudents?: number;
  recurringWeeks: number; // How many weeks this schedule repeats
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  offeringId: string;
  scheduleId?: string;
  enrollmentDate: Date;
  status: 'enrolled' | 'waitlist' | 'completed' | 'dropped';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  totalFees: number;
  paidAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}