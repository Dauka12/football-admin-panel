import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { City, CityCreateRequest, CityUpdateRequest } from '../../types/cities';
import { cityValidators, useFormValidation } from '../../utils/validation';

interface CityFormProps {
    city?: City;
    onSubmit: (data: CityCreateRequest | CityUpdateRequest) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const CityForm: React.FC<CityFormProps> = ({
    city,
    onSubmit,
    onCancel,
    isSubmitting = false
}) => {
    const { t } = useTranslation();
    
    const { 
        errors, 
        validateForm, 
        clearFieldError 
    } = useFormValidation(cityValidators.create);

    const [formData, setFormData] = useState({
        name: city?.name || '',
        country: city?.country || '',
        region: city?.region || '',
        population: 0,
        latitude: city?.latitude || 0,
        longitude: city?.longitude || 0,
        description: city?.description || '',
        postalCode: '',
        active: city?.active ?? true
    });

    useEffect(() => {
        if (city) {
            setFormData({
                name: city.name,
                country: city.country,
                region: city.region,
                population: 0,
                latitude: city.latitude,
                longitude: city.longitude,
                description: city.description,
                postalCode: '',
                active: city.active
            });
        }
    }, [city]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm(formData)) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            clearFieldError(field);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-300">
                        {t('cities.name')} *
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.name 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        placeholder={t('cities.name')}
                        disabled={isSubmitting}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs">{errors.name}</p>
                    )}
                </div>

                {/* Country */}
                <div className="space-y-1">
                    <label htmlFor="country" className="text-sm font-medium text-gray-300">
                        {t('cities.country')} *
                    </label>
                    <input
                        id="country"
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.country 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        placeholder={t('cities.country')}
                        disabled={isSubmitting}
                    />
                    {errors.country && (
                        <p className="text-red-500 text-xs">{errors.country}</p>
                    )}
                </div>

                {/* Region */}
                <div className="space-y-1">
                    <label htmlFor="region" className="text-sm font-medium text-gray-300">
                        {t('cities.region')} *
                    </label>
                    <input
                        id="region"
                        type="text"
                        value={formData.region}
                        onChange={(e) => handleChange('region', e.target.value)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.region 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        placeholder={t('cities.region')}
                        disabled={isSubmitting}
                    />
                    {errors.region && (
                        <p className="text-red-500 text-xs">{errors.region}</p>
                    )}
                </div>

                {/* Population */}
                <div className="space-y-1">
                    <label htmlFor="population" className="text-sm font-medium text-gray-300">
                        {t('cities.population')} *
                    </label>
                    <input
                        id="population"
                        type="number"
                        min="0"
                        value={formData.population}
                        onChange={(e) => handleChange('population', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.population 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        placeholder={t('cities.population')}
                        disabled={isSubmitting}
                    />
                    {errors.population && (
                        <p className="text-red-500 text-xs">{errors.population}</p>
                    )}
                </div>

                {/* Latitude */}
                <div className="space-y-1">
                    <label htmlFor="latitude" className="text-sm font-medium text-gray-300">
                        {t('cities.latitude')} *
                    </label>
                    <input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        value={formData.latitude}
                        onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.latitude 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        placeholder={t('cities.latitude')}
                        disabled={isSubmitting}
                    />
                    {errors.latitude && (
                        <p className="text-red-500 text-xs">{errors.latitude}</p>
                    )}
                </div>

                {/* Longitude */}
                <div className="space-y-1">
                    <label htmlFor="longitude" className="text-sm font-medium text-gray-300">
                        {t('cities.longitude')} *
                    </label>
                    <input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={formData.longitude}
                        onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.longitude 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        placeholder={t('cities.longitude')}
                        disabled={isSubmitting}
                    />
                    {errors.longitude && (
                        <p className="text-red-500 text-xs">{errors.longitude}</p>
                    )}
                </div>

                {/* Postal Code */}
                <div className="space-y-1">
                    <label htmlFor="postalCode" className="text-sm font-medium text-gray-300">
                        {t('cities.postalCode')} *
                    </label>
                    <input
                        id="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.postalCode 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        placeholder={t('cities.postalCode')}
                        disabled={isSubmitting}
                    />
                    {errors.postalCode && (
                        <p className="text-red-500 text-xs">{errors.postalCode}</p>
                    )}
                </div>

                {/* Active Status */}
                <div className="space-y-1">
                    <label htmlFor="active" className="text-sm font-medium text-gray-300">
                        {t('common.status')}
                    </label>
                    <div className="flex items-center">
                        <input
                            id="active"
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => handleChange('active', e.target.checked)}
                            className="w-4 h-4 text-gold bg-darkest-bg border-gray-700 rounded focus:ring-gold focus:ring-2"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="active" className="ml-2 text-sm text-gray-300">
                            {t('common.active')}
                        </label>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label htmlFor="description" className="text-sm font-medium text-gray-300">
                    {t('common.description')}
                </label>
                <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                        errors.description 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-700 focus:ring-gold'
                    }`}
                    placeholder={t('common.description')}
                    disabled={isSubmitting}
                />
                {errors.description && (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                    disabled={isSubmitting}
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </form>
    );
};

export default CityForm;
