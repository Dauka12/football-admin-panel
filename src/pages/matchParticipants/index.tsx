import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatchParticipantStore } from '../../store/matchParticipantStore';
import MatchParticipantsList from '../../components/matchParticipants/MatchParticipantsList';
import MatchParticipantForm from '../../components/matchParticipants/MatchParticipantForm';
import type { MatchParticipant, OrganizedMatchParticipant } from '../../types/matchParticipants';
import type { MatchFullResponse } from '../../types/matches';

export default function MatchParticipantsPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const {
        participants,
        isLoading,
        error,
        fetchParticipants,
        createParticipant,
        updateParticipant,
        deleteParticipant
    } = useMatchParticipantStore();

    const [match] = useState<MatchFullResponse | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<MatchParticipant | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (matchId) {
            loadData();
        }
    }, [matchId]);

    const loadData = async () => {
        if (!matchId) return;
        
        try {
            // Load participants
            await fetchParticipants(parseInt(matchId));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleCreateParticipant = async (data: any) => {
        try {
            const success = await createParticipant({
                ...data,
                matchId: parseInt(matchId!)
            });
            if (success) {
                setIsCreateDialogOpen(false);
            }
        } catch (error) {
            console.error('Error creating participant:', error);
        }
    };

    const handleEditParticipant = async (data: any) => {
        if (!selectedParticipant) return;
        
        try {
            const success = await updateParticipant(selectedParticipant.id, data);
            if (success) {
                setIsEditDialogOpen(false);
                setSelectedParticipant(null);
            }
        } catch (error) {
            console.error('Error updating participant:', error);
        }
    };

    const handleDeleteParticipant = async (participant: MatchParticipant | OrganizedMatchParticipant) => {
        try {
            await deleteParticipant(participant.id);
        } catch (error) {
            console.error('Error deleting participant:', error);
        }
    };

    const handleEditClick = (participant: MatchParticipant | OrganizedMatchParticipant) => {
        setSelectedParticipant(participant as MatchParticipant);
        setIsEditDialogOpen(true);
    };

    const filteredParticipants = participants.filter(participant => {
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
                    <p className="text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard/matches')}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                        ← {t('common.back')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/matches')}
                        className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-white"
                    >
                        ← {t('common.back')}
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{t('matchParticipants.title')}</h1>
                        {match && (
                            <p className="text-gray-400">
                                {match.startTime && new Date(match.startTime).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="px-4 py-2 bg-gold text-darkest-bg rounded hover:bg-gold/90 transition-colors"
                >
                    + {t('matchParticipants.createParticipant')}
                </button>
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
                <MatchParticipantsList
                    participants={filteredParticipants}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteParticipant}
                />
            </div>

            {/* Create Dialog */}
            {isCreateDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium text-white mb-4">{t('matchParticipants.createParticipant')}</h3>
                        <MatchParticipantForm
                            matchId={parseInt(matchId!)}
                            onSubmit={handleCreateParticipant}
                            onCancel={() => setIsCreateDialogOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            {isEditDialogOpen && selectedParticipant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium text-white mb-4">{t('matchParticipants.editParticipant')}</h3>
                        <MatchParticipantForm
                            initialData={selectedParticipant}
                            matchId={parseInt(matchId!)}
                            onSubmit={handleEditParticipant}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedParticipant(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
