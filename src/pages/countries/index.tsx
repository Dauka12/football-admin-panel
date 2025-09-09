import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountriesManager from '../../components/countries/CountriesManager';

const CountriesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 py-8">

            {/* Countries Manager */}
            <CountriesManager />
        </div>
    );
};

export default CountriesPage;
