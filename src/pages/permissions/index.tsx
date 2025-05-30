import React from 'react';
import { useTranslation } from 'react-i18next';

const PermissionsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">{t('sidebar.permissions')}</h1>
            </div>

            <div className="bg-card-bg rounded-lg border border-darkest-bg p-6">
                <div className="text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gold">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <h3 className="text-lg font-medium text-white mb-2">Управление правами</h3>
                    <p className="text-gray-400">Эта страница находится в разработке</p>
                </div>
            </div>
        </div>
    );
};

export default PermissionsPage;
