import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CityForm from '../../components/cities/CityForm';
import Modal from '../../components/ui/Modal';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useCityStore } from '../../store/cityStore';
import type { CityCreateRequest, CityFilterParams } from '../../types/cities';

const CitiesPage: React.FC = () => {
    // Performance monitoring
    usePerformanceMonitor('CitiesPage');

    const { t } = useTranslation();
    const { 
        cities, 
        isLoading, 
        error, 
        fetchCities, 
        deleteCity, 
        createCity, 
        totalElements,
        totalPages,
        pageSize,
        filters,
        setFilters 
    } = useCityStore();
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [cityToDelete, setCityToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);

    // Filter state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterName, setFilterName] = useState(filters.name || '');
    const [filterCountry, setFilterCountry] = useState(filters.country || '');
    const [filterRegion, setFilterRegion] = useState(filters.region || '');
    const [filterActive, setFilterActive] = useState<boolean | undefined>(filters.active);

    // Memoized filtered cities to avoid recalculation on every render
    const filteredCities = useMemo(() => {
        if (!cities) return [];
        
        if (!searchQuery.trim()) return cities;
        
        const query = searchQuery.toLowerCase();
        return cities.filter(city =>
            city.name.toLowerCase().includes(query) ||
            city.country.toLowerCase().includes(query) ||
            city.region.toLowerCase().includes(query) ||
            city.description.toLowerCase().includes(query)
        );
    }, [cities, searchQuery]);

    // Ensure we fetch cities on mount and when returning to page
    useEffect(() => {
        // Fetch cities with pagination and filters
        fetchCities(page, pageSize);
    }, [fetchCities, page, pageSize, filters]);

    // Apply filters and fetch cities
    const applyFilters = () => {
        const newFilters: CityFilterParams = {};
        
        if (filterName) newFilters.name = filterName;
        if (filterCountry) newFilters.country = filterCountry;
        if (filterRegion) newFilters.region = filterRegion;
        if (filterActive !== undefined) newFilters.active = filterActive;
        
        setFilters(newFilters);
        // Reset to first page when applying new filters
        setPage(0);
        fetchCities(0, pageSize);
        setIsFilterOpen(false);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilterName('');
        setFilterCountry('');
        setFilterRegion('');
        setFilterActive(undefined);
        setFilters({});
        setPage(0);
        fetchCities(0, pageSize);
    };

    const handleCreateCity = async (data: CityCreateRequest) => {
        const success = await createCity(data);
        if (success) {
            setShowCreateForm(false);
            // Force refresh the cities list after creation
            await fetchCities(page, pageSize);
        }
    };

    const handleConfirmDelete = async () => {
        if (cityToDelete !== null) {
            const success = await deleteCity(cityToDelete);
            if (success) {
                setCityToDelete(null);
                // Refresh the cities list after deletion
                await fetchCities(page, pageSize);
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h1 className="text-2xl font-bold">{t('cities.title')}</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('cities.createCity')}
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-6">
                {/* Search input */}
                <div className="relative flex-1 w-full lg:w-auto">
                    <input
                        type="text"
                        placeholder={t('cities.searchByName')}
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

                {/* Filter button */}
                <div className="flex space-x-2 w-full lg:w-auto">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                            Object.keys(filters).length > 0 
                            ? 'bg-gold text-darkest-bg' 
                            : 'bg-card-bg border border-gray-700 text-white hover:bg-gray-700'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {t('common.filter')} {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
                    </button>
                    
                    {Object.keys(filters).length > 0 && (
                        <button
                            onClick={resetFilters}
                            className="bg-accent-pink text-white px-4 py-2 rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.reset')}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
                <div className="bg-card-bg border border-gray-700 rounded-lg p-4 mb-6 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4">{t('common.filterOptions')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* City Name filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('cities.name')}</label>
                            <input
                                type="text"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder={t('cities.name')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                        
                        {/* Country filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('cities.country')}</label>
                            <input
                                type="text"
                                value={filterCountry}
                                onChange={(e) => setFilterCountry(e.target.value)}
                                placeholder={t('cities.country')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                        
                        {/* Region filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('cities.region')}</label>
                            <input
                                type="text"
                                value={filterRegion}
                                onChange={(e) => setFilterRegion(e.target.value)}
                                placeholder={t('cities.region')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                        
                        {/* Active Status filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('common.status')}</label>
                            <select
                                value={filterActive === undefined ? '' : filterActive.toString()}
                                onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            >
                                <option value="">{t('common.all')}</option>
                                <option value="true">{t('common.active')}</option>
                                <option value="false">{t('common.inactive')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-gold text-darkest-bg hover:bg-gold/90 rounded-md transition-colors duration-200"
                        >
                            {t('common.apply')}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500 mb-4">
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

            {!isLoading && filteredCities.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-1">
                        {searchQuery ? t('common.noResultsFound') : t('cities.noCities')}
                    </h3>
                    {!searchQuery && (
                        <p className="text-gray-400 mb-4">{t('cities.createFirst')}</p>
                    )}
                    {!searchQuery && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                        >
                            {t('cities.createCity')}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Cities Table */}
                    <div className="bg-card-bg rounded-lg overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-darkest-bg border-b border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {t('cities.name')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {t('cities.country')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {t('cities.region')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {t('cities.coordinates')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {t('common.status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredCities.map((city) => (
                                        <tr key={city.id} className="hover:bg-gray-800 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-white">{city.name}</div>
                                                    {city.description && (
                                                        <div className="text-sm text-gray-400 truncate max-w-xs">
                                                            {city.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {city.country}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {city.region}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    city.active 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {city.active ? t('common.active') : t('common.inactive')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/dashboard/cities/${city.id}`}
                                                        className="text-gold hover:text-gold/80 transition-colors duration-200"
                                                    >
                                                        {t('common.viewDetails')}
                                                    </Link>
                                                    <button
                                                        onClick={() => setCityToDelete(city.id)}
                                                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                                    >
                                                        {t('common.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-400">
                                {t('common.showing')} {Math.min((page * pageSize) + 1, totalElements)} {t('common.to')} {Math.min((page + 1) * pageSize, totalElements)} {t('common.of')} {totalElements}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                    className="px-3 py-1 text-sm bg-card-bg border border-gray-700 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {t('common.previous')}
                                </button>
                                <span className="px-3 py-1 text-sm">
                                    {t('common.page')} {page + 1} {t('common.of')} {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="px-3 py-1 text-sm bg-card-bg border border-gray-700 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {t('common.next')}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create City Modal */}
            <Modal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title={t('cities.createCity')}
            >
                <CityForm
                    onSubmit={handleCreateCity}
                    onCancel={() => setShowCreateForm(false)}
                    isSubmitting={isLoading}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={cityToDelete !== null}
                onClose={() => setCityToDelete(null)}
                title={t('cities.confirmDelete')}
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        {t('cities.deleteWarning')}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setCityToDelete(null)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CitiesPage;
