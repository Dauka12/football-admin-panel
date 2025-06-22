import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SportClubFilterParams } from '../../api/sportClubs';
import SportClubForm from '../../components/sportClubs/SportClubForm';
import Modal from '../../components/ui/Modal';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useCityStore } from '../../store/cityStore';
import { useSportClubStore } from '../../store/sportClubStore';
import { useSportTypeStore } from '../../store/sportTypeStore';
import type { CreateSportClubRequest } from '../../types/sportClubs';

const SportClubsPage: React.FC = () => {
    // Performance monitoring
    usePerformanceMonitor('SportClubsPage');

    const { t } = useTranslation();
    const {
        sportClubs,
        isLoading,
        error,
        fetchSportClubs,
        deleteSportClub,
        createSportClub,
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        filters,
        setFilters
    } = useSportClubStore();

    const { cities, fetchCities } = useCityStore();
    const { sportTypes, fetchSportTypes } = useSportTypeStore();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [clubToDelete, setClubToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);

    // Filter state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterClubType, setFilterClubType] = useState<string | undefined>(filters.clubType);
    const [filterCityId, setFilterCityId] = useState<number | undefined>(filters.cityId);
    const [filterSportTypeId, setFilterSportTypeId] = useState<number | undefined>(filters.sportTypeId);
    const [filterActive, setFilterActive] = useState<boolean | undefined>(filters.active);

    // Load data on component mount
    useEffect(() => {
        fetchSportClubs(false, page, pageSize);
    }, [fetchSportClubs, page, pageSize]);

    // Load cities and sport types once on mount
    useEffect(() => {
        fetchCities();
        fetchSportTypes();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync local filter state with store filters
    useEffect(() => {
        setFilterClubType(filters.clubType);
        setFilterCityId(filters.cityId);
        setFilterSportTypeId(filters.sportTypeId);
        setFilterActive(filters.active);
        if (filters.name) {
            setSearchQuery(filters.name);
        }
    }, [filters]);

    // Apply filters
    const applyFilters = () => {
        const newFilters: SportClubFilterParams = {
            name: searchQuery || undefined,
            clubType: filterClubType as any,
            cityId: filterCityId,
            sportTypeId: filterSportTypeId,
            active: filterActive
        };
        setFilters(newFilters);
        fetchSportClubs(false, 0, pageSize, newFilters);
        setPage(0);
        setIsFilterOpen(false);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setFilterClubType(undefined);
        setFilterCityId(undefined);
        setFilterSportTypeId(undefined);
        setFilterActive(undefined);
        setFilters({});
        fetchSportClubs(false, 0, pageSize);
        setPage(0);
        setIsFilterOpen(false);
    };

    const handleCreateSportClub = async (data: CreateSportClubRequest) => {
        const success = await createSportClub(data);
        if (success) {
            setShowCreateForm(false);
        }
    };

    const handleDeleteSportClub = async () => {
        if (clubToDelete) {
            const success = await deleteSportClub(clubToDelete);
            if (success) {
                setClubToDelete(null);
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchSportClubs(false, newPage, pageSize);
    };

    const handleSearch = () => {
        const newFilters = {
            ...filters,
            name: searchQuery || undefined
        };
        setFilters(newFilters);
        fetchSportClubs(false, 0, pageSize, newFilters);
        setPage(0);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Computed values
    const hasActiveFilters = useMemo(() => {
        return !!(filters.name || filters.clubType || filters.cityId || filters.sportTypeId || filters.active !== undefined);
    }, [filters]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.name) count++;
        if (filters.clubType) count++;
        if (filters.cityId) count++;
        if (filters.sportTypeId) count++;
        if (filters.active !== undefined) count++;
        return count;
    }, [filters]);

    const clubTypeOptions = [
        { value: 'KIDS', label: t('sportClubs.clubTypes.kids') },
        { value: 'REGULAR', label: t('sportClubs.clubTypes.regular') },
        { value: 'PROFESSIONAL', label: t('sportClubs.clubTypes.professional') },
        { value: 'MIXED', label: t('sportClubs.clubTypes.mixed') }
    ];

    const getClubTypeDisplay = (type: string) => {
        const option = clubTypeOptions.find(opt => opt.value === type);
        return option ? option.label : type;
    };

    if (isLoading && sportClubs.length === 0) {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-card-bg to-darkest-bg p-6 rounded-xl shadow-lg">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                        {t('sportClubs.title')}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{t('sportClubs.subtitle')}</p>
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
                        {activeFiltersCount > 0 && (
                            <span className="bg-gold text-darkest-bg px-2 py-1 rounded-full text-xs font-medium">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gold text-darkest-bg px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors duration-200 flex items-center gap-2 font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('sportClubs.createSportClub')}
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
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        placeholder={t('sportClubs.searchPlaceholder')}
                        className="w-full pl-10 pr-4 py-3 bg-card-bg border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gold focus:ring-1 focus:ring-gold transition-colors duration-200"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gold text-darkest-bg px-4 py-1.5 rounded text-sm font-medium hover:bg-gold/90 transition-colors duration-200"
                    >
                        {t('common.search')}
                    </button>
                </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-gray-400">{t('common.activeFilters')}:</span>
                    {filters.name && (
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                            {t('common.name')}: {filters.name}
                        </span>
                    )}
                    {filters.clubType && (
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                            {t('sportClubs.clubType')}: {getClubTypeDisplay(filters.clubType)}
                        </span>
                    )}
                    {filters.cityId && (
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                            {t('cities.city')}: {cities.find(c => c.id === filters.cityId)?.name}
                        </span>
                    )}
                    {filters.sportTypeId && (
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                            {t('sportTypes.sportType')}: {sportTypes.find(s => s.id === filters.sportTypeId)?.name}
                        </span>
                    )}
                    {filters.active !== undefined && (
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                            {t('common.status')}: {filters.active ? t('common.active') : t('common.inactive')}
                        </span>
                    )}
                    <button
                        onClick={resetFilters}
                        className="text-red-400 hover:text-red-300 text-xs underline"
                    >
                        {t('common.clearAll')}
                    </button>
                </div>
            )}

            {/* Content */}
            {sportClubs.length === 0 && !isLoading ? (
                <div className="text-center py-12 bg-card-bg rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-4c1.381 0 2.721-.087 4-.252" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">{t('sportClubs.noSportClubs')}</h3>
                    <p className="text-gray-500 mb-6">{t('sportClubs.createFirst')}</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                    >
                        {t('sportClubs.createSportClub')}
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
                                        {t('sportClubs.name')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportClubs.clubType')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportClubs.sportType')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportClubs.ageRange')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('sportClubs.teams')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('common.status')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {sportClubs.map((club) => (
                                    <tr key={club.id} className="hover:bg-darkest-bg/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-white">{club.name}</div>
                                                    <div className="text-xs text-gray-400">ID: {club.id}</div>
                                                    {club.contactEmail && (
                                                        <div className="text-xs text-gray-500">{club.contactEmail}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                {getClubTypeDisplay(club.clubType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {club.sportTypeName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {club.minAge} - {club.maxAge} {t('common.years')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {club.teams?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                club.active 
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {club.active ? t('common.active') : t('common.inactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/dashboard/sport-clubs/${club.id}`}
                                                    className="text-gold hover:text-gold/80 transition-colors"
                                                >
                                                    {t('common.viewDetails')}
                                                </Link>
                                                <button
                                                    onClick={() => setClubToDelete(club.id)}
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
                        {sportClubs.map((club) => (
                            <div key={club.id} className="bg-card-bg rounded-lg p-4 shadow-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-medium text-white">{club.name}</h3>
                                        <p className="text-xs text-gray-400">ID: {club.id}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        club.active 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                        {club.active ? t('common.active') : t('common.inactive')}
                                    </span>
                                </div>
                                
                                {club.description && (
                                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                        {club.description}
                                    </p>
                                )}
                                
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-400">{t('sportClubs.clubType')}:</span>
                                        <span className="ml-1 text-white">
                                            {getClubTypeDisplay(club.clubType)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">{t('sportClubs.ageRange')}:</span>
                                        <span className="ml-1 text-white">
                                            {club.minAge} - {club.maxAge}
                                        </span>
                                    </div>
                                    {club.sportTypeName && (
                                        <div>
                                            <span className="text-gray-400">{t('sportTypes.sportType')}:</span>
                                            <span className="ml-1 text-white">{club.sportTypeName}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-400">{t('sportClubs.teams')}:</span>
                                        <span className="ml-1 text-white">{club.teams?.length || 0}</span>
                                    </div>
                                </div>

                                {club.contactEmail && (
                                    <p className="text-sm text-gray-400 mb-3">{club.contactEmail}</p>
                                )}
                                
                                <div className="flex gap-2">
                                    <Link
                                        to={`/dashboard/sport-clubs/${club.id}`}
                                        className="flex-1 bg-gold text-darkest-bg px-3 py-2 rounded text-center text-sm font-medium hover:bg-gold/90 transition-colors"
                                    >
                                        {t('common.viewDetails')}
                                    </Link>
                                    <button
                                        onClick={() => setClubToDelete(club.id)}
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
                        <div className="flex items-center justify-between border-t border-gray-700 bg-card-bg px-4 py-3 sm:px-6 rounded-lg">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="relative inline-flex items-center rounded-md border border-gray-600 bg-darkest-bg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common.previous')}
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-600 bg-darkest-bg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common.next')}
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">
                                        {t('common.showing')} <span className="font-medium">{currentPage * pageSize + 1}</span> {t('common.to')}{' '}
                                        <span className="font-medium">
                                            {Math.min((currentPage + 1) * pageSize, totalElements)}
                                        </span>{' '}
                                        {t('common.of')} <span className="font-medium">{totalElements}</span> {t('common.results')}
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-600 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">{t('common.previous')}</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-600 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                        pageNum === currentPage
                                                            ? 'bg-gold text-darkest-bg'
                                                            : 'text-gray-300'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-600 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">{t('common.next')}</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create Sport Club Modal */}
            <Modal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title={t('sportClubs.createSportClub')}
            >
                <SportClubForm
                    onSubmit={handleCreateSportClub}
                    onCancel={() => setShowCreateForm(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={clubToDelete !== null}
                onClose={() => setClubToDelete(null)}
                title={t('sportClubs.confirmDelete')}
            >
                <div className="p-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-center text-white mb-2">
                        {t('sportClubs.confirmDelete')}
                    </h3>
                    <p className="text-center text-gray-400 mb-6">
                        {t('sportClubs.deleteWarning')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
                        <button
                            onClick={() => setClubToDelete(null)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteSportClub}
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
                            {t('sportClubs.clubType')}
                        </label>
                        <select
                            value={filterClubType || ''}
                            onChange={(e) => setFilterClubType(e.target.value || undefined)}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        >
                            <option value="">{t('common.all')}</option>
                            {clubTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('cities.city')}
                        </label>
                        <select
                            value={filterCityId || ''}
                            onChange={(e) => setFilterCityId(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        >
                            <option value="">{t('common.all')}</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('sportTypes.sportType')}
                        </label>
                        <select
                            value={filterSportTypeId || ''}
                            onChange={(e) => setFilterSportTypeId(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        >
                            <option value="">{t('common.all')}</option>
                            {sportTypes.map((sportType) => (
                                <option key={sportType.id} value={sportType.id}>
                                    {sportType.name}
                                </option>
                            ))}
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

export default SportClubsPage;
