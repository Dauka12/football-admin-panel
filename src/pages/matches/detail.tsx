import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MatchForm from '../../components/matches/MatchForm';
import MatchStatusControl from '../../components/matches/MatchStatusControl';
import MatchEventForm from '../../components/matches/MatchEventForm';
import MatchEventsList from '../../components/matches/MatchEventsList';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingIndicator';
import Modal from '../../components/ui/Modal';
import { useMatchStore } from '../../store/matchStore';
import { useMatchEventStore } from '../../store/matchEventStore';
import { teamApi } from '../../api/teams';
import type { MatchStatus, UpdateMatchRequest } from '../../types/matches';
import type { CreateMatchEventRequest } from '../../types/matchEvents';
import type { TeamFullResponse } from '../../types/teams';
import { formatDateTime } from '../../utils/dateUtils';
import { showToast } from '../../utils/toast';

const MatchDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const matchId = parseInt(id || '0', 10);

    const {
        currentMatch,
        isLoading,
        error,
        fetchMatchById,
        updateMatch,
        deleteMatch,
        updateMatchStatus
    } = useMatchStore();

    const {
        events,
        isLoading: eventsLoading,
        error: eventsError,
        fetchEventsByMatchId,
        createEvent,
        clearEvents
    } = useMatchEventStore();

    // UI state
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    
    // Team data state
    const [teamsData, setTeamsData] = useState<TeamFullResponse[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(false);

    // Load match data
    useEffect(() => {
        if (matchId) {
            fetchMatchById(matchId);
        }
    }, [matchId, fetchMatchById]);

    // Load events when match is loaded
    useEffect(() => {
        if (currentMatch && currentMatch.id) {
            fetchEventsByMatchId(currentMatch.id);
            // Also load team data for players
            loadTeamsData();
        }
        
        // Clear events when match changes
        return () => {
            clearEvents();
        };
    }, [currentMatch?.id, fetchEventsByMatchId, clearEvents]);

    // Load team data with players
    const loadTeamsData = async () => {
        if (!currentMatch?.participants) return;
        
        setLoadingTeams(true);
        try {
            const teamIds = currentMatch.participants.map(p => p.teamId);
            const uniqueTeamIds = [...new Set(teamIds)]; // Remove duplicates
            
            const teamPromises = uniqueTeamIds.map(teamId => teamApi.getById(teamId));
            const teams = await Promise.all(teamPromises);
            
            setTeamsData(teams);
        } catch (error) {
            console.error('Error loading team data:', error);
        } finally {
            setLoadingTeams(false);
        }
    };

    // Load events when match is loaded and is in progress
    useEffect(() => {
        if (matchId && currentMatch) {
            fetchEventsByMatchId(matchId);
        }
        
        // Clear events when component unmounts or match changes
        return () => {
            if (matchId) {
                clearEvents();
            }
        };
    }, [matchId, currentMatch, fetchEventsByMatchId, clearEvents]);

    // Handle edit form submission
    const handleUpdateMatch = async (data: UpdateMatchRequest) => {
        if (!matchId) return;

        const success = await updateMatch(matchId, data);
        if (success) {
            setShowEditForm(false);
            showToast(t('matches.updateSuccess'), 'success');
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!matchId) return;

        const success = await deleteMatch(matchId);
        if (success) {
            showToast(t('matches.deleteSuccess'), 'success');
            navigate('/dashboard/matches');
        }
    };

    // Handle status change
    const handleStatusChange = async (status: MatchStatus): Promise<boolean> => {
        if (!matchId) return false;

        const success = await updateMatchStatus(matchId, status);
        if (success) {
            showToast(t('matches.statusUpdated'), 'success');
        }
        return success;
    };

    // Handle create event
    const handleCreateEvent = async (data: CreateMatchEventRequest) => {
        const success = await createEvent(data);
        if (success) {
            setShowEventForm(false);
            showToast(t('matchEvents.addEventSuccess'), 'success');
        }
    };

    // Check if match allows event management
    const canManageEvents = currentMatch?.status === 'IN_PROGRESS';

    // Get available players for event form
    const availablePlayers = teamsData.flatMap(team => 
        team.players?.map(player => ({
            id: player.id,
            fullName: player.fullName,
            teamId: team.id
        })) || []
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
                {error}
            </div>
        );
    }

    if (!currentMatch) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">{t('matches.notFound')}</p>
            </div>
        );
    }

    const breadcrumbs = [
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('matches.title'), href: '/dashboard/matches' },
        { label: `${t('matches.match')} #${currentMatch.id}` }
    ];

    return (
        <div className="animate-fade-in">
            <Breadcrumb items={breadcrumbs} />

            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div>
                    <h1 className="text-2xl font-bold mb-2">
                        {t('matches.match')} #{currentMatch.id}
                    </h1>
                    <p className="text-gray-400">
                        {formatDateTime(currentMatch.matchDate)}
                    </p>
                </div>

                {/* Status Control */}
                <div className="flex items-center gap-3">
                    <MatchStatusControl
                        currentStatus={currentMatch.status as MatchStatus}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setShowEditForm(true)}
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    {t('matches.editMatch')}
                </button>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-accent-pink text-white px-4 py-2 rounded-md hover:bg-accent-pink/90 transition-colors flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    {t('common.delete')}
                </button>

                {/* Event Management Button - Only for IN_PROGRESS matches */}
                {canManageEvents && (
                    <button
                        onClick={() => setShowEventForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('matchEvents.addEvent')}
                    </button>
                )}
            </div>

            {/* Match Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tournament Info */}
                {currentMatch.tournament && (
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52a6.003 6.003 0 00-4.334 5.749 7.951 7.951 0 01-1.993-1.35A7.954 7.954 0 003.94 6.42c1.021-.13 2.042-.314 3.061-.555M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236C7.176 3.928 9.324 3.75 11.6 3.75h.8c2.276 0 4.424.178 6.35.486M19.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 014.334 5.749 7.951 7.951 0 001.993-1.35A7.954 7.954 0 0020.06 6.42c-1.021-.13-2.042-.314-3.061-.555M19.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228" />
                            </svg>
                            {t('matches.tournamentInfo')}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-400 text-sm">{t('tournaments.name')}:</span>
                                <p className="font-medium">{currentMatch.tournament.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-gray-400 text-sm">{t('tournaments.startDate')}:</span>
                                    <p className="text-sm">{formatDateTime(currentMatch.tournament.startDate)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-sm">{t('tournaments.endDate')}:</span>
                                    <p className="text-sm">{formatDateTime(currentMatch.tournament.endDate)}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-sm">{t('tournaments.numberOfMatches')}:</span>
                                <p className="font-medium">{currentMatch.tournament.numberOfMatches}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Teams & Scores */}
                <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gold">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        {t('matches.teamsAndScores')}
                    </h3>
                    <div className="space-y-4">
                        {Array.isArray(currentMatch.participants) && currentMatch.participants.map((participant, index) => (
                            <div key={`${participant.teamId}-${participant.playerId || index}`} className="flex items-center justify-between p-4 bg-darkest-bg rounded-lg">
                                <div>
                                    <p className="font-medium">{participant.teamName}</p>
                                    {participant.playerFullName && (
                                        <p className="text-sm text-gray-400">{participant.playerFullName}</p>
                                    )}
                                </div>
                                <div className="text-2xl font-bold text-gold">
                                    {participant.score || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Match Events Section */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-gold">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('matchEvents.eventsTitle')}
                    </h2>
                    {canManageEvents && (
                        <button
                            onClick={() => setShowEventForm(true)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('matchEvents.addEvent')}
                        </button>
                    )}
                </div>

                {/* Events Error Display */}
                {eventsError && (
                    <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500 mb-4">
                        {eventsError}
                    </div>
                )}

                {/* Events Loading */}
                {eventsLoading || loadingTeams ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                ) : (
                    /* Events List */
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                        <MatchEventsList 
                            events={events} 
                        />
                    </div>
                )}

                {/* Info message for non-in-progress matches */}
                {!canManageEvents && (
                    <div className="bg-blue-500/20 border border-blue-500 p-3 rounded-md text-blue-300 mt-4">
                        <p className="text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            Events can only be managed for matches with status "In Progress"
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Match Modal */}
            <Modal
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                title={t('matches.editMatch')}
            >
                <MatchForm
                    initialData={{
                        tournamentId: currentMatch.tournament?.id,
                        matchDate: currentMatch.matchDate,
                        teams: currentMatch.participants?.map(p => p.teamId) || [],
                        status: currentMatch.status
                    }}
                    onSubmit={handleUpdateMatch}
                    onCancel={() => setShowEditForm(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t('matches.confirmDelete')}
            >
                <div>
                    <p className="text-gray-300 mb-6">{t('matches.deleteWarning')}</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Event Modal */}
            <Modal
                isOpen={showEventForm}
                onClose={() => setShowEventForm(false)}
                title={t('matchEvents.addEvent')}
            >
                <MatchEventForm
                    matchId={matchId}
                    onSubmit={handleCreateEvent}
                    onCancel={() => setShowEventForm(false)}
                    availablePlayers={availablePlayers}
                />
            </Modal>
        </div>
    );
};

export default MatchDetailPage;
