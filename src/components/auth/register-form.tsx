import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth';
import { validateName, validatePassword, validatePhone } from '../../utils/validation';

export const RegisterForm: React.FC = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const [firstnameError, setFirstnameError] = useState<string | null>(null);
    const [lastnameError, setLastnameError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const { register, isLoading, error } = useAuthStore();
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const firstnameValidation = !firstname ? t('validations.nameRequired') : validateName(firstname) ? t('validations.nameShort') : null;
        const lastnameValidation = !lastname ? t('validations.nameRequired') : validateName(lastname) ? t('validations.nameShort') : null;
        const phoneValidation = !phone ? t('validations.phoneRequired') : validatePhone(phone) ? t('validations.phoneInvalid') : null;
        const passwordValidation = !password ? t('validations.passwordRequired') : validatePassword(password) ? t('validations.passwordShort') : null;

        setFirstnameError(firstnameValidation);
        setLastnameError(lastnameValidation);
        setPhoneError(phoneValidation);
        setPasswordError(passwordValidation);

        if (!firstnameValidation && !lastnameValidation && !phoneValidation && !passwordValidation) {
            register(firstname, lastname, phone, password);
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
                            className={`form-input ${firstnameError ? 'border-red-500' : ''}`}
                            value={firstname}
                            onChange={(e) => {
                                setFirstname(e.target.value);
                                setFirstnameError(null);
                            }}
                        />
                        {firstnameError && <p className="text-red-500 text-xs mt-1">{firstnameError}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block" htmlFor="lastname">
                            {t('auth.lastname')}
                        </label>
                        <input
                            id="lastname"
                            type="text"
                            placeholder={t('auth.lastname')}
                            className={`form-input ${lastnameError ? 'border-red-500' : ''}`}
                            value={lastname}
                            onChange={(e) => {
                                setLastname(e.target.value);
                                setLastnameError(null);
                            }}
                        />
                        {lastnameError && <p className="text-red-500 text-xs mt-1">{lastnameError}</p>}
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
                        className={`form-input ${phoneError ? 'border-red-500' : ''}`}
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value);
                            setPhoneError(null);
                        }}
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium block" htmlFor="register-password">
                        {t('auth.password')}
                    </label>
                    <input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className={`form-input ${passwordError ? 'border-red-500' : ''}`}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(null);
                        }}
                    />
                    {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
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
