import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayerCreateRequest, PlayerPublicResponse } from '../../types/players';
import { PreferredFoot } from '../../types/teams';

interface PlayerFormProps {
  initialData?: Partial<PlayerPublicResponse>;
  onSubmit: (data: PlayerCreateRequest) => Promise<void>;
  onCancel: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PlayerCreateRequest>({
    position: initialData?.position || '',
    club: initialData?.club || '',
    age: initialData?.age || 0,
    height: initialData?.height || 0,
    weight: initialData?.weight || 0,
    nationality: initialData?.nationality || '',
    birthplace: initialData?.birthplace || '',
    preferredFoot: initialData?.preferredFoot || PreferredFoot.RIGHT,
    bio: initialData?.bio || '',
    identificationNumber: '',  // Required for create/update
    userId: 0,                 // Required for create/update
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.position.trim()) {
      newErrors.position = t('validations.positionRequired');
    }
    
    if (!formData.club.trim()) {
      newErrors.club = t('validations.clubRequired');
    }
    
    if (!formData.nationality.trim()) {
      newErrors.nationality = t('validations.nationalityRequired');
    }
    
    if (!formData.birthplace.trim()) {
      newErrors.birthplace = t('validations.birthplaceRequired');
    }
    
    if (formData.age <= 0) {
      newErrors.age = t('validations.ageInvalid');
    }
    
    if (formData.height <= 0) {
      newErrors.height = t('validations.heightInvalid');
    }
    
    if (formData.weight <= 0) {
      newErrors.weight = t('validations.weightInvalid');
    }
    
    if (!formData.identificationNumber.trim()) {
      newErrors.identificationNumber = t('validations.identificationRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'age' || name === 'height' || name === 'weight' || name === 'userId') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info Section */}
      <div className="bg-darkest-bg p-4 rounded-md mb-4">
        <h3 className="text-gold font-medium mb-3">{t('players.basicInfo')}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="position">
              {t('players.position')} *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={`form-input ${errors.position ? 'border-red-500' : ''}`}
            />
            {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="club">
              {t('players.club')} *
            </label>
            <input
              type="text"
              id="club"
              name="club"
              value={formData.club}
              onChange={handleChange}
              className={`form-input ${errors.club ? 'border-red-500' : ''}`}
            />
            {errors.club && <p className="text-red-500 text-xs mt-1">{errors.club}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="age">
              {t('players.age')} *
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              className={`form-input ${errors.age ? 'border-red-500' : ''}`}
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="height">
              {t('players.height')} (cm) *
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="0"
              className={`form-input ${errors.height ? 'border-red-500' : ''}`}
            />
            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="weight">
              {t('players.weight')} (kg) *
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              className={`form-input ${errors.weight ? 'border-red-500' : ''}`}
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
          </div>
        </div>
      </div>
      
      {/* Nationality Section */}
      <div className="bg-darkest-bg p-4 rounded-md mb-4">
        <h3 className="text-gold font-medium mb-3">{t('players.nationalityInfo')}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nationality">
              {t('players.nationality')} *
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className={`form-input ${errors.nationality ? 'border-red-500' : ''}`}
            />
            {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="birthplace">
              {t('players.birthplace')} *
            </label>
            <input
              type="text"
              id="birthplace"
              name="birthplace"
              value={formData.birthplace}
              onChange={handleChange}
              className={`form-input ${errors.birthplace ? 'border-red-500' : ''}`}
            />
            {errors.birthplace && <p className="text-red-500 text-xs mt-1">{errors.birthplace}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="preferredFoot">
            {t('players.preferredFoot')} *
          </label>
          <select
            id="preferredFoot"
            name="preferredFoot"
            value={formData.preferredFoot}
            onChange={handleChange}
            className="form-input"
          >
            <option value={PreferredFoot.LEFT}>{t('players.leftFoot')}</option>
            <option value={PreferredFoot.RIGHT}>{t('players.rightFoot')}</option>
            <option value={PreferredFoot.BOTH}>{t('players.bothFeet')}</option>
          </select>
        </div>
      </div>
      
      {/* Additional Info Section */}
      <div className="bg-darkest-bg p-4 rounded-md mb-4">
        <h3 className="text-gold font-medium mb-3">{t('players.additionalInfo')}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="bio">
            {t('players.bio')}
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="form-input"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="identificationNumber">
              {t('players.identificationNumber')} *
            </label>
            <input
              type="text"
              id="identificationNumber"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleChange}
              className={`form-input ${errors.identificationNumber ? 'border-red-500' : ''}`}
            />
            {errors.identificationNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.identificationNumber}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="userId">
              {t('players.userId')} *
            </label>
            <input
              type="number"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              min="0"
              className={`form-input ${errors.userId ? 'border-red-500' : ''}`}
            />
            {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="border-t border-gray-700 pt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.saving')}
            </>
          ) : (
            t('common.save')
          )}
        </button>
      </div>
    </form>
  );
};

export default PlayerForm;
