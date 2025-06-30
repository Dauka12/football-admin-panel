import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatchParticipantStore } from '../../store/matchParticipantStore';
import MatchParticipantsList from '../../components/matchParticipants/MatchParticipantsList';
import type { OrganizedMatchParticipant, MatchParticipant } from '../../types/matchParticipants';

export default function MatchParticipantsOverviewPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const {
        organizedMatches,
        isLoading,
        error,
        fetchOrganizedMatches
    } = useMatchParticipantStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrganizedMatches();
    }, [fetchOrganizedMatches]);

    const handleEditClick = (participant: OrganizedMatchParticipant | MatchParticipant) => {
        // Navigate to the specific match participants page
        navigate(`/dashboard/match-participants/${participant.id}`);
    };

    const handleDeleteParticipant = async (_participant: OrganizedMatchParticipant | MatchParticipant) => {
        // For now, just show an alert - in real app would handle deletion
        alert('Deletion would be handled through individual match management');
    };

    const filteredParticipants = organizedMatches.filter(participant => {
        // Search filter - if no search term, show all
        const matchesSearch = !searchTerm.trim() || 
            (participant.playerFullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (participant.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('matchParticipants.title')}</h1>
                    <p className="text-gray-400">{t('sidebar.match-participants')}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-white mb-4">{t('common.filters')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {t('common.search')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('matchParticipants.search.searchByPlayer')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {t('matchParticipants.status')}
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value="all">{t('matchParticipants.search.allStatuses')}</option>
                            <option value="CONFIRMED">{t('matchParticipants.statuses.confirmed')}</option>
                            <option value="WAITING_PAYMENT">{t('matchParticipants.statuses.pending')}</option>
                            <option value="CANCELLED">{t('matchParticipants.statuses.cancelled')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Participants List */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                    {t('matchParticipants.title')} ({filteredParticipants.length})
                </h3>
                {filteredParticipants.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>{t('matchParticipants.noParticipants')}</p>
                        <p className="text-sm mt-2">{t('common.goToMatchesToManageParticipants')}</p>
                    </div>
                ) : (
                    <MatchParticipantsList
                        participants={filteredParticipants}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteParticipant}
                    />
                )}
            </div>
        </div>
    );
}
