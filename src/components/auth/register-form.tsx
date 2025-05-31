import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth';
import { authValidators, useFormValidation } from '../../utils/validation';

export const RegisterForm: React.FC = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const { register, isLoading, error } = useAuthStore();
    const { t } = useTranslation();

    // Use the new validation system
    const { errors, validateField, validateForm, clearErrors } = useFormValidation(
        authValidators.register
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateForm({ firstname, lastname, phone, password });
        if (isValid) {
            const success = await register(firstname, lastname, phone, password);
            if (success) {
                clearErrors();
                // Form will reset and show success message via toast
            }
        }
    };

    const handleFieldChange = (field: 'firstname' | 'lastname' | 'phone' | 'password', value: string, setter: (value: string) => void) => {
        setter(value);
        if (errors[field]) {
            validateField(field, value);
        }
    };

    return (
        <div className="space-y-6 transition-opacity duration-300">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gold">{t('auth.registerTitle')}</h1>
                <p className="text-gray-400 mt-2">{t('auth.registerSubtitle')}</p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium block" htmlFor="firstname">
                            {t('auth.firstname')}
                        </label>
                        <input
                            id="firstname"
                            type="text"
                            placeholder={t('auth.firstname')}
                            className={`form-input ${errors.firstname ? 'border-red-500' : ''}`}
                            value={firstname}
                            onChange={(e) => handleFieldChange('firstname', e.target.value, setFirstname)}
                            onBlur={() => validateField('firstname', firstname)}
                        />
                        {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block" htmlFor="lastname">
                            {t('auth.lastname')}
                        </label>
                        <input
                            id="lastname"
                            type="text"
                            placeholder={t('auth.lastname')}
                            className={`form-input ${errors.lastname ? 'border-red-500' : ''}`}
                            value={lastname}
                            onChange={(e) => handleFieldChange('lastname', e.target.value, setLastname)}
                            onBlur={() => validateField('lastname', lastname)}
                        />
                        {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium block" htmlFor="phone">
                        {t('auth.phone')}
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                        value={phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value, setPhone)}
                        onBlur={() => validateField('phone', phone)}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium block" htmlFor="register-password">
                        {t('auth.password')}
                    </label>
                    <input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                        onBlur={() => validateField('password', password)}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-secondary mt-2"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('auth.creatingAccount')}
                        </span>
                    ) : t('auth.registerButton')}
                </button>
            </form>
        </div>
    );
};
