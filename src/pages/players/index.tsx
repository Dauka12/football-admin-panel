import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PlayerForm from '../../components/players/PlayerForm';
import Modal from '../../components/ui/Modal';
import { usePlayerStore } from '../../store/playerStore';
import type { PlayerCreateRequest, PlayerPublicResponse } from '../../types/players';

const PlayersPage: React.FC = () => {
  const { t } = useTranslation();
  const { players, isLoading, error, fetchPlayers, createPlayer, deletePlayer } = usePlayerStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerPublicResponse[]>([]);
  
  useEffect(() => {
    // Force refresh players list
    fetchPlayers(true);
  }, [fetchPlayers]);
  
  // Filter players whenever the search query changes
  useEffect(() => {
    if (players) {
      const filtered = players.filter(player => 
        player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nationality.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  }, [players, searchQuery]);
  
  const handleCreatePlayer = async (data: PlayerCreateRequest) => {
    const success = await createPlayer(data);
    if (success) {
      setShowCreateForm(false);
      // Force refresh players list
      await fetchPlayers(true);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (playerToDelete !== null) {
      await deletePlayer(playerToDelete);
      setPlayerToDelete(null);
      // Refresh players list
      await fetchPlayers(true);
    }
  };
  
  const getPreferredFootLabel = (foot: string) => {
    switch (foot) {
      case 'LEFT': return t('players.leftFoot');
      case 'RIGHT': return t('players.rightFoot');
      case 'BOTH': return t('players.bothFeet');
      default: return foot;
    }
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">{t('players.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('players.createPlayer')}
        </button>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder={t('common.searchByPosition')}
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
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {!isLoading && filteredPlayers.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <p className="text-gray-400 mb-4">{t('players.noResultsFound')}</p>
          ) : (
            <>
              <p className="text-gray-400 mb-4">{t('players.noPlayers')}</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
              >
                {t('players.createFirst')}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-darkest-bg">
                <tr>
                  <th className="px-4 py-3 text-left">{t('players.position')}</th>
                  <th className="px-4 py-3 text-left">{t('players.club')}</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">{t('players.nationality')}</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">{t('players.age')}</th>
                  <th className="px-4 py-3 text-center hidden lg:table-cell">{t('players.preferredFoot')}</th>
                  <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="border-t border-gray-700 hover:bg-darkest-bg/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gold text-darkest-bg rounded-full flex items-center justify-center font-bold mr-3">
                          {player.id}
                        </div>
                        <span>{player.position}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{player.club}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{player.nationality}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{player.age}</td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">{getPreferredFootLabel(player.preferredFoot)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/dashboard/players/${player.id}`}
                          className="text-gold hover:text-gold/80 transition-colors p-1"
                          title={t('common.viewDetails')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setPlayerToDelete(player.id)}
                          className="text-accent-pink hover:text-accent-pink/80 transition-colors p-1"
                          title={t('common.delete')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Create Player Modal */}
      <Modal 
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={t('players.createPlayer')}
      >
        <PlayerForm 
          onSubmit={handleCreatePlayer} 
          onCancel={() => setShowCreateForm(false)} 
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={playerToDelete !== null}
        onClose={() => setPlayerToDelete(null)}
        title={t('players.confirmDelete')}
      >
        <div>
          <p className="text-gray-300 mb-6">{t('players.deleteWarning')}</p>
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setPlayerToDelete(null)}
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

export default PlayersPage;
