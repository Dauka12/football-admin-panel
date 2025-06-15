import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TournamentForm from '../../components/tournaments/TournamentForm';
import TournamentStatistics from '../../components/tournaments/TournamentStatistics';
import Bread from '../../components/ui/Breadcrumb';
import SimpleModal from '../../components/ui/SimpleModal';
import { useStatisticsStore } from '../../store/statisticsStore';
import { useTeamStore } from '../../store/teamStore';
import { useTournamentStore } from '../../store/tournamentStore';
import type { TeamFullResponse } from '../../types/teams';
import type { UpdateTournamentRequest } from '../../types/tournaments';

const TournamentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const tournamentId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { currentTournament, isLoading: tournamentLoading, error: tournamentError, fetchTournament, updateTournament, deleteTournament } = useTournamentStore();
    const { fetchTeamsByIds } = useTeamStore();
    const { 
        tournamentStats, 
        isTournamentStatsLoading, 
        tournamentStatsError, 
        fetchTournamentStatistics 
    } = useStatisticsStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [tournamentTeams, setTournamentTeams] = useState<TeamFullResponse[]>([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);
    
    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';

    // Fetch tournament data
    const loadTournament = useCallback(() => {
        if (tournamentId > 0) {
            fetchTournament(tournamentId);
        }
    }, [tournamentId, fetchTournament]);

    useEffect(() => {
        loadTournament();
    }, [loadTournament]);
    
    // Fetch tournament statistics
    useEffect(() => {
        if (tournamentId > 0) {
            fetchTournamentStatistics(tournamentId);
        }
    }, [tournamentId, fetchTournamentStatistics]);
    
    // Fetch team details
    useEffect(() => {
        let isCancelled = false;
        
        const getTeamDetails = async () => {
            if (currentTournament && Array.isArray(currentTournament.teams) && currentTournament.teams.length > 0) {
                // Skip if we already have the teams loaded or if request is cancelled
                if (tournamentTeams.length > 0 || isCancelled) return;
                
                setIsLoadingTeams(true);
                setTeamError(null);
                
                try {
                    // currentTournament.teams is an array of TournamentTeam objects
                    const teamIds = currentTournament.teams.map(team => team.id);
                    if (teamIds.length > 0 && !isCancelled) {
                        const teams = await fetchTeamsByIds(teamIds);
                        if (!isCancelled) {
                            setTournamentTeams(teams);
                        }
                    } else if (!isCancelled) {
                        setTournamentTeams([]);
                    }
                } catch (error) {
                    if (!isCancelled) {
                        console.error('Failed to fetch teams:', error);
                        setTeamError(t('errors.failedToLoadTeams'));
                    }
                } finally {
                    if (!isCancelled) {
                        setIsLoadingTeams(false);
                    }
                }
            } else if (!isCancelled) {
                setTournamentTeams([]);
                setIsLoadingTeams(false);
            }
        };

        getTeamDetails();
        
        return () => {
            isCancelled = true;
        };
    }, [currentTournament, fetchTeamsByIds, t, tournamentTeams.length]);

    const handleUpdate = async (data: UpdateTournamentRequest) => {
        if (tournamentId > 0) {
            const success = await updateTournament(tournamentId, data);
            if (success) {
                setIsEditing(false);
                // Refresh tournament data after update
                loadTournament();
            }
        }
    };

    const handleDelete = async () => {
        if (tournamentId > 0) {
            const success = await deleteTournament(tournamentId);
            if (success) {
                navigate('/dashboard/tournaments');
            }
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(isRussian ? 'ru-RU' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    if (tournamentLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-gold mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (tournamentError || !currentTournament) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">{t('tournaments.notFound')}</h2>
                <Link 
                    to="/dashboard/tournaments" 
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                >
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    const breadcrumbItems = [
        { label: t('tournaments.title'), href: '/dashboard/tournaments' },
        { label: currentTournament.name, href: `/dashboard/tournaments/${currentTournament.id}` }
    ];

    return (
        <div className="space-y-6">
            <Bread items={breadcrumbItems} />
            
            {/* Tournament Header */}
            <div className="bg-card-bg rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold">{currentTournament.name}</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-gold text-darkest-bg px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {t('common.edit')}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-accent-pink text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-accent-pink/90 transition-colors duration-200 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tournament Details */}
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('tournaments.dateRange')}
                </h2>
                <div className="space-y-4">
                    <div>
                        <div className="text-gray-400 text-sm mb-1">{t('tournaments.startDate')}</div>
                        <div>{formatDate(currentTournament.startDate)}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm mb-1">{t('tournaments.endDate')}</div>
                        <div>{formatDate(currentTournament.endDate)}</div>
                    </div>
                </div>
            </div>

            {/* Participating Teams */}
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('tournaments.participatingTeams')} ({tournamentTeams.length})
                </h2>
                
                {teamError && (
                    <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500 mb-4">
                        {teamError}
                    </div>
                )}
                
                {isLoadingTeams ? (
                    <div className="flex justify-center py-8">
                        <svg className="animate-spin h-6 w-6 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : tournamentTeams.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">{t('tournaments.noTeams')}</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tournamentTeams.map((team) => (
                            <Link
                                key={team.id}
                                to={`/dashboard/teams/${team.id}`}
                                className="bg-darkest-bg rounded-lg p-4 hover:bg-darkest-bg/70 transition-colors duration-200 border border-gray-700 hover:border-gold"
                            >
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ 
                                            backgroundColor: team.primaryColor || '#ffcc00',
                                            color: team.secondaryColor || '#002b3d'
                                        }}
                                    >
                                        {team.avatar ? (
                                            <img src={team.avatar} alt={team.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="font-bold text-sm">{team.name.substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">{team.name}</div>
                                        <div className="text-sm text-gray-400">
                                            {team.players?.length || 0} {t('common.players')}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Tournament Statistics */}
            <TournamentStatistics
                stats={tournamentStats}
                isLoading={isTournamentStatsLoading}
                error={tournamentStatsError}
            />

            {/* Edit Tournament Modal */}
            <SimpleModal 
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title={t('tournaments.editTournament')}
                className="max-w-2xl"
            >
                <TournamentForm 
                    initialData={{
                        name: currentTournament.name,
                        startDate: currentTournament.startDate,
                        endDate: currentTournament.endDate,
                        teams: currentTournament.teams?.map(team => team.id) || [],
                        cityId: 1, // Default city ID
                        sportTypeId: currentTournament.sportTypeId || 1 // Default sport type
                    }}
                    onSubmit={handleUpdate} 
                    onCancel={() => setIsEditing(false)} 
                />
            </SimpleModal>

            {/* Delete Confirmation Modal */}
            <SimpleModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('tournaments.confirmDelete')}
                className="max-w-md"
            >
                <div>
                    <p className="text-gray-300 mb-6">
                        {t('tournaments.deleteWarningDetail', { name: currentTournament.name })}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:space-x-3">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="w-full sm:w-auto px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </SimpleModal>
        </div>
    );
};

export default TournamentDetailPage;
