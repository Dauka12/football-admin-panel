import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SportTypeForm from '../../components/sportTypes/SportTypeForm';
import Modal from '../../components/ui/Modal';
import { useSportTypeStore } from '../../store/sportTypeStore';
import type { SportTypeCreateRequest } from '../../types/sportTypes';

const SportTypesPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        sportTypes,
        isLoading,
        error,
        fetchSportTypes,
        createSportType,
        deleteSportType,
        totalPages,
        currentPage,
        pageSize,
        filters,
        setFilters
    } = useSportTypeStore();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [sportTypeToDelete, setSportTypeToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    
    // Filter state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterTeamBased, setFilterTeamBased] = useState<boolean | undefined>(filters.teamBased);
    const [filterActive, setFilterActive] = useState<boolean | undefined>(filters.active);

    // Load sport types on component mount
    useEffect(() => {
        fetchSportTypes(page, pageSize);
    }, [fetchSportTypes, page, pageSize]);

    // Sync local filter state with store filters
    useEffect(() => {
        setFilterTeamBased(filters.teamBased);
        setFilterActive(filters.active);
        if (filters.name) {
            setSearchQuery(filters.name);
        }
    }, [filters]);

    // Apply filters
    const applyFilters = () => {
        const newFilters = {
            name: searchQuery || undefined,
            teamBased: filterTeamBased,
            active: filterActive
        };
        setFilters(newFilters);
        fetchSportTypes(0, pageSize);
        setPage(0);
        setIsFilterOpen(false);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setFilterTeamBased(undefined);
        setFilterActive(undefined);
        setFilters({});
        fetchSportTypes(0, pageSize);
        setPage(0);
        setIsFilterOpen(false);
    };

    const handleCreateSportType = async (data: SportTypeCreateRequest) => {
        const success = await createSportType(data);
        if (success) {
            setShowCreateForm(false);
        }
    };

    const handleDeleteSportType = async () => {
        if (sportTypeToDelete) {
            const success = await deleteSportType(sportTypeToDelete);
            if (success) {
                setSportTypeToDelete(null);
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchSportTypes(newPage, pageSize);
    };

    if (isLoading && sportTypes.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                        {t('sportTypes.title')}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{t('sportTypes.subtitle') || 'Manage sport types and their configurations'}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="bg-card-bg border border-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                        </svg>
                        {t('common.filter')}
                    </button>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gold text-darkest-bg px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors duration-200 flex items-center gap-2 font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('sportTypes.createSportType')}
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500 mb-6">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={t('sportTypes.searchByName') || 'Search by name...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                        className="w-full pl-10 pr-4 py-3 bg-card-bg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    />
                </div>
            </div>

            {/* Sport Types Grid */}
            {sportTypes.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                    <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('sportTypes.noSportTypes')}</h3>
                    <p className="text-gray-500 mb-6">{t('sportTypes.createFirst')}</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                    >
                        {t('sportTypes.createSportType')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-card-bg rounded-lg shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-darkest-bg">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportTypes.name')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportTypes.description')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportTypes.teamBased')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportTypes.teamSize')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {sportTypes.map((sportType) => (
                                    <tr key={sportType.id} className="hover:bg-darkest-bg/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-white">{sportType.name}</div>
                                                    <div className="text-xs text-gray-400">ID: {sportType.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300 max-w-xs truncate">
                                                {sportType.description || t('common.noDescription')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                sportType.teamBased 
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                            }`}>
                                                {sportType.teamBased ? t('common.yes') : t('common.no')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {sportType.teamBased 
                                                ? `${sportType.minTeamSize} - ${sportType.maxTeamSize}`
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/dashboard/sport-types/${sportType.id}`}
                                                    className="text-gold hover:text-gold/80 transition-colors"
                                                >
                                                    {t('common.viewDetails')}
                                                </Link>
                                                <button
                                                    onClick={() => setSportTypeToDelete(sportType.id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
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

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                        {sportTypes.map((sportType) => (
                            <div key={sportType.id} className="bg-card-bg rounded-lg p-4 shadow-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-medium text-white">{sportType.name}</h3>
                                        <p className="text-xs text-gray-400">ID: {sportType.id}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        sportType.active 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                        {sportType.active ? t('common.active') : t('common.inactive')}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                    {sportType.description || t('common.noDescription')}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-400">{t('sportTypes.teamBased')}:</span>
                                        <span className="ml-1 text-white">
                                            {sportType.teamBased ? t('common.yes') : t('common.no')}
                                        </span>
                                    </div>
                                    {sportType.teamBased && (
                                        <div>
                                            <span className="text-gray-400">{t('sportTypes.teamSize')}:</span>
                                            <span className="ml-1 text-white">
                                                {sportType.minTeamSize} - {sportType.maxTeamSize}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <Link
                                        to={`/dashboard/sport-types/${sportType.id}`}
                                        className="flex-1 bg-gold text-darkest-bg px-3 py-2 rounded text-center text-sm font-medium hover:bg-gold/90 transition-colors"
                                    >
                                        {t('common.viewDetails')}
                                    </Link>
                                    <button
                                        onClick={() => setSportTypeToDelete(sportType.id)}
                                        className="bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                    >
                                        {t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('common.previous')}
                            </button>
                            <span className="px-4 py-2 text-gray-400">
                                {t('common.page')} {currentPage + 1} {t('common.of')} {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Sport Type Modal */}
            <Modal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title={t('sportTypes.createSportType')}
            >
                <SportTypeForm
                    onSubmit={handleCreateSportType}
                    onCancel={() => setShowCreateForm(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={sportTypeToDelete !== null}
                onClose={() => setSportTypeToDelete(null)}
                title={t('sportTypes.confirmDelete')}
            >
                <div className="p-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">{t('common.warning')}</h3>
                    <p className="text-gray-300 text-center mb-8 leading-relaxed">
                        {t('sportTypes.deleteWarning')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                            onClick={() => setSportTypeToDelete(null)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteSportType}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Filter Modal */}
            <Modal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={t('common.filterOptions')}
            >
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('sportTypes.teamBased')}
                        </label>
                        <select
                            value={filterTeamBased === undefined ? '' : filterTeamBased.toString()}
                            onChange={(e) => setFilterTeamBased(e.target.value === '' ? undefined : e.target.value === 'true')}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="true">{t('common.yes')}</option>
                            <option value="false">{t('common.no')}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('common.status')}
                        </label>
                        <select
                            value={filterActive === undefined ? '' : filterActive.toString()}
                            onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true')}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="true">{t('common.active')}</option>
                            <option value="false">{t('common.inactive')}</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
                        <button
                            onClick={resetFilters}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.reset')}
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-6 py-3 bg-gold text-darkest-bg rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                        >
                            {t('common.apply')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SportTypesPage;
