import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateMatchEventRequest, MatchEventType } from '../../types/matchEvents';
import { MATCH_EVENT_TYPES } from '../../types/matchEvents';

interface MatchEventFormProps {
  matchId: number;
  onSubmit: (data: CreateMatchEventRequest) => Promise<void>;
  onCancel: () => void;
  availablePlayers?: Array<{ id: number; fullName: string; teamId?: number }>;
}

const MatchEventForm: React.FC<MatchEventFormProps> = ({ 
  matchId, 
  onSubmit, 
  onCancel,
  availablePlayers = []
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    type: '' as MatchEventType,
    minute: '',
    playerId: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = t('validation.required');
    }

    if (!formData.minute) {
      newErrors.minute = t('validation.required');
    } else {
      const time = parseInt(formData.minute);
      if (time < 0) {
        newErrors.minute = t('validation.minValue', { min: 0 });
      } else if (time > 200) {
        newErrors.minute = t('validation.maxValue', { max: 200 });
      }
    }

    if (!formData.playerId) {
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
        type: formData.type,
        minute: parseInt(formData.minute),
        playerId: parseInt(formData.playerId)
      };

      await onSubmit(eventData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">{t('common.select')}</option>
          {eventTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type}</p>
        )}
      </div>

      {/* Event Time */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('matchEvents.minute')} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          max="200"
          value={formData.minute}
          onChange={(e) => handleInputChange('minute', e.target.value)}
          className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
          placeholder={t('matchEvents.minutePlaceholder')}
        />
        {errors.minute && (
          <p className="text-red-500 text-sm mt-1">{errors.minute}</p>
        )}
      </div>

      {/* Player Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('players.player')} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.playerId}
          onChange={(e) => handleInputChange('playerId', e.target.value)}
          className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">{t('common.select')}</option>
          {availablePlayers.map(player => (
            <option key={player.id} value={player.id}>
              {player.fullName}
            </option>
          ))}
        </select>
        {errors.playerId && (
          <p className="text-red-500 text-sm mt-1">{errors.playerId}</p>
        )}
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
