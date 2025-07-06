import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import matchesIntegrationApi from '../../api/matchesIntegration';
import type { MatchFullResponse, MatchStatus } from '../../types/matches';
import type { MatchParticipant, MatchParticipantStatus } from '../../types/matchParticipants';
import type { MatchEvent } from '../../types/matchEvents';
import { showToast } from '../../utils/toast';
import { LoadingSpinner } from '../ui/LoadingIndicator';
import Breadcrumb from '../ui/Breadcrumb';

const MatchDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const matchId = parseInt(id || '0', 10);

    const [match, setMatch] = useState<MatchFullResponse | null>(null);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load complete match data
    useEffect(() => {
        const loadMatchData = async () => {
            if (!matchId) return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                const completeMatch = await matchesIntegrationApi.getCompleteMatch(matchId);
                setMatch(completeMatch.match);
                setParticipants(completeMatch.participants);
                setEvents(completeMatch.events);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load match data');
            } finally {
                setIsLoading(false);
            }
        };

        loadMatchData();
    }, [matchId]);

    // Handle status change
    const handleStatusChange = async (status: MatchStatus) => {
        try {
            await matchesIntegrationApi.updateMatchStatusWithNotification(
                matchId,
                status,
                `Match status changed to ${status}`
            );
            
            // Reload match data
            const completeMatch = await matchesIntegrationApi.getCompleteMatch(matchId);
            setMatch(completeMatch.match);
            showToast(t('matches.statusUpdated'), 'success');
        } catch (err) {
            showToast(t('matches.statusUpdateFailed'), 'error');
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status: MatchParticipantStatus): string => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-900/50 text-green-200';
            case 'WAITING_PAYMENT':
                return 'bg-yellow-900/50 text-yellow-200';
            case 'CANCELLED':
                return 'bg-red-900/50 text-red-200';
            default:
                return 'bg-gray-800/50 text-gray-300';
        }
    };

    // Get event icon
    const getEventIcon = (type: string): string => {
        switch (type) {
            case 'GOAL':
                return '⚽';
            case 'YELLOW_CARD':
                return '🟨';
            case 'RED_CARD':
                return '🟥';
            case 'PENALTY_GOAL':
                return '⚽🎯';
            case 'MISSED_PENALTY':
                return '❌';
            case 'OWN_GOAL':
                return '⚽🔄';
            default:
                return '📝';
        }
    };

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

    if (!match) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">{t('matches.notFound')}</p>
            </div>
        );
    }

    const breadcrumbs = [
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('matches.title'), href: '/dashboard/matches' },
        { label: `${t('matches.match')} #${match.id}` }
    ];

    return (
        <div className="animate-fade-in">
            <Breadcrumb items={breadcrumbs} />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">
                    {match.tournament?.name || `${t('matches.match')} #${match.id}`}
                </h1>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        match.status === 'PENDING' ? 'bg-blue-900/50 text-blue-200' :
                        match.status === 'IN_PROGRESS' ? 'bg-green-900/50 text-green-200' :
                        match.status === 'COMPLETED' ? 'bg-gray-800/50 text-gray-300' :
                        'bg-red-900/50 text-red-200'
                    }`}>
                        {match.status}
                    </span>
                </div>
            </div>

            {/* Match Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {/* Match Details */}
                <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('matches.details')}</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-400">{t('matches.startTime')}</label>
                            <p className="text-white">
                                {new Date(match.startTime).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">{t('matches.endTime')}</label>
                            <p className="text-white">
                                {new Date(match.endTime).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">{t('matches.playground')}</label>
                            <p className="text-white">{match.reservation?.playground?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">{t('matches.capacity')}</label>
                            <p className="text-white">
                                {participants.length} / {match.reservation?.playground?.maxCapacity || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Participants Summary */}
                <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('matchParticipants.title')}</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t('matchParticipants.total')}</span>
                            <span className="text-white font-semibold">{participants.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t('matchParticipants.statuses.confirmed')}</span>
                            <span className="text-green-400">
                                {participants.filter(p => p.status === 'CONFIRMED').length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t('matchParticipants.statuses.pending')}</span>
                            <span className="text-yellow-400">
                                {participants.filter(p => p.status === 'WAITING_PAYMENT').length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t('matchParticipants.paid')}</span>
                            <span className="text-blue-400">
                                {participants.filter(p => p.hasPaid).length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Events Summary */}
                <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('matchEvents.title')}</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t('matchEvents.total')}</span>
                            <span className="text-white font-semibold">{events.length}</span>
                        </div>
                        {events.length > 0 ? (
                            <div className="space-y-1">
                                {events.slice(0, 3).map((event, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            {getEventIcon(event.type)} {event.type}
                                        </span>
                                        <span className="text-white">{event.minute}'</span>
                                    </div>
                                ))}
                                {events.length > 3 && (
                                    <p className="text-xs text-gray-500">
                                        +{events.length - 3} {t('common.more')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">{t('matchEvents.noEvents')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Controls */}
            {match.status !== 'COMPLETED' && match.status !== 'CANCELLED' && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{t('matches.statusControl')}</h3>
                    <div className="flex gap-2">
                        {match.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange('IN_PROGRESS')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    {t('matches.startMatch')}
                                </button>
                                <button
                                    onClick={() => handleStatusChange('CANCELLED')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    {t('matches.cancelMatch')}
                                </button>
                            </>
                        )}
                        {match.status === 'IN_PROGRESS' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange('COMPLETED')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {t('matches.completeMatch')}
                                </button>
                                <button
                                    onClick={() => handleStatusChange('CANCELLED')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    {t('matches.cancelMatch')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Participants List */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{t('matchParticipants.list')}</h3>
                    <button
                        onClick={() => navigate(`/dashboard/match-participants/${matchId}`)}
                        className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors"
                    >
                        {t('matchParticipants.manage')}
                    </button>
                </div>
                
                {participants.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">{t('matchParticipants.noParticipants')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-2 text-gray-400">{t('matchParticipants.player')}</th>
                                    <th className="text-left py-2 text-gray-400">{t('matchParticipants.team')}</th>
                                    <th className="text-left py-2 text-gray-400">{t('matchParticipants.status')}</th>
                                    <th className="text-left py-2 text-gray-400">{t('matchParticipants.payment')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((participant) => (
                                    <tr key={participant.id} className="border-b border-gray-800">
                                        <td className="py-2 text-white">{participant.playerFullName}</td>
                                        <td className="py-2 text-white">{participant.teamName}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(participant.status)}`}>
                                                {participant.status}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <span className={`text-sm ${participant.hasPaid ? 'text-green-400' : 'text-red-400'}`}>
                                                {participant.hasPaid ? t('matchParticipants.paid') : t('matchParticipants.unpaid')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Events Timeline */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t('matchEvents.timeline')}</h3>
                
                {events.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">{t('matchEvents.noEvents')}</p>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-3 bg-darkest-bg rounded-lg">
                                <div className="text-2xl">{getEventIcon(event.type)}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white font-medium">{event.playerName}</p>
                                            <p className="text-gray-400 text-sm">{event.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold">{event.minute}'</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchDashboard;
