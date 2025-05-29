import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../store/playerStore';
import type { PlayerPublicResponse } from '../../types/players';
import Modal from '../ui/Modal';

interface PlayerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selectedIds: number[]) => void;
    currentSelectedIds: number[];
    currentTeamId?: number;
    title?: string;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentSelectedIds,
    currentTeamId,
    title
}) => {
    const { t } = useTranslation();
    const { players, fetchPlayers, isLoading } = usePlayerStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>(currentSelectedIds || []);
    const [availablePlayers, setAvailablePlayers] = useState<PlayerPublicResponse[]>([]);

    // Load players when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPlayers();
        }
    }, [isOpen, fetchPlayers]);

    // Filter players when search query changes or players load
    useEffect(() => {
        // Filter by search query
        const filtered = players.filter(player => {
            const matchesSearch = searchQuery.trim() === '' ||
                player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                player.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                player.club.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch;
        });

        setAvailablePlayers(filtered);
    }, [players, searchQuery]);

    // Reset selected players when modal opens with current selections
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(currentSelectedIds);
        }
    }, [isOpen, currentSelectedIds]);

    const handleTogglePlayer = (playerId: number) => {
        setSelectedIds(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [...prev, playerId]
        );
    };

    const handleConfirm = () => {
        onSelect(selectedIds);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || t('teams.selectPlayers')}
        >
            <div className="space-y-4">
                {/* Search input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Player list */}
                <div className="max-h-96 overflow-y-auto pr-1">
                    {isLoading ? (
                        <div className="py-8 flex justify-center">
                            <svg className="animate-spin h-6 w-6 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : availablePlayers.length === 0 ? (
                        <p className="text-center py-4 text-gray-400">{t('players.noResults')}</p>
                    ) : (
                        <div className="space-y-2">
                            {availablePlayers.map(player => (
                                <div
                                    key={player.id}
                                    onClick={() => handleTogglePlayer(player.id)}
                                    className={`
                    p-3 rounded-md cursor-pointer transition-all duration-200 flex items-center
                    ${selectedIds.includes(player.id)
                                            ? 'bg-gold/20 border border-gold'
                                            : 'bg-darkest-bg hover:bg-darkest-bg/70'
                                        }
                  `}
                                >
                                    <div
                                        className={`
                      w-6 h-6 rounded-md flex items-center justify-center mr-3 flex-shrink-0
                      ${selectedIds.includes(player.id) ? 'bg-gold text-darkest-bg' : 'border border-gray-500'}
                    `}
                                    >
                                        {selectedIds.includes(player.id) && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                            <div className="font-medium">{player.position}</div>
                                            <div className="text-sm text-gray-400">{player.nationality}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">{player.club}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selection summary and actions */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="mb-4 text-sm">
                        <span className="text-gold">{selectedIds.length}</span> {t('teams.playersSelected')}
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors"
                        >
                            {t('common.select')}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PlayerSelectionModal;
