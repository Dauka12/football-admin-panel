import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatchStore } from '../../store/matchStore';
import type { MatchStatus } from '../../types/matches';

interface StatusUpdateButtonProps {
  matchId: number;
  currentStatus: MatchStatus;
}

const StatusUpdateButton: React.FC<StatusUpdateButtonProps> = ({ matchId, currentStatus }) => {
  const { t } = useTranslation();
  const { updateMatchStatus } = useMatchStore();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Determine the next logical status based on current status
  const getNextStatus = (): MatchStatus | null => {
    switch (currentStatus) {
      case 'PENDING':
        return 'LIVE';
      case 'LIVE':
        return 'COMPLETED';
      default:
        return null; // No next status for COMPLETED or CANCELLED
    }
  };
  
  const nextStatus = getNextStatus();
  
  // Skip rendering if there's no next status
  if (!nextStatus) {
    return null;
  }
  
  // Update the match status
  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateMatchStatus(matchId, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Button text based on next status
  const getButtonText = (): string => {
    switch (nextStatus) {
      case 'LIVE':
        return t('matches.actions.startMatch');
      case 'COMPLETED':
        return t('matches.actions.endMatch');
      default:
        return t('matches.actions.updateStatus');
    }
  };
  
  // Button style based on next status
  const getButtonStyle = (): string => {
    switch (nextStatus) {
      case 'LIVE':
        return 'bg-green-600 hover:bg-green-700';
      case 'COMPLETED':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };
  
  return (
    <button
      onClick={handleStatusUpdate}
      disabled={isUpdating}
      className={`px-4 py-2 text-white rounded-md transition-colors ${getButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
    >
      {isUpdating ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('common.updating')}
        </>
      ) : (
        getButtonText()
      )}
    </button>
  );
};

export default StatusUpdateButton;
