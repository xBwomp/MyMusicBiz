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
  maxStudents?: number;
  currentEnrollment?: number;
  instructor?: string;
  location?: string;
  schedule?: string; // e.g., "Mondays 3:00-4:00 PM"
  ageRange?: string;
  prerequisites?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  dateOfBirth?: Date;
  enrolledOfferings: string[]; // Array of offering IDs
  createdAt: Date;
  updatedAt: Date;
}