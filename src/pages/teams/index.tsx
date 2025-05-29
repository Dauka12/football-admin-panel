import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TeamForm from '../../components/teams/TeamForm';
import { useTeamStore } from '../../store/teamStore';
import type { CreateTeamRequest } from '../../types/teams';

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();
  const { teams, isLoading, error, fetchTeams, deleteTeam, createTeam } = useTeamStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null);
  
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);
  
  const handleCreateTeam = async (data: CreateTeamRequest) => {
    const success = await createTeam(data);
    if (success) {
      setShowCreateForm(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (teamToDelete !== null) {
      await deleteTeam(teamToDelete);
      setTeamToDelete(null);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('teams.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('teams.createTeam')}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {isLoading && <p className="text-gray-300">{t('common.loading')}</p>}
      
      {!isLoading && teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">{t('teams.noTeams')}</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors"
          >
            {t('teams.createFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-card-bg rounded-lg overflow-hidden shadow-md">
              <div className="p-4 flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: team.primaryColor || '#ffcc00',
                    color: team.secondaryColor || '#002b3d'
                  }}
                >
                  {team.avatar ? (
                    <img src={team.avatar} alt={team.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="font-bold text-lg">{getInitials(team.name)}</span>
                  )}
                </div>
                <h3 className="font-semibold flex-1">{team.name}</h3>
              </div>
              
              <div className="px-4 pb-2">
                <p className="text-sm text-gray-300 truncate mb-2">{team.description}</p>
                <div className="text-xs text-gray-400 mb-2">
                  {t('teams.players')}: {team.players.length}
                </div>
              </div>
              
              <div className="border-t border-darkest-bg p-4 flex justify-between">
                <Link 
                  to={`/dashboard/teams/${team.id}`}
                  className="text-gold hover:underline text-sm"
                >
                  {t('common.viewDetails')}
                </Link>
                <button
                  onClick={() => setTeamToDelete(team.id)}
                  className="text-accent-pink hover:underline text-sm"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b border-darkest-bg">
              <h2 className="text-xl font-semibold">{t('teams.createTeam')}</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <TeamForm onSubmit={handleCreateTeam} onCancel={() => setShowCreateForm(false)} />
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {teamToDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">{t('teams.confirmDelete')}</h3>
              <p className="text-gray-300 mb-6">{t('teams.deleteWarning')}</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setTeamToDelete(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
