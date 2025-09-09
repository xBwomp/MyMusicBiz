import { 
  collection, 
  doc, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Program, Offering, Student } from '../types/program';

// Program Services
export const programService = {
  // Get all programs
  async getPrograms(): Promise<Program[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'programs'), orderBy('name'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Program[];
  },

  // Get active programs
  async getActivePrograms(): Promise<Program[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'programs'), 
        where('isActive', '==', true),
        orderBy('name')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Program[];
  },

  // Create program
  async createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'programs'), {
      ...program,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Update program
  async updateProgram(id: string, updates: Partial<Program>): Promise<void> {
    const docRef = doc(db, 'programs', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete program
  async deleteProgram(id: string): Promise<void> {
    await deleteDoc(doc(db, 'programs', id));
  },
};

// Offering Services
export const offeringService = {
  // Get all offerings
  async getOfferings(): Promise<Offering[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'offerings'), orderBy('startDate', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      stopDate: doc.data().stopDate?.toDate(),
      daysOfWeek: doc.data().daysOfWeek || [],
      deliveryMethod: doc.data().deliveryMethod ?? 'onsite',
      teacherId: doc.data().teacherId ?? '',
      startTime: doc.data().startTime ?? '09:00',
      endTime: doc.data().endTime ?? '10:00',
      maxStudents: doc.data().maxStudents ?? 10,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Offering[];
  },

  // Get offerings by program
  async getOfferingsByProgram(programId: string): Promise<Offering[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'offerings'),
        where('programId', '==', programId),
        orderBy('startDate', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      stopDate: doc.data().stopDate?.toDate(),
      daysOfWeek: doc.data().daysOfWeek || [],
      deliveryMethod: doc.data().deliveryMethod ?? 'onsite',
      teacherId: doc.data().teacherId ?? '',
      startTime: doc.data().startTime ?? '09:00',
      endTime: doc.data().endTime ?? '10:00',
      maxStudents: doc.data().maxStudents ?? 10,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Offering[];
  },

  // Get active offerings
  async getActiveOfferings(): Promise<Offering[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'offerings'),
        where('isActive', '==', true),
        orderBy('startDate')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      stopDate: doc.data().stopDate?.toDate(),
      daysOfWeek: doc.data().daysOfWeek || [],
      deliveryMethod: doc.data().deliveryMethod ?? 'onsite',
      teacherId: doc.data().teacherId ?? '',
      startTime: doc.data().startTime ?? '09:00',
      endTime: doc.data().endTime ?? '10:00',
      maxStudents: doc.data().maxStudents ?? 10,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Offering[];
  },

  // Create offering
  async createOffering(offering: Omit<Offering, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'offerings'), {
      ...offering,
      startDate: Timestamp.fromDate(offering.startDate),
      stopDate: Timestamp.fromDate(offering.stopDate),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Update offering
  async updateOffering(id: string, updates: Partial<Offering>): Promise<void> {
    const docRef = doc(db, 'offerings', id);
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.stopDate) {
      updateData.stopDate = Timestamp.fromDate(updates.stopDate);
    }

    await updateDoc(docRef, updateData);
  },

  // Delete offering
  async deleteOffering(id: string): Promise<void> {
    await deleteDoc(doc(db, 'offerings', id));
  },
};

// Student Services
export const studentService = {
  // Get all students
  async getStudents(): Promise<Student[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'students'), orderBy('lastName'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateOfBirth: doc.data().dateOfBirth?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Student[];
  },

  // Create student
  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'students'), {
      ...student,
      dateOfBirth: student.dateOfBirth ? Timestamp.fromDate(student.dateOfBirth) : null,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Update student
  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    const docRef = doc(db, 'students', id);
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.dateOfBirth) {
      updateData.dateOfBirth = Timestamp.fromDate(updates.dateOfBirth);
    }
    
    await updateDoc(docRef, updateData);
  },
};