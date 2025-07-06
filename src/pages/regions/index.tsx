import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCityStore } from '../../store/cityStore';

interface RegionData {
    name: string;
    country: string;
    cities: Array<{
        id: number;
        name: string;
        active: boolean;
    }>;
    totalCities: number;
    activeCities: number;
}

const RegionsPage: React.FC = () => {
    const { t } = useTranslation();
    const { cities, isLoading, error, fetchCities } = useCityStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');

    useEffect(() => {
        fetchCities(0, 1000); // Получаем больше городов для полной картины
    }, [fetchCities]);

    // Группируем города по регионам
    const regionsData = useMemo(() => {
        const regionsMap = new Map<string, RegionData>();

        cities.forEach(city => {
            // Добавляем логирование для отладки
            console.log('Processing city:', city);
            
            // Проверяем, что region и country существуют
            if (!city.region || !city.country) {
                console.warn('City missing region or country:', city);
                return; // Пропускаем города без региона или страны
            }

            const regionKey = `${city.region}-${city.country}`;
            
            if (!regionsMap.has(regionKey)) {
                regionsMap.set(regionKey, {
                    name: city.region,
                    country: city.country,
                    cities: [],
                    totalCities: 0,
                    activeCities: 0
                });
            }

            const regionData = regionsMap.get(regionKey)!;
            regionData.cities.push({
                id: city.id,
                name: city.name,
                active: city.active
            });
            regionData.totalCities++;
            if (city.active) {
                regionData.activeCities++;
            }
        });

        const result = Array.from(regionsMap.values());
        console.log('Regions data:', result);
        return result;
    }, [cities]);

    // Фильтрация регионов
    const filteredRegions = useMemo(() => {
        let filtered = regionsData;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(region =>
                region.name.toLowerCase().includes(query) ||
                region.country.toLowerCase().includes(query)
            );
        }

        if (selectedCountry) {
            filtered = filtered.filter(region => region.country === selectedCountry);
        }

        return filtered.sort((a, b) => {
            // Добавляем проверку на null/undefined
            console.log('Sorting regions:', a, b);
            
            const countryA = a.country || '';
            const countryB = b.country || '';
            const nameA = a.name || '';
            const nameB = b.name || '';
            
            if (countryA !== countryB) {
                return countryA.localeCompare(countryB);
            }
            return nameA.localeCompare(nameB);
        });
    }, [regionsData, searchQuery, selectedCountry]);

    // Получаем уникальные страны для фильтра
    const countries = useMemo(() => {
        const uniqueCountries = [...new Set(regionsData.map(region => region.country))];
        return uniqueCountries.sort();
    }, [regionsData]);

    const totalRegions = regionsData.length;
    const totalCities = regionsData.reduce((sum, region) => sum + region.totalCities, 0);
    const totalActiveCities = regionsData.reduce((sum, region) => sum + region.activeCities, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('sidebar.regions')}</h1>
                    <p className="text-gray-400 mt-1">
                        {t('regions.description')}
                    </p>
                </div>
                <Link
                    to="/dashboard/cities"
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('regions.manageCities')}
                </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">{t('regions.totalRegions')}</p>
                            <p className="text-2xl font-bold text-white">{totalRegions}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">{t('regions.totalCities')}</p>
                            <p className="text-2xl font-bold text-white">{totalCities}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-gold/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">{t('regions.activeCities')}</p>
                            <p className="text-2xl font-bold text-white">{totalActiveCities}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1 w-full lg:w-auto">
                    <input
                        type="text"
                        placeholder={t('regions.searchByRegion')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-card-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Country filter */}
                <div className="w-full lg:w-auto">
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full lg:w-48 px-4 py-3 bg-card-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                    >
                        <option value="">{t('regions.allCountries')}</option>
                        {countries.map((country) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {!isLoading && filteredRegions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-1">
                        {searchQuery || selectedCountry ? t('regions.noResultsFound') : t('regions.noRegions')}
                    </h3>
                    {!searchQuery && !selectedCountry && (
                        <p className="text-gray-400 mb-4">{t('regions.createFirstCity')}</p>
                    )}
                </div>
            ) : (
                <>
                    {/* Regions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRegions.map((region) => (
                            <div key={`${region.name}-${region.country}`} className="bg-card-bg rounded-lg border border-gray-700 p-6 hover:border-gold/50 transition-colors duration-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white">{region.name}</h3>
                                        <p className="text-sm text-gray-400">{region.country}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">{t('regions.cities')}</div>
                                        <div className="text-xl font-bold text-gold">{region.totalCities}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-400">{t('regions.activeCities')}</span>
                                    <span className="text-sm font-medium text-green-400">
                                        {region.activeCities}/{region.totalCities}
                                    </span>
                                </div>

                                {region.cities.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs text-gray-400 mb-2">{t('regions.citiesList')}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {region.cities.slice(0, 3).map((city) => (
                                                <Link
                                                    key={city.id}
                                                    to={`/dashboard/cities/${city.id}`}
                                                    className={`text-xs px-2 py-1 rounded-md transition-colors duration-200 ${
                                                        city.active 
                                                            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                                                            : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                                                    }`}
                                                >
                                                    {city.name}
                                                </Link>
                                            ))}
                                            {region.cities.length > 3 && (
                                                <span className="text-xs px-2 py-1 bg-gray-600/20 text-gray-400 rounded-md">
                                                    +{region.cities.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Link
                                        to={`/dashboard/cities?region=${encodeURIComponent(region.name)}&country=${encodeURIComponent(region.country)}`}
                                        className="text-gold hover:text-gold/80 text-sm font-medium transition-colors duration-200"
                                    >
                                        {t('regions.viewCities')} →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RegionsPage;
