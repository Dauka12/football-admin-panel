import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountriesManager from '../../components/countries/CountriesManager';

const CountriesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-white"
                    >
                        ← {t('common.back')}
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {t('countries.title')}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {t('countries.pageDescription')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Countries Manager */}
            <CountriesManager />
        </div>
    );
};

export default CountriesPage;
