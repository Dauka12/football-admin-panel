import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                className={`text-sm px-2 py-1 rounded-md ${i18n.language === 'en' ? 'bg-gold text-darkest-bg font-medium' : 'text-gray-400 hover:text-white'}`}
                onClick={() => changeLanguage('en')}
            >
                {t('languages.en')}
            </button>
            <button
                className={`text-sm px-2 py-1 rounded-md ${i18n.language === 'ru' ? 'bg-gold text-darkest-bg font-medium' : 'text-gray-400 hover:text-white'}`}
                onClick={() => changeLanguage('ru')}
            >
                {t('languages.ru')}
            </button>
        </div>
    );
};

export default React.memo(LanguageSwitcher);
