import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TournamentForm from '../../components/tournaments/TournamentForm';
import SimpleModal from '../../components/ui/SimpleModal';
import { useCityStore } from '../../store/cityStore';
import { useSportTypeStore } from '../../store/sportTypeStore';
import { useTournamentCategoryStore } from '../../store/tournamentCategoryStore';
import { useTournamentStore } from '../../store/tournamentStore';
import type { CreateTournamentRequest, TournamentFilters } from '../../types/tournaments';

const TournamentsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { 
        tournaments, 
        paginatedTournaments, 
        isLoading, 
        error, 
        fetchTournamentsWithFilters, 
        deleteTournament, 
        createTournament, 
        clearError 
    } = useTournamentStore();
    const { cities, fetchCities } = useCityStore();
    const { sportTypes, fetchSportTypes } = useSportTypeStore();
    const { categories, fetchCategories } = useTournamentCategoryStore();
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [tournamentToDelete, setTournamentToDelete] = useState<number | null>(null);
    
    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState<number | undefined>(undefined);
    const [sportTypeFilter, setSportTypeFilter] = useState<number | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(0);

    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';

    // Load tournaments with filters
    const loadTournaments = useCallback(() => {
        const filters: TournamentFilters = {
            page: currentPage,
            size: 12
        };

        if (searchQuery.trim()) {
            filters.name = searchQuery.trim();
        }

        if (dateFilter) {
            filters.date = dateFilter;
        }

        if (cityFilter) {
            filters.cityId = cityFilter;
        }

        if (sportTypeFilter) {
            filters.sportTypeId = sportTypeFilter;
        }

        if (categoryFilter) {
            filters.categoryId = categoryFilter;
        }

        fetchTournamentsWithFilters(filters);
    }, [fetchTournamentsWithFilters, currentPage, searchQuery, dateFilter, cityFilter, sportTypeFilter, categoryFilter]);

    // Ensure we fetch tournaments on mount and when returning to page
    useEffect(() => {
        loadTournaments();
        fetchCities(); // Load cities for filter
        fetchSportTypes(); // Load sport types for filter
        fetchCategories(); // Load categories for filter
    }, [loadTournaments, fetchCities, fetchSportTypes, fetchCategories]);

    useEffect(() => {
        // Reset to first page when filters change
        if (currentPage !== 0) {
            setCurrentPage(0);
        }
    }, [searchQuery, dateFilter, cityFilter, sportTypeFilter, categoryFilter]);

    const handleCreateTournament = async (data: CreateTournamentRequest) => {
        const success = await createTournament(data);
        if (success) {
            setShowCreateForm(false);
            // Reload tournaments after creation
            loadTournaments();
        }
    };

    const handleConfirmDelete = async () => {
        if (tournamentToDelete !== null) {
            await deleteTournament(tournamentToDelete);
            setTournamentToDelete(null);
            // Reload tournaments after deletion
            loadTournaments();
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(isRussian ? 'ru-RU' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div>
            {/* Header section with responsive layout - button always on the right */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold">{t('tournaments.title')}</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gold text-darkest-bg px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className={`${isRussian ? 'text-xs' : 'text-sm sm:text-base'}`}>{t('tournaments.createTournament')}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card-bg rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder={t('tournaments.searchByName')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            placeholder={t('tournaments.filterByDate')}
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        />
                    </div>
                    <div>
                        <select
                            value={cityFilter || ''}
                            onChange={(e) => setCityFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        >
                            <option value="">{t('cities.allCities')}</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={sportTypeFilter || ''}
                            onChange={(e) => setSportTypeFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        >
                            <option value="">{t('sportTypes.allSportTypes')}</option>
                            {sportTypes.map((sportType) => (
                                <option key={sportType.id} value={sportType.id}>
                                    {sportType.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={categoryFilter || ''}
                            onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        >
                            <option value="">{t('tournamentCategories.allCategories')}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500 mb-4">
                    <p>{error}</p>
                    <button 
                        onClick={() => {
                            clearError();
                            loadTournaments();
                        }}
                        className="mt-2 text-gold hover:underline"
                    >
                        {t('common.retry')}
                    </button>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-gold mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-400">{t('common.loading')}</p>
                    </div>
                </div>
            ) : !tournaments || tournaments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{t('tournaments.noTournaments')}</h3>
                    <p className="text-gray-400 mb-4">{t('tournaments.createFirst')}</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                    >
                        {t('tournaments.createTournament')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Tournaments Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                        {tournaments.map((tournament) => (
                        <div key={tournament.id} className="bg-card-bg rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-103 hover:shadow-lg">
                            {/* Tournament Header */}
                            <div className="p-4 border-b border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg truncate pr-2">{tournament.name}</h3>
                                </div>
                            </div>

                            {/* Tournament Details */}
                            <div className="p-4 space-y-3">
                                {/* Date Range */}
                                <div className="flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-300">
                                        {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                                    </span>
                                </div>

                                {/* City */}
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-300">
                                        {cities.find(city => city.id === tournament.cityId)?.name || t('cities.unknownCity')}
                                    </span>
                                </div>

                                {/* Sport Type */}
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    <span className="text-gray-300">
                                        {sportTypes.find(sport => sport.id === tournament.sportTypeId)?.name || t('sportTypes.unknownSportType')}
                                    </span>
                                </div>

                                {/* Category */}
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span className="text-gray-300">
                                        {categories.find(cat => cat.id === tournament.categoryId)?.name || t('tournamentCategories.unknownCategory')}
                                    </span>
                                </div>

                                {/* Number of Matches */}
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-gray-300">
                                        {tournament.numberOfMatches} {t('matches.matches')}
                                    </span>
                                </div>

                                {/* Teams */}
                                {tournament.teams && tournament.teams.length > 0 && (
                                    <div className="flex items-center text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-gray-300">
                                            {tournament.teams.length} {t('tournaments.teams')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="border-t border-gray-700 p-4 flex justify-between">
                                <Link
                                    to={`/dashboard/tournaments/${tournament.id}`}
                                    className="text-gold hover:underline text-sm transition-colors duration-200"
                                >
                                    {t('common.viewDetails')}
                                </Link>
                                <button
                                    onClick={() => setTournamentToDelete(tournament.id)}
                                    className="text-accent-pink hover:underline text-sm transition-colors duration-200"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                    {/* Pagination */}
                    {paginatedTournaments && paginatedTournaments.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-1 bg-card-bg rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-darkest-bg transition-colors duration-200"
                            >
                                {t('common.previous')}
                            </button>
                            
                            <span className="text-gray-400">
                                {t('common.page')} {currentPage + 1} {t('common.of')} {paginatedTournaments.totalPages}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= paginatedTournaments.totalPages - 1}
                                className="px-3 py-1 bg-card-bg rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-darkest-bg transition-colors duration-200"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Tournament Modal */}
            <SimpleModal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title={t('tournaments.createTournament')}
                className="max-w-2xl"
            >
                <TournamentForm onSubmit={handleCreateTournament} onCancel={() => setShowCreateForm(false)} />
            </SimpleModal>

            {/* Delete Confirmation Modal */}
            <SimpleModal
                isOpen={tournamentToDelete !== null}
                onClose={() => setTournamentToDelete(null)}
                title={t('tournaments.confirmDelete')}
                className="max-w-md"
            >
                <div>
                    <p className="text-gray-300 mb-6">{t('tournaments.deleteWarning')}</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setTournamentToDelete(null)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </SimpleModal>
        </div>
    );
};

export default TournamentsPage;
