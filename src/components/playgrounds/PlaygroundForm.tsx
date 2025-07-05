import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCityStore } from '../../store/cityStore';
import type { CreatePlaygroundRequest } from '../../types/playgrounds';
import { YandexMapPicker } from '../maps/YandexMapPicker';

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
    const { cities, fetchCities } = useCityStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    
    const [formData, setFormData] = useState<CreatePlaygroundRequest>({
        name: initialData?.name || '',
        cityId: initialData?.cityId || 0,
        pricePerHour: initialData?.pricePerHour || 0,
        description: initialData?.description || '',
        maxCapacity: initialData?.maxCapacity || 0,
        currentCapacity: initialData?.currentCapacity || 0,
        availableFrom: initialData?.availableFrom || '09:00',
        availableTo: initialData?.availableTo || '22:00',
        fieldSize: initialData?.fieldSize || '',
        fieldCoverType: initialData?.fieldCoverType || '',
        fieldSurfaceType: initialData?.fieldSurfaceType || '',
        address: initialData?.address || '',
        latitude: initialData?.latitude || 0,
        longitude: initialData?.longitude || 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load cities on component mount
    useEffect(() => {
        const loadCities = async () => {
            setIsLoadingCities(true);
            try {
                await fetchCities();
            } catch (error) {
                console.error('Failed to load cities:', error);
            } finally {
                setIsLoadingCities(false);
            }
        };

        loadCities();
    }, [fetchCities]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('validations.nameRequired');
        } else if (formData.name.length < 2) {
            newErrors.name = t('validations.nameShort');
        }

        if (!formData.cityId) {
            newErrors.cityId = t('playgrounds.validation.cityRequired');
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

        if (!formData.fieldSize.trim()) {
            newErrors.fieldSize = t('playgrounds.validation.fieldSizeRequired');
        }

        if (!formData.fieldCoverType.trim()) {
            newErrors.fieldCoverType = t('playgrounds.validation.fieldCoverTypeRequired');
        }

        if (!formData.fieldSurfaceType.trim()) {
            newErrors.fieldSurfaceType = t('playgrounds.validation.fieldSurfaceTypeRequired');
        }

        if (!formData.address.trim()) {
            newErrors.address = t('playgrounds.validation.addressRequired');
        }

        if (formData.latitude === 0 || formData.longitude === 0) {
            newErrors.coordinates = t('playgrounds.validation.coordinatesRequired');
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

            {/* City */}
            <div>
                <label htmlFor="cityId" className="block text-sm font-medium mb-2">
                    {t('cities.city')} *
                </label>
                <select
                    id="cityId"
                    value={formData.cityId || ''}
                    onChange={(e) => handleInputChange('cityId', parseInt(e.target.value) || 0)}
                    className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                        errors.cityId ? 'border-red-500' : 'border-gray-600'
                    } focus:border-gold focus:outline-none`}
                    disabled={isLoadingCities}
                >
                    <option value="">
                        {isLoadingCities ? t('common.loading') : t('cities.selectCity')}
                    </option>
                    {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
                {errors.cityId && <p className="text-red-500 text-sm mt-1">{errors.cityId}</p>}
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

                {/* Field Size */}
                <div>
                    <label htmlFor="fieldSize" className="block text-sm font-medium mb-2">
                        {t('playgrounds.fieldSize')} *
                    </label>
                    <input
                        type="text"
                        id="fieldSize"
                        value={formData.fieldSize}
                        onChange={(e) => handleInputChange('fieldSize', e.target.value)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.fieldSize ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                        placeholder={t('playgrounds.fieldSizePlaceholder')}
                    />
                    {errors.fieldSize && <p className="text-red-500 text-sm mt-1">{errors.fieldSize}</p>}
                </div>
            </div>

            {/* Field Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fieldCoverType" className="block text-sm font-medium mb-2">
                        {t('playgrounds.fieldCoverType')} *
                    </label>
                    <select
                        id="fieldCoverType"
                        value={formData.fieldCoverType}
                        onChange={(e) => handleInputChange('fieldCoverType', e.target.value)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.fieldCoverType ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                    >
                        <option value="">{t('playgrounds.selectFieldCoverType')}</option>
                        <option value="OUTDOOR">{t('playgrounds.fieldCoverTypes.outdoor')}</option>
                        <option value="INDOOR">{t('playgrounds.fieldCoverTypes.indoor')}</option>
                        <option value="SEMI_COVERED">{t('playgrounds.fieldCoverTypes.semiCovered')}</option>
                    </select>
                    {errors.fieldCoverType && <p className="text-red-500 text-sm mt-1">{errors.fieldCoverType}</p>}
                </div>

                <div>
                    <label htmlFor="fieldSurfaceType" className="block text-sm font-medium mb-2">
                        {t('playgrounds.fieldSurfaceType')} *
                    </label>
                    <select
                        id="fieldSurfaceType"
                        value={formData.fieldSurfaceType}
                        onChange={(e) => handleInputChange('fieldSurfaceType', e.target.value)}
                        className={`w-full p-2 border rounded-md bg-darkest-bg text-white ${
                            errors.fieldSurfaceType ? 'border-red-500' : 'border-gray-600'
                        } focus:border-gold focus:outline-none`}
                    >
                        <option value="">{t('playgrounds.selectFieldSurfaceType')}</option>
                        <option value="ARTIFICIAL_GRASS">{t('playgrounds.fieldSurfaceTypes.artificialGrass')}</option>
                        <option value="NATURAL_GRASS">{t('playgrounds.fieldSurfaceTypes.naturalGrass')}</option>
                        <option value="CONCRETE">{t('playgrounds.fieldSurfaceTypes.concrete')}</option>
                        <option value="RUBBER">{t('playgrounds.fieldSurfaceTypes.rubber')}</option>
                        <option value="SAND">{t('playgrounds.fieldSurfaceTypes.sand')}</option>
                    </select>
                    {errors.fieldSurfaceType && <p className="text-red-500 text-sm mt-1">{errors.fieldSurfaceType}</p>}
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

            {/* Address */}
            <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                    {t('playgrounds.address')} *
                </label>
                <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border ${
                        errors.address ? 'border-red-500' : 'border-gray-600'
                    } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder={t('playgrounds.addressPlaceholder')}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Location Picker */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    {t('playgrounds.location')} *
                </label>
                <div className="flex items-center space-x-2">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={formData.latitude && formData.longitude ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}` : ''}
                            placeholder={t('playgrounds.coordinatesPlaceholder')}
                            readOnly
                            className="w-full px-3 py-2 rounded-md border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMapPickerOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        📍 {t('playgrounds.selectOnMap')}
                    </button>
                </div>
                {errors.coordinates && <p className="text-red-500 text-sm mt-1">{errors.coordinates}</p>}
            </div>

            {/* Map Picker Modal */}
            <YandexMapPicker
                isOpen={isMapPickerOpen}
                onClose={() => setIsMapPickerOpen(false)}
                onLocationSelect={(lat: number, lng: number) => {
                    handleInputChange('latitude', lat);
                    handleInputChange('longitude', lng);
                }}
                initialLat={formData.latitude || 51.1694}
                initialLng={formData.longitude || 71.4491}
            />

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
