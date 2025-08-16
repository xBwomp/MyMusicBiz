import { 
  collection, 
  doc, 
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Teacher, Family, Schedule, Enrollment } from '../types/admin';

// User Services
export const userService = {
  async getUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), orderBy('displayName'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as User[];
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('email', '==', email))
    );
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as User;
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    console.log('Creating user in Firestore:', user);
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: now,
      updatedAt: now,
    });
    console.log('User created with document ID:', docRef.id);
    return docRef.id;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },
};

// Teacher Services
export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'teachers'), orderBy('lastName'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Teacher[];
  },

  async getActiveTeachers(): Promise<Teacher[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'teachers'), 
        where('isActive', '==', true),
        orderBy('lastName')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Teacher[];
  },

  async createTeacher(teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'teachers'), {
      ...teacher,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
    const docRef = doc(db, 'teachers', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },
};

// Family Services
export const familyService = {
  async getFamilies(): Promise<Family[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'families'), orderBy('familyName'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Family[];
  },

  async createFamily(family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'families'), {
      ...family,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async updateFamily(id: string, updates: Partial<Family>): Promise<void> {
    const docRef = doc(db, 'families', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },
};

// Schedule Services
export const scheduleService = {
  async getSchedules(): Promise<Schedule[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'schedules'), orderBy('startDate'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Schedule[];
  },

  async getSchedulesByOffering(offeringId: string): Promise<Schedule[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'schedules'),
        where('offeringId', '==', offeringId),
        orderBy('dayOfWeek')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Schedule[];
  },

  async createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'schedules'), {
      ...schedule,
      startDate: Timestamp.fromDate(schedule.startDate),
      endDate: Timestamp.fromDate(schedule.endDate),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<void> {
    const docRef = doc(db, 'schedules', id);
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }
    
    await updateDoc(docRef, updateData);
  },
};

// Enrollment Services
export const enrollmentService = {
  async getEnrollments(): Promise<Enrollment[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'enrollments'), orderBy('enrollmentDate', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      enrollmentDate: doc.data().enrollmentDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Enrollment[];
  },

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        orderBy('enrollmentDate', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      enrollmentDate: doc.data().enrollmentDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Enrollment[];
  },

  async createEnrollment(enrollment: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'enrollments'), {
      ...enrollment,
      enrollmentDate: Timestamp.fromDate(enrollment.enrollmentDate),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<void> {
    const docRef = doc(db, 'enrollments', id);
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.enrollmentDate) {
      updateData.enrollmentDate = Timestamp.fromDate(updates.enrollmentDate);
    }
    
    await updateDoc(docRef, updateData);
  },
};