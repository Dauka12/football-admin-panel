import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaygroundFacility, CreatePlaygroundFacilityRequest } from '../../types/playgroundFacilities';
import { FACILITY_CATEGORIES, FACILITY_ICONS } from '../../types/playgroundFacilities';

interface PlaygroundFacilityFormProps {
    initialData?: PlaygroundFacility;
    onSubmit: (data: CreatePlaygroundFacilityRequest) => void;
    onCancel: () => void;
}

const PlaygroundFacilityForm: React.FC<PlaygroundFacilityFormProps> = ({
    initialData,
    onSubmit,
    onCancel
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<CreatePlaygroundFacilityRequest>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        icon: initialData?.icon || '',
        category: initialData?.category || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('validation.required');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('validation.required');
        }

        if (!formData.icon.trim()) {
            newErrors.icon = t('validation.required');
        }

        if (!formData.category) {
            newErrors.category = t('validation.required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('playgroundFacilities.name')} *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('playgroundFacilities.namePlaceholder')}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                />
                {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('playgroundFacilities.description')} *
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('playgroundFacilities.descriptionPlaceholder')}
                    rows={3}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-600'
                    }`}
                />
                {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('playgroundFacilities.category')} *
                </label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                        errors.category ? 'border-red-500' : 'border-gray-600'
                    }`}
                >
                    <option value="">{t('playgroundFacilities.selectCategory')}</option>
                    {Object.values(FACILITY_CATEGORIES).map(category => (
                        <option key={category} value={category}>
                            {t(`playgroundFacilities.categories.${category.toLowerCase()}`, category)}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('playgroundFacilities.icon')} *
                </label>
                <div className="space-y-2">
                    <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                            errors.icon ? 'border-red-500' : 'border-gray-600'
                        }`}
                    >
                        <option value="">{t('playgroundFacilities.selectIcon')}</option>
                        {Object.values(FACILITY_ICONS).map(icon => (
                            <option key={icon} value={icon}>
                                {t(`playgroundFacilities.icons.${icon}`, icon)}
                            </option>
                        ))}
                    </select>
                    <div className="text-sm text-gray-400">
                        {t('playgroundFacilities.iconHint')}
                    </div>
                    <input
                        type="text"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        placeholder={t('playgroundFacilities.customIconPlaceholder')}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                            errors.icon ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                </div>
                {errors.icon && (
                    <p className="text-red-400 text-sm mt-1">{errors.icon}</p>
                )}
            </div>

            {/* Preview */}
            {formData.name && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">{t('playgroundFacilities.preview')}</h4>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                            <span className="text-gold text-sm">
                                {formData.icon ? formData.icon.charAt(0).toUpperCase() : '?'}
                            </span>
                        </div>
                        <div>
                            <p className="text-white font-medium">{formData.name}</p>
                            <p className="text-gray-400 text-sm">{formData.description}</p>
                            {formData.category && (
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-900/20 text-blue-400 border border-blue-500/50 mt-1 inline-block">
                                    {t(`playgroundFacilities.categories.${formData.category.toLowerCase()}`, formData.category)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-gold text-darkest-bg rounded hover:bg-gold/90 transition-colors"
                >
                    {initialData ? t('common.update') : t('common.create')}
                </button>
            </div>
        </form>
    );
};

export default PlaygroundFacilityForm;
