import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { validatePassword, validatePhone } from '../../utils/validation';

export const LoginForm: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const { login, isLoading, error } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate(); // Use React Router's navigation

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const phoneValidation = !phone ? t('validations.phoneRequired') : validatePhone(phone) ? t('validations.phoneInvalid') : null;
        const passwordValidation = !password ? t('validations.passwordRequired') : validatePassword(password) ? t('validations.passwordShort') : null;

        setPhoneError(phoneValidation);
        setPasswordError(passwordValidation);

        if (!phoneValidation && !passwordValidation) {
            const success = await login(phone, password);
            if (success) {
                // Use React Router for navigation instead of window.location
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="space-y-6 transition-opacity duration-300">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gold">{t('auth.loginTitle')}</h1>
                <p className="text-gray-400 mt-2">{t('auth.loginSubtitle')}</p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex justify-between">
                        <label className="text-sm font-medium" htmlFor="password">
                            {t('auth.password')}
                        </label>
                        <a href="#" className="text-xs text-gold hover:underline">
                            {t('auth.forgotPassword')}
                        </a>
                    </div>
                    <input
                        id="password"
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
                    className="btn-primary mt-2"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('auth.loggingIn')}
                        </span>
                    ) : t('auth.loginButton')}
                </button>
            </form>
        </div>
    );
};
