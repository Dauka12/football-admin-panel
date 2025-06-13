import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MatchEventsForm from '../../components/matches/MatchEventsForm';
import MatchForm from '../../components/matches/MatchForm';
import MatchScoreEditor from '../../components/matches/MatchScoreEditor';
import MatchStatusControl from '../../components/matches/MatchStatusControl';
import StatusUpdateButton from '../../components/matches/StatusUpdateButton';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingIndicator';
import Modal from '../../components/ui/Modal';
import { useMatchStore } from '../../store/matchStore';
import type { UpdateMatchRequest } from '../../types/matches';
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
        updateMatchStatus,
        updateParticipantScore,
        addMatchEvent,
        deleteMatchEvent
    } = useMatchStore();

    // UI state
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEventsModal, setShowEventsModal] = useState(false);

    // Load match data
    useEffect(() => {
        if (matchId) {
            fetchMatchById(matchId);
        }
    }, [matchId, fetchMatchById]);

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
    };    // Event type mapping for display
    const getEventTypeDisplay = (type: string) => {
        switch (type) {
            case 'GOAL':
                return t('matches.events.goal') || 'Goal';
            case 'PENALTY_GOAL':
                return t('matches.events.penaltyGoal') || 'Penalty Goal';
            case 'MISSED_PENALTY':
                return t('matches.events.missedPenalty') || 'Missed Penalty';
            case 'OWN_GOAL':
                return t('matches.events.ownGoal') || 'Own Goal';
            case 'YELLOW_CARD':
                return t('matches.events.yellowCard') || 'Yellow Card';
            case 'RED_CARD':
                return t('matches.events.redCard') || 'Red Card';
            case 'SECOND_YELLOW':
                return t('matches.events.secondYellow') || 'Second Yellow Card';
            default:
                return type;
        }
    };

    // Function to handle score updates is directly passed to MatchScoreEditor component

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
            <div className="text-center py-8">
                <p className="text-gray-400">{t('matches.notFound')}</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Breadcrumb navigation */}
            <Breadcrumb
                items={[
                    { label: t('sidebar.matches'), path: '/dashboard/matches' },
                    { label: `${t('matches.match')} #${currentMatch.id}`, path: '' }
                ]}
            />

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-6 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">{currentMatch.tournament.name}</h1>
                    <p className="text-gray-400">
                        {formatDateTime(currentMatch.matchDate)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {currentMatch.status !== 'COMPLETED' && currentMatch.status !== 'CANCELLED' && (
                        <StatusUpdateButton
                            matchId={currentMatch.id}
                            currentStatus={currentMatch.status}
                        />
                    )}
                    <button
                        onClick={() => setShowEditForm(true)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors duration-200 text-sm sm:text-base"
                    >
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200 text-sm sm:text-base"
                    >
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* Status section */}
            <div className="mb-6">
                <MatchStatusControl
                    matchId={currentMatch.id}
                    currentStatus={currentMatch.status}
                    onStatusChange={async (status) => {
                        const success = await updateMatchStatus(currentMatch.id, status);
                        return success;
                    }}
                />
            </div>

            {/* Match details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Teams and scores */}
                <div className="lg:col-span-2">
                    <div className="bg-card-bg rounded-lg overflow-hidden shadow-md">
                        <div className="p-4 border-b border-darkest-bg">
                            <h2 className="font-semibold">{t('matches.teamsAndScores')}</h2>
                        </div>
                        <div className="p-4">
                            <MatchScoreEditor
                                participants={currentMatch.participants}
                                onScoreUpdate={async (participantId, score) => {
                                    const success = await updateParticipantScore(currentMatch.id, participantId, score);
                                    return success;
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tournament info */}
                <div>
                    <div className="bg-card-bg rounded-lg overflow-hidden shadow-md">
                        <div className="p-4 border-b border-darkest-bg">
                            <h2 className="font-semibold">{t('matches.tournamentInfo')}</h2>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <div className="text-sm text-gray-400 mb-1">{t('tournaments.name')}</div>
                                <div>{currentMatch.tournament.name}</div>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm text-gray-400 mb-1">{t('tournaments.dates')}</div>
                                <div>
                                    {formatDateTime(currentMatch.tournament.startDate, 'date')} - {formatDateTime(currentMatch.tournament.endDate, 'date')}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-400 mb-1">{t('tournaments.active')}</div>
                                <div>
                                    {currentMatch.tournament.active ?
                                        <span className="text-green-400">{t('common.yes')}</span> :
                                        <span className="text-gray-400">{t('common.no')}</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match events section */}
            <div className="mt-6">
                <div className="bg-card-bg rounded-lg overflow-hidden shadow-md">
                    <div className="p-4 border-b border-darkest-bg flex flex-wrap justify-between items-center gap-3">
                        <h2 className="font-semibold">{t('matches.matchEvents')}</h2>
                        <button
                            onClick={() => setShowEventsModal(true)}
                            className="px-3 py-1.5 text-sm bg-gold text-darkest-bg rounded hover:bg-gold/90 transition-colors whitespace-nowrap"
                        >
                            {t('matches.events.manageEvents')}
                        </button>
                    </div>

                    {currentMatch.events && currentMatch.events.length > 0 ? (
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-darkest-bg">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                {t('matches.minute')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                {t('matches.player')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                {t('matches.eventType')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-darkest-bg/70">
                                        {currentMatch.events.map((event) => (
                                            <tr key={event.id} className="hover:bg-darkest-bg/30 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {event.minute}'
                                                </td>
                                                <td className="px-4 py-3">
                                                    {event.playerName || 'Player info unavailable'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getEventTypeDisplay(event.type)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-400">
                            {t('matches.noEvents')}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Match Modal */}
            <Modal
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                title={t('matches.editMatch')}
                hasDatePicker={true}
            >
                <MatchForm
                    initialData={{
                        tournamentId: currentMatch.tournament.id,
                        matchDate: currentMatch.matchDate, // Now accepts string | number
                        teams: currentMatch.participants.map(p => {
                            // Handle possible nested team object or teamId property
                            if (p.team && typeof p.team === 'object' && 'id' in p.team) {
                                return p.team.id;
                            }
                            return p.teamId || 0;
                        })
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
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Events Management Modal */}
            <Modal
                isOpen={showEventsModal}
                onClose={() => setShowEventsModal(false)}
                title={t('matches.events.manageEvents')}
            >
                {currentMatch && (
                    <MatchEventsForm
                        match={currentMatch}
                        onAddEvent={async (eventData) => {
                            const success = await addMatchEvent(currentMatch.id, eventData);
                            return success;
                        }}
                        onDeleteEvent={async (eventId) => {
                            const success = await deleteMatchEvent(currentMatch.id, eventId);
                            return success;
                        }}
                        onClose={() => setShowEventsModal(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default MatchDetailPage;
