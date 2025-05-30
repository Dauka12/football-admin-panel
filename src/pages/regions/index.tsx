import React from 'react';
import { useTranslation } from 'react-i18next';

const RegionsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">{t('sidebar.regions')}</h1>
            </div>

            <div className="bg-card-bg rounded-lg border border-darkest-bg p-6">
                <div className="text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gold">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-white mb-2">Управление регионами</h3>
                    <p className="text-gray-400">Эта страница находится в разработке</p>
                </div>
            </div>
        </div>
    );
};

export default RegionsPage;
