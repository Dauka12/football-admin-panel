import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '../../store/teamStore';
import type { TeamFullResponse } from '../../types/teams';
import Modal from '../ui/Modal';

interface TeamSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selectedIds: number[]) => void;
    currentSelectedIds: number[];
    title?: string;
    maxTeams?: number;
}

const TeamSelectionModal: React.FC<TeamSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentSelectedIds,
    title,
    maxTeams
}) => {
    const { t } = useTranslation();
    const { teams, fetchTeams, isLoading } = useTeamStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>(currentSelectedIds || []);
    const [availableTeams, setAvailableTeams] = useState<TeamFullResponse[]>([]);

    // Load teams when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchTeams();
        }
    }, [isOpen, fetchTeams]);

    // Filter teams when search query changes or teams load
    useEffect(() => {
        const filtered = teams.filter(team => {
            const matchesSearch = searchQuery.trim() === '' ||
                team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesSearch;
        });

        setAvailableTeams(filtered);
    }, [teams, searchQuery]);

    // Reset selected teams when modal opens with current selections
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(currentSelectedIds);
        }
    }, [isOpen, currentSelectedIds]);

    const handleTeamToggle = (teamId: number) => {
        setSelectedIds(prev => {
            if (prev.includes(teamId)) {
                return prev.filter(id => id !== teamId);
            } else {
                // Check max teams limit
                if (maxTeams && prev.length >= maxTeams) {
                    return prev; // Don't add if at max capacity
                }
                return [...prev, teamId];
            }
        });
    };

    const handleConfirm = () => {
        onSelect(selectedIds);
        onClose();
    };

    const handleSelectAll = () => {
        const allTeamIds = availableTeams.map(team => team.id);
        const idsToSelect = maxTeams ? allTeamIds.slice(0, maxTeams) : allTeamIds;
        setSelectedIds(idsToSelect);
    };

    const handleDeselectAll = () => {
        setSelectedIds([]);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || t('tournaments.selectTeams')}
        >
            <div className="space-y-4">
                {/* Search input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200
                     placeholder-gray-400 text-white"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Select/Deselect all buttons */}
                {availableTeams.length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <button
                            onClick={handleSelectAll}
                            disabled={!!(maxTeams && selectedIds.length >= maxTeams)}
                            className={`transition-colors ${maxTeams && selectedIds.length >= maxTeams
                                ? 'text-gray-500 cursor-not-allowed'
                                : 'text-gold hover:text-gold/80'
                                }`}
                        >
                            {maxTeams ? `${t('common.selectAll')} (max ${maxTeams})` : t('common.selectAll')}
                        </button>
                        <button
                            onClick={handleDeselectAll}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {t('common.deselectAll')}
                        </button>
                    </div>
                )}

                {/* Team list */}
                <div className="max-h-96 overflow-y-auto pr-1">
                    {isLoading ? (
                        <div className="py-8 flex justify-center">
                            <svg className="animate-spin h-6 w-6 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : availableTeams.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">
                            {searchQuery ? t('teams.noResultsFound') : t('teams.noTeams')}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {availableTeams.map((team) => {
                                const isSelected = selectedIds.includes(team.id);
                                const canSelect = isSelected || !maxTeams || selectedIds.length < maxTeams;

                                return (
                                    <div
                                        key={team.id}
                                        onClick={() => canSelect && handleTeamToggle(team.id)}
                                        className={`
                      p-4 rounded-lg border transition-all duration-200 flex items-center
                      ${!canSelect
                                                ? 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50'
                                                : isSelected
                                                    ? 'border-gold bg-gold/10 hover:bg-gold/20 cursor-pointer'
                                                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer'
                                            }
                    `}
                                    >
                                        <div
                                            className={`
                        w-6 h-6 rounded-md flex items-center justify-center mr-4 flex-shrink-0 transition-all
                        ${isSelected ? 'bg-gold text-black' : 'border border-gray-500'}
                      `}
                                        >
                                            {isSelected && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>

                                        <div
                                            className="w-10 h-10 rounded-full mr-4 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                                            style={{
                                                backgroundColor: team.primaryColor || '#ffcc00',
                                                color: team.secondaryColor || '#002b3d'
                                            }}
                                        >
                                            {team.avatar ? (
                                                <img src={team.avatar} alt={team.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                team.name.substring(0, 2).toUpperCase()
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                <div className="font-medium text-white">{team.name}</div>
                                                <div className="text-sm text-gray-400">
                                                    {team.players?.length || 0} {t('common.players')}
                                                </div>
                                            </div>
                                            {team.description && (
                                                <div className="text-sm text-gray-400 truncate mt-1">{team.description}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Selection summary and actions */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="mb-4 text-sm">
                        <span className="text-gold font-medium">{selectedIds.length}</span>
                        {maxTeams && <span className="text-gray-400">/{maxTeams}</span>}
                        {' '}{t('tournaments.teamsSelected')}
                        {maxTeams && selectedIds.length >= maxTeams && (
                            <div className="text-xs text-yellow-400 mt-1">
                                {t('tournaments.maxTeamsReached')}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 
                       transition-all duration-200 font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold/80 text-black rounded-lg 
                       hover:from-gold/90 hover:to-gold/70 transition-all duration-200 font-medium
                       shadow-lg hover:shadow-gold/20"
                        >
                            {t('common.select')}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default React.memo(TeamSelectionModal);
