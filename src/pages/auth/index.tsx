import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../../components/auth/login-form';
import { RegisterForm } from '../../components/auth/register-form';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AuthPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [isAnimating, setIsAnimating] = useState(false);
    const { t } = useTranslation();

    const handleTabChange = (tab: 'login' | 'register') => {
        if (tab === activeTab || isAnimating) return;

        setIsAnimating(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsAnimating(false);
        }, 300); // Match this with your CSS transition duration
    };

    return (
        <div className="min-h-screen bg-darkest-bg flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-gold rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-darkest-bg">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="10 8 16 12 10 16 10 8" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gold">{t('appTitle')}</span>
                    </div>

                    <LanguageSwitcher />
                </div>

                <div className="auth-card">
                    <div className="flex mb-6 border-b border-gray-700">
                        <button
                            className={`pb-2 px-4 text-sm font-medium transition-all duration-300 ${activeTab === 'login'
                                    ? 'text-gold border-b-2 border-gold'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                            onClick={() => handleTabChange('login')}
                        >
                            {t('auth.login')}
                        </button>
                        <button
                            className={`pb-2 px-4 text-sm font-medium transition-all duration-300 ${activeTab === 'register'
                                    ? 'text-gold border-b-2 border-gold'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                            onClick={() => handleTabChange('register')}
                        >
                            {t('auth.register')}
                        </button>
                    </div>

                    <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-400">
                        {activeTab === 'login'
                            ? t('auth.noAccount')
                            : t('auth.haveAccount')}
                        <button
                            className="text-gold hover:underline ml-1"
                            onClick={() => handleTabChange(activeTab === 'login' ? 'register' : 'login')}
                        >
                            {activeTab === 'login' ? t('auth.register') : t('auth.login')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
