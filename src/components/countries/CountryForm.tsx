import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Country, CreateCountryRequest, UpdateCountryRequest } from '../../types/countries';

interface CountryFormProps {
    initialData?: Country;
    onSubmit: (data: CreateCountryRequest | UpdateCountryRequest) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const CountryForm: React.FC<CountryFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<CreateCountryRequest>({
        name: '',
        code: '',
        isoCode2: '',
        active: true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                code: initialData.code,
                isoCode2: initialData.isoCode2,
                active: initialData.active
            });
        }
    }, [initialData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('countries.validation.nameRequired');
        }

        if (!formData.code.trim()) {
            newErrors.code = t('countries.validation.codeRequired');
        } else if (formData.code.length !== 3) {
            newErrors.code = t('countries.validation.codeLength');
        }

        if (!formData.isoCode2.trim()) {
            newErrors.isoCode2 = t('countries.validation.isoCode2Required');
        } else if (formData.isoCode2.length !== 2) {
            newErrors.isoCode2 = t('countries.validation.isoCode2Length');
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('countries.fields.name')} *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder={t('countries.placeholders.name')}
                    disabled={isLoading}
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
            </div>

            {/* Code Field */}
            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('countries.fields.code')} *
                </label>
                <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    maxLength={3}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                        errors.code ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder={t('countries.placeholders.code')}
                    disabled={isLoading}
                />
                {errors.code && (
                    <p className="mt-1 text-sm text-red-400">{errors.code}</p>
                )}
            </div>

            {/* ISO Code 2 Field */}
            <div>
                <label htmlFor="isoCode2" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('countries.fields.isoCode2')} *
                </label>
                <input
                    type="text"
                    id="isoCode2"
                    name="isoCode2"
                    value={formData.isoCode2}
                    onChange={handleChange}
                    maxLength={2}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                        errors.isoCode2 ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder={t('countries.placeholders.isoCode2')}
                    disabled={isLoading}
                />
                {errors.isoCode2 && (
                    <p className="mt-1 text-sm text-red-400">{errors.isoCode2}</p>
                )}
            </div>

            {/* Active Field */}
            <div>
                <label className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        className="w-4 h-4 text-gold bg-darkest-bg border-gray-600 rounded focus:ring-gold focus:ring-2"
                        disabled={isLoading}
                    />
                    <span className="text-sm font-medium text-gray-300">
                        {t('countries.fields.active')}
                    </span>
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                    disabled={isLoading}
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? t('common.loading') : (initialData ? t('common.update') : t('common.create'))}
                </button>
            </div>
        </form>
    );
};

export default CountryForm;
