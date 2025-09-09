import React, { useState } from 'react';
import { ChevronDown, AlertCircle, Clock } from 'lucide-react';
import { 
  StudentStatus, 
  FamilyStatus, 
  STUDENT_STATUS_CONFIG, 
  FAMILY_STATUS_CONFIG,
  StatusPermissions 
} from '../../types/status';
import { statusService } from '../../services/statusService';
import { useAdmin } from '../../hooks/useAdmin';

type Role = 'admin' | 'teacher' | 'student' | 'parent';

interface StatusDropdownProps {
  entityType: 'student' | 'family';
  entityId: string;
  currentStatus: StudentStatus | FamilyStatus;
  onStatusChange?: (newStatus: string, reason?: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  userRole?: Role;
  changedById?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  entityType,
  entityId,
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'md',
  userRole,
  changedById
}) => {
  const { userProfile } = useAdmin();
  const role: Role = userRole || userProfile?.role || 'parent';
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [reason, setReason] = useState('');

  // Get user permissions for this entity type
  const permissions = statusService.getStatusPermissions(role, entityType);

  // Get status configuration
  const statusConfig = entityType === 'student' ? STUDENT_STATUS_CONFIG : FAMILY_STATUS_CONFIG;
  const currentConfig = statusConfig[currentStatus as keyof typeof statusConfig];

  // Get allowed status options based on permissions
  const allowedStatuses = permissions.allowedTransitions.filter(status => 
    status !== currentStatus
  );

  const handleStatusSelect = async (newStatus: string) => {
    setIsOpen(false);
    
    if (!permissions.canEdit) {
      return;
    }

    // Check if reason is required
    if (entityType === 'student') {
      const validation = statusService.validateStudentStatusChange(
        currentStatus as StudentStatus, 
        newStatus as StudentStatus
      );
      
      if (validation.requiresReason || permissions.requiresReason) {
        setSelectedStatus(newStatus);
        setShowReasonModal(true);
        return;
      }
    } else if (permissions.requiresReason) {
      setSelectedStatus(newStatus);
      setShowReasonModal(true);
      return;
    }

    // Change status immediately if no reason required
    await changeStatus(newStatus, '');
  };

  const changeStatus = async (newStatus: string, statusReason: string) => {
    const actorId = changedById || userProfile?.id;
    if (!actorId) return;

    setIsChanging(true);
    try {
      if (entityType === 'student') {
        await statusService.changeStudentStatus(
          entityId,
          newStatus as StudentStatus,
          statusReason,
          actorId,
          currentStatus as StudentStatus
        );
      } else {
        await statusService.changeFamilyStatus(
          entityId,
          newStatus as FamilyStatus,
          statusReason,
          actorId,
          currentStatus as FamilyStatus
        );
      }

      onStatusChange?.(newStatus, statusReason);
      setShowReasonModal(false);
      setReason('');
      setSelectedStatus('');
    } catch (error) {
      console.error('Error changing status:', error);
      // You might want to show an error toast here
    } finally {
      setIsChanging(false);
    }
  };

  const handleReasonSubmit = async () => {
    if (!reason.trim()) return;
    await changeStatus(selectedStatus, reason);
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  if (!permissions.canView) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => permissions.canEdit && !disabled && setIsOpen(!isOpen)}
          disabled={disabled || !permissions.canEdit || isChanging}
          className={`
            inline-flex items-center space-x-2 rounded-full font-medium transition-all duration-200
            ${sizeClasses[size]}
            ${currentConfig?.color || 'bg-gray-100 text-gray-800'}
            ${permissions.canEdit && !disabled ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
            ${isChanging ? 'opacity-50' : ''}
          `}
        >
          {isChanging ? (
            <Clock className="h-3 w-3 animate-spin" />
          ) : (
            currentConfig?.icon && <span>{currentConfig.icon}</span>
          )}
          <span>{currentConfig?.label || currentStatus}</span>
          {permissions.canEdit && !disabled && (
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && permissions.canEdit && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Change Status
              </div>
              {allowedStatuses.map((status) => {
                const config = statusConfig[status as keyof typeof statusConfig];
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    {config?.icon && <span>{config.icon}</span>}
                    <div>
                      <div className="font-medium">{config?.label || status}</div>
                      <div className="text-xs text-gray-500">{config?.description}</div>
                    </div>
                  </button>
                );
              })}
              {allowedStatuses.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No status changes available
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Status Change Reason</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Changing status from <strong>{currentConfig?.label}</strong> to{' '}
                <strong>{statusConfig[selectedStatus as keyof typeof statusConfig]?.label}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Please provide a reason for this status change:
              </p>
            </div>

            <div className="mb-6">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for status change..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setReason('');
                  setSelectedStatus('');
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReasonSubmit}
                disabled={!reason.trim() || isChanging}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? 'Changing...' : 'Change Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusDropdown;