import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PlayerForm from '../../components/players/PlayerForm';
import Modal from '../../components/ui/Modal';
import { usePlayerStore } from '../../store/playerStore';
import type { PlayerCreateRequest } from '../../types/players';

const PlayersPage: React.FC = () => {
  const { t } = useTranslation();
  const { players, isLoading, error, fetchPlayers, createPlayer, deletePlayer } = usePlayerStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
  
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);
  
  const handleCreatePlayer = async (data: PlayerCreateRequest) => {
    const success = await createPlayer(data);
    if (success) {
      setShowCreateForm(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (playerToDelete !== null) {
      await deletePlayer(playerToDelete);
      setPlayerToDelete(null);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('players.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('players.createPlayer')}
        </button>
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
      
      {!isLoading && players.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">{t('players.noPlayers')}</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
          >
            {t('players.createFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div key={player.id} className="bg-card-bg rounded-lg overflow-hidden shadow-md transition-transform duration-200 hover:transform hover:scale-103 hover:shadow-lg">
              <div className="p-4 flex items-center space-x-3 border-b border-darkest-bg">
                <div className="w-12 h-12 rounded-full bg-gold text-darkest-bg flex items-center justify-center font-bold text-lg">
                  {player.id}
                </div>
                <div>
                  <h3 className="font-semibold">{player.position}</h3>
                  <p className="text-sm text-gray-300">{player.club}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">{t('players.nationality')}:</span>
                    <p>{player.nationality}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">{t('players.age')}:</span>
                    <p>{player.age}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">{t('players.height')}:</span>
                    <p>{player.height} cm</p>
                  </div>
                  <div>
                    <span className="text-gray-400">{t('players.weight')}:</span>
                    <p>{player.weight} kg</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">{t('players.preferredFoot')}:</span>
                    <p>{getPreferredFootLabel(player.preferredFoot)}</p>
                  </div>
                </div>
                
                {player.bio && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">{t('players.bio')}:</span>
                    <p className="line-clamp-2">{player.bio}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-darkest-bg p-4 flex justify-between">
                <Link 
                  to={`/dashboard/players/${player.id}`}
                  className="text-gold hover:underline text-sm transition-colors duration-200"
                >
                  {t('common.viewDetails')}
                </Link>
                <button
                  onClick={() => setPlayerToDelete(player.id)}
                  className="text-accent-pink hover:underline text-sm transition-colors duration-200"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
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
