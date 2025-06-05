import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MatchStatus } from '../../types/matches';
import { showToast } from '../../utils/toast';

interface MatchStatusControlProps {
  matchId: number;
  currentStatus: MatchStatus;
  onStatusChange: (status: MatchStatus) => Promise<boolean>;
}

const MatchStatusControl: React.FC<MatchStatusControlProps> = ({
  matchId,
  currentStatus,
  onStatusChange
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  // Possible status transitions
  const getAvailableStatuses = (): MatchStatus[] => {
    switch (currentStatus) {
      case 'PENDING':
        return ['LIVE', 'CANCELLED'];
      case 'LIVE':
        return ['COMPLETED', 'CANCELLED'];
      case 'COMPLETED':
      case 'CANCELLED':
        return [];
      default:
        return ['PENDING', 'LIVE', 'COMPLETED', 'CANCELLED'];
    }
  };

  // Handle status change
  const handleStatusChange = async (status: MatchStatus) => {
    setIsLoading(true);
    const success = await onStatusChange(status);
    
    if (success) {
      showToast(t('matches.statusUpdated'), 'success');
      setShowStatusOptions(false);
    }
    
    setIsLoading(false);
  };

  // Status color mapping
  const getStatusColor = (status: MatchStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-900/50 text-blue-200 border-blue-700/50 hover:bg-blue-800/50';
      case 'LIVE':
        return 'bg-green-900/50 text-green-200 border-green-700/50 hover:bg-green-800/50';
      case 'COMPLETED':
        return 'bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50';
      case 'CANCELLED':
        return 'bg-red-900/50 text-red-200 border-red-700/50 hover:bg-red-800/50';
      default:
        return 'bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50';
    }
  };

  // Available status options
  const availableStatuses = getAvailableStatuses();
  const hasStatusOptions = availableStatuses.length > 0;

  return (
    <div className="relative">
      <div className="flex items-center">
        <div
          className={`inline-block px-4 py-2 border rounded-md ${getStatusColor(currentStatus)}`}
        >
          {t(`matches.status.${currentStatus.toLowerCase()}`)}
        </div>

        {hasStatusOptions && (
          <button 
            className="ml-2 p-1 rounded hover:bg-darkest-bg transition-colors" 
            onClick={() => setShowStatusOptions(!showStatusOptions)}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      {showStatusOptions && hasStatusOptions && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-card-bg border border-gray-700 rounded-md shadow-lg overflow-hidden">
          {availableStatuses.map(status => (
            <button
              key={status}
              className={`w-full px-4 py-2 text-left hover:bg-darkest-bg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleStatusChange(status)}
              disabled={isLoading}
            >
              {t(`matches.status.${status.toLowerCase()}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchStatusControl;
