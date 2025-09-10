import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { City, CityCreateRequest, CityUpdateRequest } from '../../types/cities';
import { cityValidators, useFormValidation } from '../../utils/validation';
import { useCountriesStore } from '../../store/countriesStore';
import { YandexMapPicker } from '../maps/YandexMapPicker';

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
    const { countries, fetchCountries, isLoading: isLoadingCountries } = useCountriesStore();
    
    const { 
        errors, 
        validateForm, 
        clearFieldError 
    } = useFormValidation(cityValidators.create);

    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: city?.name || '',
        country: city?.country || '',
        countryId: 0,
        region: city?.region || '',
        population: 0,
        latitude: city?.latitude || 0,
        longitude: city?.longitude || 0,
        description: city?.description || '',
        postalCode: '',
        active: city?.active ?? true
    });

    // Load countries on component mount
    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

    useEffect(() => {
        if (city) {
            setFormData({
                name: city.name,
                country: city.country,
                countryId: 0, // Will be set when countries are loaded
                region: city.region,
                population: 0, // Default value as this field is not returned from API
                latitude: city.latitude,
                longitude: city.longitude,
                description: city.description,
                postalCode: '', // Default value as this field is not returned from API
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
                    <label htmlFor="countryId" className="text-sm font-medium text-gray-300">
                        {t('cities.country')} *
                    </label>
                    <select
                        id="countryId"
                        value={formData.countryId || ''}
                        onChange={(e) => {
                            const selectedCountryId = parseInt(e.target.value) || 0;
                            const selectedCountry = countries.find(c => c.id === selectedCountryId);
                            handleChange('countryId', selectedCountryId);
                            if (selectedCountry) {
                                handleChange('country', selectedCountry.name);
                            }
                        }}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
                            errors.country 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                        disabled={isSubmitting || isLoadingCountries}
                    >
                        <option value="">
                            {isLoadingCountries ? t('common.loading') : t('cities.selectCountry')}
                        </option>
                        {countries.map((country) => (
                            <option key={country.id} value={country.id}>
                                {country.name}
                            </option>
                        ))}
                    </select>
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

                {/* Location Picker */}
                <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-medium text-gray-300">
                        {t('cities.location')} *
                    </label>
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsMapPickerOpen(true)}
                            className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {t('cities.selectOnMap')}
                        </button>
                        {(formData.latitude !== 0 || formData.longitude !== 0) && (
                            <span className="text-sm text-gray-400">
                                {t('cities.coordinates')}: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                            </span>
                        )}
                    </div>
                    {(formData.latitude === 0 && formData.longitude === 0) && (
                        <p className="text-red-500 text-xs">{t('cities.coordinatesRequired')}</p>
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

            {/* Map Picker Modal */}
            <YandexMapPicker
                isOpen={isMapPickerOpen}
                onClose={() => setIsMapPickerOpen(false)}
                onLocationSelect={(lat: number, lng: number) => {
                    handleChange('latitude', lat);
                    handleChange('longitude', lng);
                    setIsMapPickerOpen(false);
                }}
                initialLat={formData.latitude || 51.1694}
                initialLng={formData.longitude || 71.4491}
            />
        </form>
    );
};

export default CityForm;
