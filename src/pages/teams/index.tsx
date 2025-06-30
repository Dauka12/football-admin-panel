import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { TeamFilterParams } from '../../api/teams';
import FavoriteButton from '../../components/favorites/FavoriteButton';
import TeamForm from '../../components/teams/TeamForm';
import Modal from '../../components/ui/Modal';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useSportTypeStore } from '../../store/sportTypeStore';
import { useTeamStore } from '../../store/teamStore';
import type { CreateTeamRequest } from '../../types/teams';

const TeamsPage: React.FC = () => {
    // Performance monitoring
    usePerformanceMonitor('TeamsPage');    const { t } = useTranslation();
    const { 
        teams, 
        isLoading, 
        error, 
        fetchTeams, 
        deleteTeam, 
        createTeam, 
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        filters,
        setFilters 
    } = useTeamStore();
      const { sportTypes, fetchSportTypes } = useSportTypeStore();
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);

    // Filter state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterName, setFilterName] = useState(filters.name || '');
    const [filterPrimaryColor, setFilterPrimaryColor] = useState(filters.primaryColor || '');
    const [filterSecondaryColor, setFilterSecondaryColor] = useState(filters.secondaryColor || '');
    const [filterSportTypeId, setFilterSportTypeId] = useState<number | undefined>(filters.sportTypeId);

    // Memoized filtered teams to avoid recalculation on every render
    const filteredTeams = useMemo(() => {
        if (!teams) return [];
        
        if (!searchQuery.trim()) return teams;
        
        const query = searchQuery.toLowerCase();
        return teams.filter(team =>
            team.name.toLowerCase().includes(query) ||
            team.description.toLowerCase().includes(query)
        );
    }, [teams, searchQuery]);    // Fetch teams on mount and when pagination/filters change
    useEffect(() => {
        fetchTeams(true, page, pageSize, filters);
    }, [fetchTeams, page, pageSize, filters]);    // Fetch sport types once on mount for filter dropdown
    useEffect(() => {
        console.log('Teams page useEffect for sportTypes triggered');
        fetchSportTypes();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps// Apply filters and fetch teams
    const applyFilters = () => {
        const newFilters: TeamFilterParams = {};
        
        if (filterName) newFilters.name = filterName;
        if (filterPrimaryColor) newFilters.primaryColor = filterPrimaryColor;
        if (filterSecondaryColor) newFilters.secondaryColor = filterSecondaryColor;
        if (filterSportTypeId) newFilters.sportTypeId = filterSportTypeId;
        
        setFilters(newFilters);
        // Reset to first page when applying new filters
        setPage(0);
        fetchTeams(true, 0, pageSize, newFilters);
        setIsFilterOpen(false);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilterName('');
        setFilterPrimaryColor('');
        setFilterSecondaryColor('');
        setFilterSportTypeId(undefined);
        setFilters({});
        setPage(0);
        fetchTeams(true, 0, pageSize, {});
    };

    const handleCreateTeam = async (data: CreateTeamRequest) => {
        const success = await createTeam(data);
        if (success) {
            setShowCreateForm(false);

            // Force refresh the teams list after creation
            await fetchTeams(true, page, pageSize, filters);
        }
    };

    const handleConfirmDelete = async () => {
        if (teamToDelete !== null) {
            const success = await deleteTeam(teamToDelete);
            if (success) {
                setTeamToDelete(null);
                // Refresh the teams list after deletion
                await fetchTeams(true, page, pageSize, filters);
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h1 className="text-2xl font-bold">{t('teams.title')}</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('teams.createTeam')}
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-6">
                {/* Search input */}
                <div className="relative flex-1 w-full lg:w-auto">
                    <input
                        type="text"
                        placeholder={t('common.searchByName')}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Team Name filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('teams.name')}</label>
                            <input
                                type="text"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder={t('teams.name')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                        
                        {/* Primary Color filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('teams.primaryColor')}</label>
                            <input
                                type="text"
                                value={filterPrimaryColor}
                                onChange={(e) => setFilterPrimaryColor(e.target.value)}
                                placeholder={t('teams.primaryColor')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                          {/* Secondary Color filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('teams.secondaryColor')}</label>
                            <input
                                type="text"
                                value={filterSecondaryColor}
                                onChange={(e) => setFilterSecondaryColor(e.target.value)}
                                placeholder={t('teams.secondaryColor')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                        
                        {/* Sport Type filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('teams.sportType')}</label>
                            <select
                                value={filterSportTypeId || ''}
                                onChange={(e) => setFilterSportTypeId(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            >
                                <option value="">{t('common.all')}</option>
                                {sportTypes.map((sportType) => (
                                    <option key={sportType.id} value={sportType.id}>
                                        {sportType.name}
                                    </option>
                                ))}
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

            {!isLoading && filteredTeams.length === 0 ? (
                <div className="text-center py-12">
                    {searchQuery || Object.keys(filters).length > 0 ? (
                        <p className="text-gray-400 mb-4">{t('teams.noResultsFound')}</p>
                    ) : (
                        <>
                            <p className="text-gray-400 mb-4">{t('teams.noTeams')}</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                            >
                                {t('teams.createFirst')}
                            </button>
                        </>
                    )}
                </div>
            ) : (                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredTeams.map((team) => (
                        <div key={team.id} className="bg-card-bg rounded-lg overflow-hidden shadow-lg border border-gray-700 transition-transform hover:-translate-y-1 hover:shadow-xl">
                            <div className="p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg sm:text-xl font-semibold line-clamp-1 pr-2">{team.name}</h3>
                                    <div className="flex space-x-1 sm:space-x-2 shrink-0">
                                        <FavoriteButton
                                            entityType="TEAM"
                                            entityId={team.id}
                                            className="p-1"
                                        />
                                        <Link
                                            to={`/dashboard/teams/${team.id}`}
                                            className="text-gold hover:text-gold/80 transition-colors p-1"
                                            title={t('common.viewDetails')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                                
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{team.description}</p>
                                
                                {/* Адаптивный макет для цветов команды */}
                                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                    <div className="flex items-center">
                                        <span className="text-xs sm:text-sm text-gray-400 mr-2 whitespace-nowrap">{t('teams.primaryColor')}:</span>
                                        <div className="flex items-center flex-1 min-w-0">
                                            <div 
                                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-600 shrink-0" 
                                                style={{ backgroundColor: team.primaryColor }}
                                            />
                                            <span className="text-xs sm:text-sm ml-1 sm:ml-2 truncate">{team.primaryColor}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs sm:text-sm text-gray-400 mr-2 whitespace-nowrap">{t('teams.secondaryColor')}:</span>
                                        <div className="flex items-center flex-1 min-w-0">
                                            <div 
                                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-600 shrink-0" 
                                                style={{ backgroundColor: team.secondaryColor }}
                                            />
                                            <span className="text-xs sm:text-sm ml-1 sm:ml-2 truncate">{team.secondaryColor}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center text-xs sm:text-sm gap-2">
                                    <span className="text-gray-400">{t('teams.players')}:</span>
                                    <span>{team.players?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 mt-6 border-t border-gray-700 bg-card-bg rounded-lg">
                    <div className="text-sm text-gray-400 mb-3 sm:mb-0">
                        {t('common.showing')} {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} {t('common.of')} {totalElements}
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className={`px-3 py-1 rounded-md ${page === 0
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                        >
                            {t('common.previous')}
                        </button>

                        {/* Page numbers */}
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Calculate page numbers to show
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i;
                                } else {
                                    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                                    pageNum = start + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-md ${pageNum === page
                                            ? 'bg-gold text-darkest-bg'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            className={`px-3 py-1 rounded-md ${page >= totalPages - 1
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                        >
                            {t('common.next')}
                        </button>
                    </div>
                </div>
            )}

            {/* Create Team Modal */}
            <Modal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title={t('teams.createTeam')}
            >
                <TeamForm
                    onSubmit={handleCreateTeam}
                    onCancel={() => setShowCreateForm(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={teamToDelete !== null}
                onClose={() => setTeamToDelete(null)}
                title={t('teams.confirmDelete')}
            >
                <div>
                    <p className="text-gray-300 mb-6">{t('teams.deleteWarning')}</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setTeamToDelete(null)}
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
            </Modal>
        </div>
    );
};

export default TeamsPage;
