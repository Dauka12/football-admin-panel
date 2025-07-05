import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCountriesStore } from '../../store/countriesStore';
import CountriesList from './CountriesList';
import CountryForm from './CountryForm';
import type { Country, CountryFilters } from '../../types/countries';

const CountriesManager: React.FC = () => {
    const { t } = useTranslation();
    
    // Store selectors
    const countries = useCountriesStore(state => state.countries);
    const selectedCountry = useCountriesStore(state => state.selectedCountry);
    const isLoading = useCountriesStore(state => state.isLoading);
    const error = useCountriesStore(state => state.error);
    const totalPages = useCountriesStore(state => state.totalPages);
    const currentPage = useCountriesStore(state => state.currentPage);
    
    // Store actions
    const fetchCountries = useCountriesStore(state => state.fetchCountries);
    const fetchCountryById = useCountriesStore(state => state.fetchCountryById);
    const createCountry = useCountriesStore(state => state.createCountry);
    const updateCountry = useCountriesStore(state => state.updateCountry);
    const deleteCountry = useCountriesStore(state => state.deleteCountry);
    const clearError = useCountriesStore(state => state.clearError);

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState<Country | null>(null);

    // Filter States
    const [filters, setFilters] = useState<CountryFilters>({
        page: 0,
        size: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        fetchCountries(filters);
    }, [filters]);

    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            name: searchTerm || undefined,
            active: activeFilter,
            page: 0
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleCreateCountry = async (data: any) => {
        const success = await createCountry(data);
        if (success) {
            setIsCreateModalOpen(false);
        }
    };

    const handleEditCountry = async (data: any) => {
        if (!editingCountry) return;
        
        const success = await updateCountry(editingCountry.id, data);
        if (success) {
            setIsEditModalOpen(false);
            setEditingCountry(null);
        }
    };

    const handleDeleteCountry = async (country: Country) => {
        if (window.confirm(t('countries.confirmDelete', { name: country.name }))) {
            await deleteCountry(country.id);
        }
    };

    const handleEditClick = (country: Country) => {
        setEditingCountry(country);
        setIsEditModalOpen(true);
    };

    const handleViewClick = async (country: Country) => {
        await fetchCountryById(country.id);
        setIsViewModalOpen(true);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setActiveFilter(undefined);
        setFilters({
            page: 0,
            size: 10
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {t('countries.title')}
                    </h2>
                    <p className="text-gray-400 mt-1">
                        {t('countries.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-gold text-darkest-bg rounded hover:bg-gold/90 transition-colors"
                >
                    + {t('countries.createCountry')}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={clearError}
                        className="text-red-400 hover:text-red-300"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">{t('common.filters')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {t('common.search')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('countries.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {t('common.status')}
                        </label>
                        <select
                            value={activeFilter === undefined ? '' : activeFilter.toString()}
                            onChange={(e) => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="true">{t('common.active')}</option>
                            <option value="false">{t('common.inactive')}</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-gold text-darkest-bg rounded hover:bg-gold/90 transition-colors"
                    >
                        {t('common.search')}
                    </button>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                        {t('common.reset')}
                    </button>
                </div>
            </div>

            {/* Countries List */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                <CountriesList
                    countries={countries}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteCountry}
                    onView={handleViewClick}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium text-white mb-4">
                            {t('countries.createCountry')}
                        </h3>
                        <CountryForm
                            onSubmit={handleCreateCountry}
                            onCancel={() => setIsCreateModalOpen(false)}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingCountry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium text-white mb-4">
                            {t('countries.editCountry')}
                        </h3>
                        <CountryForm
                            initialData={editingCountry}
                            onSubmit={handleEditCountry}
                            onCancel={() => {
                                setIsEditModalOpen(false);
                                setEditingCountry(null);
                            }}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedCountry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-white">
                                {t('countries.viewCountry')}
                            </h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
                                    <span className="text-gold text-xl font-bold">
                                        {selectedCountry.isoCode2}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{selectedCountry.name}</h4>
                                    <p className="text-gray-400">{selectedCountry.code}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">{t('countries.fields.isoCode2')}</p>
                                    <p className="text-white font-mono">{selectedCountry.isoCode2}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{t('common.status')}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        selectedCountry.active 
                                            ? 'bg-green-900/20 text-green-400' 
                                            : 'bg-red-900/20 text-red-400'
                                    }`}>
                                        {selectedCountry.active ? t('common.active') : t('common.inactive')}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-400">{t('countries.fields.cities')}</p>
                                <p className="text-white">{selectedCountry.cities?.length || 0} {t('countries.fields.cities')}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">{t('common.createdAt')}</p>
                                    <p className="text-white">{new Date(selectedCountry.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{t('common.updatedAt')}</p>
                                    <p className="text-white">{new Date(selectedCountry.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountriesManager;
