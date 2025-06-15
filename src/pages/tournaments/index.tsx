import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TournamentForm from '../../components/tournaments/TournamentForm';
import SimpleModal from '../../components/ui/SimpleModal';
import { useTournamentStore } from '../../store/tournamentStore';
import type { CreateTournamentRequest } from '../../types/tournaments';

const TournamentsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { tournaments, isLoading, error, fetchTournaments, deleteTournament, createTournament } = useTournamentStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [tournamentToDelete, setTournamentToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';

    // Memoized filtered tournaments to avoid recalculation on every render
    const filteredTournaments = useMemo(() => {
        if (!tournaments || !Array.isArray(tournaments)) {
            return [];
        }
        
        if (!searchQuery.trim()) return tournaments;
        
        const query = searchQuery.toLowerCase();
        return tournaments.filter(tournament => {
            if (!tournament || typeof tournament !== 'object') {
                return false;
            }
            const name = tournament.name || '';
            return name.toLowerCase().includes(query);
        });
    }, [tournaments, searchQuery]);

    // Ensure we fetch tournaments on mount and when returning to page
    useEffect(() => {
        // Force refresh tournaments list regardless of cache
        const loadTournaments = async () => {
            await fetchTournaments(true); // Pass true to force refresh
        };
        loadTournaments();
    }, [fetchTournaments]);

    const handleCreateTournament = async (data: CreateTournamentRequest) => {
        const success = await createTournament(data);
        if (success) {
            setShowCreateForm(false);

            // Force refresh the tournaments list after creation
            await fetchTournaments(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (tournamentToDelete !== null) {
            await deleteTournament(tournamentToDelete);
            setTournamentToDelete(null);
        }
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

            {/* Search bar */}
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder={t('tournaments.searchByTournament')}
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

            {error && (
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500 mb-4">
                    {error}
                </div>
            )}

            {isLoading && <p className="text-gray-300">{t('common.loading')}</p>}

            {!isLoading && filteredTournaments.length === 0 ? (
                <div className="text-center py-12">
                    {searchQuery ? (
                        <p className="text-gray-400 mb-4">{t('tournaments.noResultsFound')}</p>
                    ) : (
                        <>
                            <p className="text-gray-400 mb-4">{t('tournaments.noTournaments')}</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                            >
                                {t('tournaments.createFirst')}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredTournaments.map((tournament) => (
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
            )}            {/* Create Tournament Modal */}
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
