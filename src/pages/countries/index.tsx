import React from 'react';
import CountriesManager from '../../components/countries/CountriesManager';

const CountriesPage: React.FC = () => {

    return (
        <div className="container mx-auto px-4 py-8">
            <CountriesManager />
        </div>
    );
};

export default CountriesPage;
