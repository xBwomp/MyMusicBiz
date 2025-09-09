export interface Program {
  id: string;
  name: string;
  description: string;
  category: 'private-lessons' | 'homeschool' | 'band' | 'other';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offering {
  id: string;
  programId: string; // Reference to Program
  className: string;
  term: string; // e.g., "Fall 2024", "Spring 2025"
  teacherId: string; // Reference to Teacher
  registrationFee: number;
  materialsFee: number;
  instructionalFee: number;
  startDate: Date;
  stopDate: Date;
  daysOfWeek: number[]; // Array of day numbers (0=Sunday, 1=Monday, etc.)
  startTime: string; // "14:30" format
  endTime: string; // "15:30" format
  deliveryMethod: 'onsite' | 'virtual';
  maxStudents: number;
  currentEnrollment?: number;
  location?: string; // Physical location when on site
  ageRange?: string;
  prerequisites?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  familyId?: string; // Reference to Family
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  grade?: string;
  instrument?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  enrolledOfferings: string[]; // Array of offering IDs
  notes?: string;
  isActive: boolean;
  status?: string; // Student status (active, inactive, graduated, etc.)
  statusChangedAt?: Date;
  statusChangedBy?: string;
  statusChangeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}