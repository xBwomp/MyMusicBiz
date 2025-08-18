// Status Management Type Definitions

export type StudentStatus = 
  | 'active' 
  | 'inactive' 
  | 'graduated' 
  | 'transferred' 
  | 'withdrawn' 
  | 'suspended' 
  | 'on_hold';

export type FamilyStatus = 'active' | 'inactive';

export interface StatusHistoryEntry {
  id: string;
  entityType: 'student' | 'family';
  entityId: string;
  oldStatus: string | null;
  newStatus: string;
  changedBy: string;
  changeReason?: string;
  changedAt: Date;
  metadata?: Record<string, any>;
}

export interface StatusChangeRequest {
  entityType: 'student' | 'family';
  entityId: string;
  newStatus: string;
  reason?: string;
}

export interface StatusValidationResult {
  isValid: boolean;
  requiresReason: boolean;
  requiresApproval: boolean;
  allowedTransitions: string[];
  errorMessage?: string;
}

export interface StatusPermissions {
  canView: boolean;
  canEdit: boolean;
  allowedTransitions: string[];
  requiresApproval: boolean;
  requiresReason: boolean;
}

export interface StatusChangeImpact {
  affectedStudents?: number;
  affectedEnrollments?: number;
  billingChanges?: boolean;
  notificationRecipients?: string[];
  warnings?: string[];
}

// Status display configurations
export const STUDENT_STATUS_CONFIG: Record<StudentStatus, {
  label: string;
  color: string;
  description: string;
  icon?: string;
}> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    description: 'Currently enrolled and participating',
    icon: '●'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800',
    description: 'Temporarily not participating',
    icon: '○'
  },
  graduated: {
    label: 'Graduated',
    color: 'bg-blue-100 text-blue-800',
    description: 'Successfully completed program',
    icon: '🎓'
  },
  transferred: {
    label: 'Transferred',
    color: 'bg-purple-100 text-purple-800',
    description: 'Moved to another institution',
    icon: '→'
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Voluntarily left the program',
    icon: '←'
  },
  suspended: {
    label: 'Suspended',
    color: 'bg-red-100 text-red-800',
    description: 'Temporarily removed due to policy violation',
    icon: '⏸'
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-800',
    description: 'Temporary pause (medical, financial, etc.)',
    icon: '⏸'
  }
};

export const FAMILY_STATUS_CONFIG: Record<FamilyStatus, {
  label: string;
  color: string;
  description: string;
  icon?: string;
}> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    description: 'Family is currently engaged with the institution',
    icon: '●'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800',
    description: 'Family is not currently engaged',
    icon: '○'
  }
};

// Business rules for status transitions
export const STATUS_TRANSITION_RULES: Record<StudentStatus, {
  allowedTransitions: StudentStatus[];
  requiresReason: boolean;
  requiresApproval: boolean;
  autoActions?: string[];
}> = {
  active: {
    allowedTransitions: ['inactive', 'graduated', 'transferred', 'withdrawn', 'suspended', 'on_hold'],
    requiresReason: true,
    requiresApproval: false,
    autoActions: ['pause_billing', 'notify_parents']
  },
  inactive: {
    allowedTransitions: ['active', 'withdrawn', 'transferred'],
    requiresReason: true,
    requiresApproval: true,
    autoActions: ['resume_billing']
  },
  graduated: {
    allowedTransitions: [], // Graduated is final
    requiresReason: false,
    requiresApproval: false,
    autoActions: ['generate_certificate', 'archive_records']
  },
  transferred: {
    allowedTransitions: ['active'], // Can return
    requiresReason: true,
    requiresApproval: true,
    autoActions: ['export_records']
  },
  withdrawn: {
    allowedTransitions: ['active', 'inactive'],
    requiresReason: true,
    requiresApproval: true,
    autoActions: ['calculate_refund']
  },
  suspended: {
    allowedTransitions: ['active', 'withdrawn'],
    requiresReason: true,
    requiresApproval: true,
    autoActions: ['conditional_reactivation']
  },
  on_hold: {
    allowedTransitions: ['active', 'withdrawn', 'inactive'],
    requiresReason: false,
    requiresApproval: false,
    autoActions: ['resume_when_ready']
  }
};