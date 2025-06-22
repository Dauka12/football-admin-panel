import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateMatchEventRequest, MatchEventType } from '../../types/matchEvents';
import { MATCH_EVENT_TYPES } from '../../types/matchEvents';

interface MatchEventFormProps {
  matchId: number;
  onSubmit: (data: CreateMatchEventRequest) => Promise<void>;
  onCancel: () => void;
  availableTeams?: Array<{ id: number; name: string }>;
  availablePlayers?: Array<{ id: number; fullName: string; teamId: number }>;
}

const MatchEventForm: React.FC<MatchEventFormProps> = ({ 
  matchId, 
  onSubmit, 
  onCancel,
  availableTeams = [],
  availablePlayers = []
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    eventType: '' as MatchEventType,
    eventTime: '',
    teamId: '',
    playerId: '',
    description: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPlayers = formData.teamId 
    ? availablePlayers.filter(player => player.teamId === parseInt(formData.teamId))
    : availablePlayers;

  const requiresPlayer = true; // All events require a player according to backend API
  const requiresTeam = formData.eventType && ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SECOND_YELLOW', 'PENALTY_GOAL', 'MISSED_PENALTY', 'OWN_GOAL'].includes(formData.eventType);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventType) {
      newErrors.eventType = t('validation.required');
    }

    if (!formData.eventTime) {
      newErrors.eventTime = t('validation.required');
    } else {
      const time = parseInt(formData.eventTime);
      if (time < 0) {
        newErrors.eventTime = t('validation.minValue', { min: 0 });
      } else if (time > 200) {
        newErrors.eventTime = t('validation.maxValue', { max: 200 });
      }
    }

    if (requiresTeam && !formData.teamId) {
      newErrors.teamId = t('validation.required');
    }

    if (requiresPlayer && !formData.playerId) {
      newErrors.playerId = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const eventData: CreateMatchEventRequest = {
        matchId,
        eventType: formData.eventType,
        eventTime: parseInt(formData.eventTime),
        description: formData.description || undefined,
        teamId: formData.teamId ? parseInt(formData.teamId) : undefined,
        playerId: formData.playerId ? parseInt(formData.playerId) : undefined
      };

      await onSubmit(eventData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields
      ...(field === 'teamId' ? { playerId: '' } : {}),
      ...(field === 'eventType' ? { teamId: '', playerId: '' } : {})
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const eventTypeOptions = Object.entries(MATCH_EVENT_TYPES).map(([key, value]) => ({
    value,
    label: t(`matchEvents.types.${key.toLowerCase()}`)
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('matchEvents.eventType')} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.eventType}
          onChange={(e) => handleInputChange('eventType', e.target.value)}
          className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">{t('common.select')}</option>
          {eventTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.eventType && (
          <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
        )}
      </div>

      {/* Event Time */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('matchEvents.eventTime')} ({t('matchEvents.minutes')}) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          max="200"
          value={formData.eventTime}
          onChange={(e) => handleInputChange('eventTime', e.target.value)}
          className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
          placeholder={t('matchEvents.eventTimePlaceholder')}
        />
        {errors.eventTime && (
          <p className="text-red-500 text-sm mt-1">{errors.eventTime}</p>
        )}
      </div>

      {/* Team Selection */}
      {requiresTeam && availableTeams.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('teams.team')} {requiresTeam && <span className="text-red-500">*</span>}
          </label>
          <select
            value={formData.teamId}
            onChange={(e) => handleInputChange('teamId', e.target.value)}
            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">{t('common.select')}</option>
            {availableTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {errors.teamId && (
            <p className="text-red-500 text-sm mt-1">{errors.teamId}</p>
          )}
        </div>
      )}

      {/* Player Selection */}
      {requiresPlayer && filteredPlayers.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('players.player')} {requiresPlayer && <span className="text-red-500">*</span>}
          </label>
          <select
            value={formData.playerId}
            onChange={(e) => handleInputChange('playerId', e.target.value)}
            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">{t('common.select')}</option>
            {filteredPlayers.map(player => (
              <option key={player.id} value={player.id}>
                {player.fullName}
              </option>
            ))}
          </select>
          {errors.playerId && (
            <p className="text-red-500 text-sm mt-1">{errors.playerId}</p>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('common.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold resize-none"
          placeholder={t('matchEvents.descriptionPlaceholder')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {t('matchEvents.addEvent')}
        </button>
      </div>
    </form>
  );
};

export default MatchEventForm;
