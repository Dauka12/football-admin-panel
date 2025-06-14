import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
    CreateTournamentCategoryRequest,
    TournamentCategory,
    UpdateTournamentCategoryRequest
} from '../../types/tournamentCategories';

interface TournamentCategoryFormProps {
    category?: TournamentCategory;
    onSubmit: (data: CreateTournamentCategoryRequest | UpdateTournamentCategoryRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const TournamentCategoryForm: React.FC<TournamentCategoryFormProps> = ({
    category,
    onSubmit,
    onCancel,
    isLoading
}) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('tournamentCategories.validation.nameRequired');
        } else if (formData.name.length < 2) {
            newErrors.name = t('tournamentCategories.validation.nameMinLength');
        } else if (formData.name.length > 100) {
            newErrors.name = t('tournamentCategories.validation.nameMaxLength');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('tournamentCategories.validation.descriptionRequired');
        } else if (formData.description.length < 5) {
            newErrors.description = t('tournamentCategories.validation.descriptionMinLength');
        } else if (formData.description.length > 500) {
            newErrors.description = t('tournamentCategories.validation.descriptionMaxLength');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        onSubmit(formData);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('tournamentCategories.name')} *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t('tournamentCategories.namePlaceholder')}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white placeholder-gray-400 ${
                            errors.name 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        disabled={isLoading}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('tournamentCategories.description')} *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={t('tournamentCategories.descriptionPlaceholder')}
                        rows={4}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white placeholder-gray-400 resize-none ${
                            errors.description 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        disabled={isLoading}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                        disabled={isLoading}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gold text-darkest-bg px-6 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                            category ? t('common.update') : t('common.create')
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
