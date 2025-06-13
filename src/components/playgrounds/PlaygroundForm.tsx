import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreatePlaygroundRequest } from '../../types/playgrounds';

interface PlaygroundFormProps {
    initialData?: Partial<CreatePlaygroundRequest>;
    onSubmit: (data: CreatePlaygroundRequest) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
}

const PlaygroundForm: React.FC<PlaygroundFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreatePlaygroundRequest>({
        name: initialData?.name || '',
        location: initialData?.location || '',
        pricePerHour: initialData?.pricePerHour || 0,
        description: initialData?.description || '',
        maxCapacity: initialData?.maxCapacity || 0,
        currentCapacity: initialData?.currentCapacity || 0,
        availableFrom: initialData?.availableFrom || '09:00',
        availableTo: initialData?.availableTo || '22:00',
        active: initialData?.active ?? true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('validations.nameRequired');
        } else if (formData.name.length < 2) {
            newErrors.name = t('validations.nameShort');
        }

        if (!formData.location.trim()) {
            newErrors.location = t('playgrounds.validation.locationRequired');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('validations.descriptionRequired');
        }

        if (formData.pricePerHour <= 0) {
            newErrors.pricePerHour = t('playgrounds.validation.pricePositive');
        }

        if (formData.maxCapacity <= 0) {
            newErrors.maxCapacity = t('playgrounds.validation.capacityPositive');
        }

        if (formData.currentCapacity < 0) {
            newErrors.currentCapacity = t('playgrounds.validation.currentCapacityValid');
        }

        if (formData.currentCapacity > formData.maxCapacity) {
            newErrors.currentCapacity = t('playgrounds.validation.currentCapacityNotExceedMax');
        }

        if (!formData.availableFrom) {
            newErrors.availableFrom = t('playgrounds.validation.availableFromRequired');
        }

        if (!formData.availableTo) {
            newErrors.availableTo = t('playgrounds.validation.availableToRequired');
        }

        if (formData.availableFrom && formData.availableTo && formData.availableFrom >= formData.availableTo) {
            newErrors.availableTo = t('playgrounds.validation.availableToAfterFrom');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof CreatePlaygroundRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                    {t('playgrounds.name')} *
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                    } focus:border-gold focus:outline-none`}
                    placeholder={t('playgrounds.namePlaceholder')}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Location */}
            <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                    {t('playgrounds.location')} *
                </label>
                <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                        errors.location ? 'border-red-500' : 'border-gray-600'
                    } focus:border-gold focus:outline-none`}
                    placeholder={t('playgrounds.locationPlaceholder')}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Price and Capacity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="pricePerHour" className="block text-sm font-medium mb-2">
                        {t('playgrounds.pricePerHour')} *
                    </label>
                    <input
                        type="number"
                        id="pricePerHour"
                        step="0.01"
                        min="0"
                        value={formData.pricePerHour}
                        onChange={(e) => handleInputChange('pricePerHour', parseFloat(e.target.value) || 0)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.pricePerHour ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                    />
                    {errors.pricePerHour && <p className="text-red-500 text-sm mt-1">{errors.pricePerHour}</p>}
                </div>

                <div>
                    <label htmlFor="maxCapacity" className="block text-sm font-medium mb-2">
                        {t('playgrounds.maxCapacity')} *
                    </label>
                    <input
                        type="number"
                        id="maxCapacity"
                        min="1"
                        value={formData.maxCapacity}
                        onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.maxCapacity ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                    />
                    {errors.maxCapacity && <p className="text-red-500 text-sm mt-1">{errors.maxCapacity}</p>}
                </div>
            </div>

            {/* Current Capacity and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="currentCapacity" className="block text-sm font-medium mb-2">
                        {t('playgrounds.currentCapacity')}
                    </label>
                    <input
                        type="number"
                        id="currentCapacity"
                        min="0"
                        max={formData.maxCapacity}
                        value={formData.currentCapacity}
                        onChange={(e) => handleInputChange('currentCapacity', parseInt(e.target.value) || 0)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.currentCapacity ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                    />
                    {errors.currentCapacity && <p className="text-red-500 text-sm mt-1">{errors.currentCapacity}</p>}
                </div>

                <div>
                    <label htmlFor="active" className="block text-sm font-medium mb-2">
                        {t('playgrounds.status')}
                    </label>
                    <div className="flex items-center mt-3">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => handleInputChange('active', e.target.checked)}
                            className="mr-2 w-4 h-4 text-gold bg-darkest-bg border-gray-600 rounded focus:ring-gold"
                        />
                        <label htmlFor="active" className="text-sm">
                            {t('playgrounds.active')}
                        </label>
                    </div>
                </div>
            </div>

            {/* Available Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="availableFrom" className="block text-sm font-medium mb-2">
                        {t('playgrounds.availableFrom')} *
                    </label>
                    <input
                        type="time"
                        id="availableFrom"
                        value={formData.availableFrom}
                        onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.availableFrom ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                    />
                    {errors.availableFrom && <p className="text-red-500 text-sm mt-1">{errors.availableFrom}</p>}
                </div>

                <div>
                    <label htmlFor="availableTo" className="block text-sm font-medium mb-2">
                        {t('playgrounds.availableTo')} *
                    </label>
                    <input
                        type="time"
                        id="availableTo"
                        value={formData.availableTo}
                        onChange={(e) => handleInputChange('availableTo', e.target.value)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.availableTo ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                    />
                    {errors.availableTo && <p className="text-red-500 text-sm mt-1">{errors.availableTo}</p>}
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                    {t('playgrounds.description')} *
                </label>
                <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                        errors.description ? 'border-red-500' : 'border-gray-600'
                    } focus:border-gold focus:outline-none resize-none`}
                    placeholder={t('playgrounds.descriptionPlaceholder')}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                    disabled={isSubmitting}
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors duration-200 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? t('common.loading')
                        : isEditing
                        ? t('common.update')
                        : t('common.create')
                    }
                </button>
            </div>
        </form>
    );
};

export default PlaygroundForm;
