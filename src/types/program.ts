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
  registrationFee: number;
  materialsFee: number;
  instructionalFee: number;
  startDate: Date;
  stopDate: Date;
  classDates: Date[]; // Individual class meeting dates
  isRecurring: boolean; // Indicates if the schedule repeats
  deliveryMethod: 'onsite' | 'virtual';
  maxStudents?: number;
  currentEnrollment?: number;
  instructor: string;
  location?: string; // Physical location when on site
  schedule?: string; // Legacy text description of schedule
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