import { 
  collection, 
  doc, 
  updateDoc, 
  addDoc, 
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  StudentStatus, 
  FamilyStatus, 
  StatusHistoryEntry, 
  StatusChangeRequest,
  StatusValidationResult,
  StatusPermissions,
  StatusChangeImpact,
  STATUS_TRANSITION_RULES
} from '../types/status';
import { User } from '../types/admin';

export class StatusService {
  /**
   * Change student status with validation and history tracking
   */
  async changeStudentStatus(
    studentId: string,
    newStatus: StudentStatus,
    reason: string,
    changedBy: string,
    currentStatus?: StudentStatus
  ): Promise<void> {
    try {
      // Validate the status change
      if (currentStatus) {
        const validation = this.validateStudentStatusChange(currentStatus, newStatus);
        if (!validation.isValid) {
          throw new Error(validation.errorMessage || 'Invalid status change');
        }
      }

      // Update student record
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        status: newStatus,
        statusChangedAt: Timestamp.now(),
        statusChangedBy: changedBy,
        statusChangeReason: reason,
        updatedAt: Timestamp.now()
      });

      // Log status change history
      await this.logStatusChange({
        entityType: 'student',
        entityId: studentId,
        oldStatus: currentStatus || null,
        newStatus,
        changedBy,
        changeReason: reason,
        changedAt: new Date()
      });

      // Execute business logic based on status change
      await this.executeStudentStatusBusinessLogic(studentId, newStatus, currentStatus);

    } catch (error) {
      console.error('Error changing student status:', error);
      throw error;
    }
  }

  /**
   * Change family status with impact assessment
   */
  async changeFamilyStatus(
    familyId: string,
    newStatus: FamilyStatus,
    reason: string,
    changedBy: string,
    currentStatus?: FamilyStatus
  ): Promise<StatusChangeImpact> {
    try {
      // Assess impact before making changes
      const impact = await this.assessFamilyStatusChangeImpact(familyId, newStatus);

      // Update family record
      const familyRef = doc(db, 'families', familyId);
      await updateDoc(familyRef, {
        status: newStatus,
        statusChangedAt: Timestamp.now(),
        statusChangedBy: changedBy,
        statusChangeReason: reason,
        updatedAt: Timestamp.now()
      });

      // Log status change history
      await this.logStatusChange({
        entityType: 'family',
        entityId: familyId,
        oldStatus: currentStatus || null,
        newStatus,
        changedBy,
        changeReason: reason,
        changedAt: new Date(),
        metadata: { impact }
      });

      // Execute family status business logic
      await this.executeFamilyStatusBusinessLogic(familyId, newStatus, impact);

      return impact;

    } catch (error) {
      console.error('Error changing family status:', error);
      throw error;
    }
  }

  /**
   * Get status change history for an entity
   */
  async getStatusHistory(
    entityType: 'student' | 'family',
    entityId: string,
    max: number = 10
  ): Promise<StatusHistoryEntry[]> {
    try {
      const historyQuery = query(
        collection(db, 'statusHistory'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('changedAt', 'desc'),
        limit(max)
      );

      const querySnapshot = await getDocs(historyQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        changedAt: doc.data().changedAt?.toDate()
      })) as StatusHistoryEntry[];

    } catch (error) {
      console.error('Error fetching status history:', error);
      return [];
    }
  }

  /**
   * Validate student status change
   */
  validateStudentStatusChange(
    currentStatus: StudentStatus,
    newStatus: StudentStatus
  ): StatusValidationResult {
    const rules = STATUS_TRANSITION_RULES[currentStatus];
    
    if (!rules) {
      return {
        isValid: false,
        requiresReason: false,
        requiresApproval: false,
        allowedTransitions: [],
        errorMessage: 'Invalid current status'
      };
    }

    const isAllowed = rules.allowedTransitions.includes(newStatus);
    
    return {
      isValid: isAllowed,
      requiresReason: rules.requiresReason,
      requiresApproval: rules.requiresApproval,
      allowedTransitions: rules.allowedTransitions,
      errorMessage: isAllowed ? undefined : `Cannot change from ${currentStatus} to ${newStatus}`
    };
  }

  /**
   * Get status permissions for a user role
   */
  getStatusPermissions(userRole: string, entityType: 'student' | 'family'): StatusPermissions {
    const permissionMatrix: Record<string, Record<string, StatusPermissions>> = {
      admin: {
        student: {
          canView: true,
          canEdit: true,
          allowedTransitions: ['active', 'inactive', 'graduated', 'transferred', 'withdrawn', 'suspended', 'on_hold'],
          requiresApproval: false,
          requiresReason: true
        },
        family: {
          canView: true,
          canEdit: true,
          allowedTransitions: ['active', 'inactive'],
          requiresApproval: false,
          requiresReason: true
        }
      },
      teacher: {
        student: {
          canView: true,
          canEdit: true,
          allowedTransitions: ['active', 'inactive', 'on_hold'],
          requiresApproval: true,
          requiresReason: true
        },
        family: {
          canView: true,
          canEdit: false,
          allowedTransitions: [],
          requiresApproval: false,
          requiresReason: false
        }
      },
      parent: {
        student: {
          canView: true,
          canEdit: false,
          allowedTransitions: [],
          requiresApproval: false,
          requiresReason: false
        },
        family: {
          canView: true,
          canEdit: false,
          allowedTransitions: [],
          requiresApproval: false,
          requiresReason: false
        }
      }
    };

    return permissionMatrix[userRole]?.[entityType] || {
      canView: false,
      canEdit: false,
      allowedTransitions: [],
      requiresApproval: false,
      requiresReason: false
    };
  }

  /**
   * Assess impact of family status change
   */
  private async assessFamilyStatusChangeImpact(
    familyId: string,
    newStatus: FamilyStatus
  ): Promise<StatusChangeImpact> {
    try {
      // Get family data to find associated students
      const studentsQuery = query(
        collection(db, 'students'),
        where('familyId', '==', familyId),
        where('isActive', '==', true)
      );

      const studentsSnapshot = await getDocs(studentsQuery);
      const activeStudents = studentsSnapshot.size;

      // Get active enrollments for family students
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', 'in', studentsSnapshot.docs.map(doc => doc.id)),
        where('status', '==', 'enrolled')
      );

      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const activeEnrollments = enrollmentsSnapshot.size;

      const impact: StatusChangeImpact = {
        affectedStudents: activeStudents,
        affectedEnrollments: activeEnrollments,
        billingChanges: newStatus === 'inactive',
        notificationRecipients: ['admin@hunickerinstitute.com'],
        warnings: []
      };

      // Add warnings based on impact
      if (newStatus === 'inactive' && activeStudents > 0) {
        impact.warnings?.push(`${activeStudents} active student(s) will be affected`);
      }

      if (newStatus === 'inactive' && activeEnrollments > 0) {
        impact.warnings?.push(`${activeEnrollments} active enrollment(s) may need review`);
      }

      return impact;

    } catch (error) {
      console.error('Error assessing family status change impact:', error);
      return {
        affectedStudents: 0,
        affectedEnrollments: 0,
        billingChanges: false,
        notificationRecipients: [],
        warnings: ['Unable to assess full impact due to system error']
      };
    }
  }

  /**
   * Log status change to history
   */
  private async logStatusChange(entry: Omit<StatusHistoryEntry, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'statusHistory'), {
        ...entry,
        changedAt: Timestamp.fromDate(entry.changedAt)
      });
    } catch (error) {
      console.error('Error logging status change:', error);
      // Don't throw here as it shouldn't block the main operation
    }
  }

  /**
   * Execute business logic for student status changes
   */
  private async executeStudentStatusBusinessLogic(
    studentId: string,
    newStatus: StudentStatus,
    oldStatus?: StudentStatus
  ): Promise<void> {
    const rules = STATUS_TRANSITION_RULES[newStatus];
    
    if (rules?.autoActions) {
      for (const action of rules.autoActions) {
        try {
          await this.executeBusinessAction(action, 'student', studentId, { newStatus, oldStatus });
        } catch (error) {
          console.error(`Error executing business action ${action}:`, error);
          // Log but don't fail the entire operation
        }
      }
    }
  }

  /**
   * Execute business logic for family status changes
   */
  private async executeFamilyStatusBusinessLogic(
    familyId: string,
    newStatus: FamilyStatus,
    impact: StatusChangeImpact
  ): Promise<void> {
    try {
      if (newStatus === 'inactive') {
        // Handle family deactivation
        await this.executeBusinessAction('suspend_billing', 'family', familyId, { impact });
        await this.executeBusinessAction('notify_admin', 'family', familyId, { impact });
      } else if (newStatus === 'active') {
        // Handle family reactivation
        await this.executeBusinessAction('resume_billing', 'family', familyId, { impact });
        await this.executeBusinessAction('send_welcome_back', 'family', familyId, { impact });
      }
    } catch (error) {
      console.error('Error executing family status business logic:', error);
    }
  }

  /**
   * Execute specific business actions
   */
  private async executeBusinessAction(
    action: string,
    entityType: 'student' | 'family',
    entityId: string,
    context: any
  ): Promise<void> {
    // This would integrate with other services like billing, notifications, etc.
    console.log(`Executing business action: ${action} for ${entityType} ${entityId}`, context);
    
    switch (action) {
      case 'pause_billing':
        // Integration with billing service
        break;
      case 'resume_billing':
        // Integration with billing service
        break;
      case 'notify_parents':
        // Integration with notification service
        break;
      case 'notify_admin':
        // Integration with notification service
        break;
      case 'generate_certificate':
        // Integration with certificate generation service
        break;
      case 'export_records':
        // Integration with records export service
        break;
      default:
        console.log(`Unknown business action: ${action}`);
    }
  }
}

// Export singleton instance
export const statusService = new StatusService();