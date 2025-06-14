import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SportType, SportTypeCreateRequest, SportTypeUpdateRequest } from '../../types/sportTypes';

interface SportTypeFormProps {
    initialData?: SportType;
    onSubmit: (data: SportTypeCreateRequest | SportTypeUpdateRequest) => Promise<void>;
    onCancel: () => void;
}

const SportTypeForm: React.FC<SportTypeFormProps> = ({
    initialData,
    onSubmit,
    onCancel
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        teamBased: initialData?.teamBased ?? true,
        maxTeamSize: initialData?.maxTeamSize || 11,
        minTeamSize: initialData?.minTeamSize || 11,
        active: initialData?.active ?? true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('sportTypes.name')} *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    placeholder={t('sportTypes.namePlaceholder')}
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('sportTypes.description')}
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
                    placeholder={t('sportTypes.descriptionPlaceholder')}
                />
            </div>

            {/* Team Based */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="teamBased"
                    name="teamBased"
                    checked={formData.teamBased}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-gold bg-darkest-bg border-gray-600 rounded focus:ring-gold focus:ring-2"
                />
                <label htmlFor="teamBased" className="ml-2 text-sm font-medium text-gray-300">
                    {t('sportTypes.teamBased')}
                </label>
            </div>

            {/* Team Size */}
            {formData.teamBased && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="minTeamSize" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('sportTypes.minTeamSize')} *
                        </label>
                        <input
                            type="number"
                            id="minTeamSize"
                            name="minTeamSize"
                            value={formData.minTeamSize}
                            onChange={handleInputChange}
                            min="1"
                            required={formData.teamBased}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('sportTypes.maxTeamSize')} *
                        </label>
                        <input
                            type="number"
                            id="maxTeamSize"
                            name="maxTeamSize"
                            value={formData.maxTeamSize}
                            onChange={handleInputChange}
                            min={formData.minTeamSize}
                            required={formData.teamBased}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Active */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-gold bg-darkest-bg border-gray-600 rounded focus:ring-gold focus:ring-2"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-300">
                    {t('sportTypes.active')}
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gold text-darkest-bg rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </form>
    );
};

export default SportTypeForm;
