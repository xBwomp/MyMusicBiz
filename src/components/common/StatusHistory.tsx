import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusHistoryEntry, STUDENT_STATUS_CONFIG, FAMILY_STATUS_CONFIG } from '../../types/status';
import { statusService } from '../../services/statusService';

interface StatusHistoryProps {
  entityType: 'student' | 'family';
  entityId: string;
  maxEntries?: number;
  showExpanded?: boolean;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({
  entityType,
  entityId,
  maxEntries = 5,
  showExpanded = false
}) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(showExpanded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [entityType, entityId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await statusService.getStatusHistory(entityType, entityId, 20);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading status history:', error);
      setError('Failed to load status history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusConfig = (status: string) => {
    const configs = entityType === 'student' ? STUDENT_STATUS_CONFIG : FAMILY_STATUS_CONFIG;
    return configs[status as keyof typeof configs];
  };

  const displayedHistory = expanded ? history : history.slice(0, maxEntries);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadHistory}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No status changes recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Status History</span>
        </h4>
        {history.length > maxEntries && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>{expanded ? 'Show less' : `Show all (${history.length})`}</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedHistory.map((entry, index) => {
          const oldStatusConfig = entry.oldStatus ? getStatusConfig(entry.oldStatus) : null;
          const newStatusConfig = getStatusConfig(entry.newStatus);
          const isFirst = index === 0;

          return (
            <div
              key={entry.id}
              className={`relative pl-6 pb-3 ${
                index < displayedHistory.length - 1 ? 'border-l-2 border-gray-200' : ''
              }`}
            >
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1 w-3 h-3 rounded-full transform -translate-x-1/2 ${
                isFirst ? 'bg-indigo-600' : 'bg-gray-400'
              }`} />

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {oldStatusConfig && (
                        <>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${oldStatusConfig.color}`}>
                            {oldStatusConfig.icon} {oldStatusConfig.label}
                          </span>
                          <span className="text-gray-400">→</span>
                        </>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${newStatusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                        {newStatusConfig?.icon} {newStatusConfig?.label || entry.newStatus}
                      </span>
                    </div>

                    {entry.changeReason && (
                      <div className="flex items-start space-x-2 mt-2">
                        <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">{entry.changeReason}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Changed by: {entry.changedBy.slice(-6)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(entry.changedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!expanded && history.length > maxEntries && (
        <div className="text-center pt-2">
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Show {history.length - maxEntries} more entries
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusHistory;