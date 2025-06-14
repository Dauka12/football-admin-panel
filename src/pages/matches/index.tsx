import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import MatchForm from '../../components/matches/MatchForm';
import Modal from '../../components/ui/Modal';
import { useMatchStore } from '../../store/matchStore';
import { useTournamentStore } from '../../store/tournamentStore';
import type { CreateMatchRequest, MatchListResponse, MatchStatus } from '../../types/matches';
import { formatDateTime } from '../../utils/dateUtils.ts';
import { showToast } from '../../utils/toast';

// Sort options for the match list
type SortOption = 'date-asc' | 'date-desc' | 'status';

const MatchesPage: React.FC = () => {
  const { t } = useTranslation();
  const { matches, isLoading, error, fetchMatches, createMatch, deleteMatch } = useMatchStore();
  const { tournaments, fetchTournaments } = useTournamentStore();
  
  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<MatchStatus | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  
  // Data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchMatches(true), // Force refresh
          fetchTournaments()
        ]);
      } catch (error) {
        console.error("Error loading match data:", error);
        // The error will be handled by the store error states
      }
    };
    loadData();
  }, [fetchMatches, fetchTournaments]);
  
  // Filtered matches
  const filteredMatches = useMemo(() => {
    // Make sure matches is an array
    if (!matches || !Array.isArray(matches)) {
      console.log('No matches found or matches is not an array:', matches);
      return [];
    }
    
    // Debug log all matches
    console.log('Matches data for filtering:', matches);
    console.log('Number of matches:', matches.length);
    
    let result = [...matches];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(match => {
        // Search in participant team names
        return match.participants && Array.isArray(match.participants) && match.participants.some(p => 
          p.teamName && p.teamName.toLowerCase().includes(query)
        );
      });
    }
    
    // Filter by tournament
    if (tournamentFilter) {
      result = result.filter(match => match.tournament && match.tournament.id === tournamentFilter);
    }
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(match => 
        match.status && match.status.toUpperCase() === statusFilter.toUpperCase()
      );
    }
    
    // Sort the results
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return getDateTimeValue(a.matchDate) - getDateTimeValue(b.matchDate);
        case 'date-desc':
          return getDateTimeValue(b.matchDate) - getDateTimeValue(a.matchDate);
        case 'status':
          const statusA = a.status || '';
          const statusB = b.status || '';
          return statusA.localeCompare(statusB);
        default:
          return 0;
      }
    });
    
    // Helper function to safely parse dates of different formats
    function getDateTimeValue(dateValue: string | number): number {
      if (typeof dateValue === 'number') {
        // Check if timestamp is in seconds (10 digits) or milliseconds (13 digits)
        if (dateValue.toString().length === 10) {
          return dateValue * 1000; // Convert seconds to milliseconds
        }
        return dateValue;
      }
      
      // Check if it's a pure numeric string (timestamp)
      const maybeTimestamp = parseInt(dateValue, 10);
      if (!isNaN(maybeTimestamp) && dateValue === maybeTimestamp.toString()) {
        // It's a pure numeric string - treat as timestamp
        if (maybeTimestamp.toString().length === 10) {
          return maybeTimestamp * 1000; // Convert seconds to milliseconds
        }
        return maybeTimestamp;
      }
      
      // Parse as ISO date string (like "2025-06-08")
      return new Date(dateValue).getTime();
    }
    
    return result;
  }, [matches, searchQuery, tournamentFilter, statusFilter, sortBy]);
  
  // Handle create match form submission
  const handleCreateMatch = async (data: CreateMatchRequest) => {
    const matchId = await createMatch(data);
    if (matchId) {
      setShowCreateForm(false);
      showToast(t('matches.createSuccess'), 'success');
    }
  };
  
  // Handle delete match confirmation
  const handleConfirmDelete = async () => {
    if (matchToDelete !== null) {
      const success = await deleteMatch(matchToDelete);
      if (success) {
        showToast(t('matches.deleteSuccess'), 'success');
      }
      setMatchToDelete(null);
    }
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string | undefined | null): string => {
    if (!status) {
      return 'bg-gray-800/50 text-gray-300';
    }
    
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-blue-900/50 text-blue-200';
      case 'LIVE':
        return 'bg-green-900/50 text-green-200';
      case 'COMPLETED':
        return 'bg-gray-800/50 text-gray-300';
      case 'CANCELLED':
        return 'bg-red-900/50 text-red-200';
      default:
        return 'bg-gray-800/50 text-gray-300';
    }
  };
  
  return (
    <div className="animate-fade-in">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{t('matches.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gold text-darkest-bg px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-sm sm:text-base">{t('matches.createMatch')}</span>
        </button>
      </div>
      
      {/* Filters section */}
      <div className="flex flex-col sm:flex-row mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t('matches.searchByTeam')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-card-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
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
        
        <div className="sm:w-72">
          <select
            value={tournamentFilter || ''}
            onChange={(e) => setTournamentFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full px-3 py-2 bg-card-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
          >
            <option value="">{t('matches.allTournaments')}</option>
            {tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="sm:w-52">
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value ? e.target.value as MatchStatus : null)}
            className="w-full px-3 py-2 bg-card-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
          >
            <option value="">{t('matches.status.allStatuses')}</option>
            <option value="PENDING">{t('matches.status.pending')}</option>
            <option value="LIVE">{t('matches.status.live')}</option>
            <option value="COMPLETED">{t('matches.status.completed')}</option>
            <option value="CANCELLED">{t('matches.status.cancelled')}</option>
          </select>
        </div>
        
        {/* Sort by section */}
        <div className="sm:w-52">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-3 py-2 bg-card-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
          >
            <option value="date-desc">{t('matches.sort.dateDesc')}</option>
            <option value="date-asc">{t('matches.sort.dateAsc')}</option>
            <option value="status">{t('matches.sort.status')}</option>
          </select>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && <p className="text-gray-300">{t('common.loading')}</p>}
      
      {/* Empty state */}
      {!isLoading && (!filteredMatches || filteredMatches.length === 0) ? (
        <div className="text-center py-12">
          {searchQuery || tournamentFilter || statusFilter ? (
            <p className="text-gray-400 mb-4">{t('matches.noResultsFound')}</p>
          ) : (
            <>
              <p className="text-gray-400 mb-4">{t('matches.noMatches')}</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
              >
                {t('matches.createFirst')}
              </button>
            </>
          )}
        </div>
      ) : (
        /* Matches list */
        <div className="space-y-4">
          {Array.isArray(filteredMatches) && filteredMatches.map((match: MatchListResponse) => (
            <div key={match.id} className="bg-card-bg rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-[1.01] hover:shadow-lg">
              {/* Match header */}
              <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-darkest-bg/70">
                <div>
                  <span className="text-gray-400 text-sm">{t('matches.matchId')}: {match.id}</span>
                  <h3 className="font-semibold text-lg">
                    {match.tournament ? match.tournament.name : 'No Tournament'}
                  </h3>
                  <div className="text-sm text-gray-300">
                    {formatDateTime(match.matchDate)}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-md ${getStatusBadgeClass(match.status)} mt-2 sm:mt-0`}>
                  {match.status || 'Unknown'}
                </span>
              </div>
              
              {/* Teams */}
              <div className="p-4">
                {Array.isArray(match.participants) && match.participants.map((participant) => (
                  <div key={`${match.id}-${participant.teamId}`} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-lg font-bold text-gold mr-2">
                          {participant.score !== undefined && participant.score !== null ? participant.score : 0}
                        </div>
                        <span>{participant.teamName}</span>
                      </div>
                      {participant.playerFullName && (
                        <div className="text-sm text-gray-400">
                          {t('matches.player')}: {participant.playerFullName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Actions */}
              <div className="border-t border-darkest-bg p-4 flex justify-between">
                <Link
                  to={`/dashboard/matches/${match.id}`}
                  className="text-gold hover:underline text-sm transition-colors duration-200"
                >
                  {t('common.viewDetails')}
                </Link>
                <button
                  onClick={() => setMatchToDelete(match.id)}
                  className="text-accent-pink hover:underline text-sm transition-colors duration-200"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Match Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={t('matches.createMatch')}
        hasDatePicker={true}
      >
        <MatchForm 
          onSubmit={handleCreateMatch} 
          onCancel={() => setShowCreateForm(false)} 
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={matchToDelete !== null}
        onClose={() => setMatchToDelete(null)}
        title={t('matches.confirmDelete')}
      >
        <div>
          <p className="text-gray-300 mb-6">{t('matches.deleteWarning')}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setMatchToDelete(null)}
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

export default MatchesPage;
