import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TeamForm from '../../components/teams/TeamForm';
import Modal from '../../components/ui/Modal';
import { useTeamStore } from '../../store/teamStore';
import type { CreateTeamRequest, TeamFullResponse } from '../../types/teams';

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();
  const { teams, isLoading, error, fetchTeams, deleteTeam, createTeam } = useTeamStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeams, setFilteredTeams] = useState<TeamFullResponse[]>([]);
  
  // Ensure we fetch teams on mount and when returning to page
  useEffect(() => {
    // Force refresh teams list regardless of cache
    const loadTeams = async () => {
      await fetchTeams(true); // Pass true to force refresh
    };
    loadTeams();
  }, [fetchTeams]);
  
  // Filter teams whenever the search query changes
  useEffect(() => {
    if (teams) {
      const filtered = teams.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [teams, searchQuery]);
  
  const handleCreateTeam = async (data: CreateTeamRequest) => {
    const success = await createTeam(data);
    if (success) {
      setShowCreateForm(false);
      
      // Force refresh the teams list after creation
      await fetchTeams(true);
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
      {/* Header section with responsive layout - button always on the right */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{t('teams.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gold text-darkest-bg px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-sm sm:text-base">{t('teams.createTeam')}</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder={t('common.searchByName')}
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
      
      {isLoading && <p className="text-gray-300">{t('common.loading')}</p>}
      
      {!isLoading && filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <p className="text-gray-400 mb-4">{t('teams.noResultsFound')}</p>
          ) : (
            <>
              <p className="text-gray-400 mb-4">{t('teams.noTeams')}</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
              >
                {t('teams.createFirst')}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-card-bg rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-103 hover:shadow-lg">
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
                  className="text-gold hover:underline text-sm transition-colors duration-200"
                >
                  {t('common.viewDetails')}
                </Link>
                <button
                  onClick={() => setTeamToDelete(team.id)}
                  className="text-accent-pink hover:underline text-sm transition-colors duration-200"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Team Modal */}
      <Modal 
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={t('teams.createTeam')}
      >
        <TeamForm onSubmit={handleCreateTeam} onCancel={() => setShowCreateForm(false)} />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={teamToDelete !== null}
        onClose={() => setTeamToDelete(null)}
        title={t('teams.confirmDelete')}
      >
        <div>
          <p className="text-gray-300 mb-6">{t('teams.deleteWarning')}</p>
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setTeamToDelete(null)}
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

export default TeamsPage;
