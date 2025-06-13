import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { playerApi } from '../../api/players';
import type { EventType, MatchFullResponse } from '../../types/matches';
import type { PlayerPublicResponse } from '../../types/players';
import { showToast } from '../../utils/toast';

interface MatchEventsFormProps {
  match: MatchFullResponse;
  onAddEvent: (event: { playerId: number, type: string, minute: number }) => Promise<boolean>;
  onDeleteEvent: (eventId: number) => Promise<boolean>;
  onClose: () => void;
}

const MatchEventsForm: React.FC<MatchEventsFormProps> = ({
  match,
  onAddEvent,
  onDeleteEvent,
  onClose
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [players, setPlayers] = useState<{ id: number; name: string; teamName?: string }[]>([]);
  
  // Form state
  const [newEvent, setNewEvent] = useState<{
    playerId: number | null;
    type: EventType;
    minute: number;
  }>({
    playerId: null,
    type: 'GOAL', // This is one of the valid API event types
    minute: 0
  });
  
  // Event type options - updated to match API requirements
  const eventTypes: { value: EventType; label: string }[] = [
    { value: 'GOAL', label: t('matches.events.goal') || 'Goal' },
    { value: 'PENALTY_GOAL', label: t('matches.events.penaltyGoal') || 'Penalty Goal' },
    { value: 'MISSED_PENALTY', label: t('matches.events.missedPenalty') || 'Missed Penalty' },
    { value: 'OWN_GOAL', label: t('matches.events.ownGoal') || 'Own Goal' },
    { value: 'YELLOW_CARD', label: t('matches.events.yellowCard') || 'Yellow Card' },
    { value: 'RED_CARD', label: t('matches.events.redCard') || 'Red Card' },
    { value: 'SECOND_YELLOW', label: t('matches.events.secondYellow') || 'Second Yellow Card' }
  ];

  // Fetch all players when component mounts
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        // Fetch players from API with a larger page size to get most/all players
        const result = await playerApi.getAll(0, 500); // Increase size to get more players
        
        if (result && result.content) {
          // Create a lookup for team names by team ID
          const teamNames: {[key: number]: string} = {};
          match.participants.forEach(participant => {
            if (participant.team && participant.team.id) {
              teamNames[participant.team.id] = participant.team.name;
            }
          });
          
          // Map players to the format needed for the dropdown
          const mappedPlayers = result.content.map((player: PlayerPublicResponse) => {
            // Create a more descriptive player name
            let displayName = '';
            
            // Use position if available
            const position = player.position ? `(${player.position})` : '';
            
            // Use nationality if available for additional context
            const nationality = player.nationality ? `[${player.nationality}]` : '';
            
            // Format the display name with all available information
            displayName = `${player.club ? player.club : 'Unknown team'} - Player #${player.id} ${position} ${nationality}`.trim();
            
            return {
              id: player.id,
              name: displayName,
              teamName: player.club
            };
          });
          
          // Sort players by team name for better organization
          const sortedPlayers = mappedPlayers.sort((a, b) => {
            // First sort by team name
            if (a.teamName && b.teamName && a.teamName !== b.teamName) {
              return a.teamName.localeCompare(b.teamName);
            }
            // Then by player ID as fallback
            return a.id - b.id;
          });
          
          setPlayers(sortedPlayers);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
        showToast(t('errors.fetchPlayersFailed') || 'Failed to fetch players', 'error');
      } finally {
        setIsLoadingPlayers(false);
      }
    };
    
    fetchPlayers();
  }, [match.id, t]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setNewEvent(prev => ({
      ...prev,
      [name]: name === 'playerId' ? (value ? parseInt(value, 10) : null) : 
              name === 'minute' ? parseInt(value, 10) : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.playerId) {
      showToast(t('matches.events.selectPlayer'), 'error');
      return;
    }
    
    if (newEvent.minute <= 0) {
      showToast(t('matches.events.invalidMinute'), 'error');
      return;
    }
    
    setIsLoading(true);
    
    // Create event object using the player ID directly
    const event = {
      playerId: newEvent.playerId,
      type: newEvent.type,
      minute: newEvent.minute
    };
    
    const success = await onAddEvent(event);
    
    if (success) {
      // Reset form
      setNewEvent({
        playerId: null,
        type: 'GOAL',
        minute: 0
      });
      showToast(t('matches.events.addSuccess'), 'success');
    }
    
    setIsLoading(false);
  };
  
  // Handle delete event
  const handleDeleteEvent = async (eventId: number) => {
    if (confirm(t('matches.events.confirmDelete'))) {
      setIsLoading(true);
      const success = await onDeleteEvent(eventId);
      setIsLoading(false);
      
      if (success) {
        showToast(t('matches.events.deleteSuccess'), 'success');
      }
    }
  };
  
  // Get event type display name
  const getEventTypeDisplay = (type: string): string => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.label : type;
  };
  
  // Find player name by ID for display in the events list
  const getPlayerNameById = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : `Player #${playerId}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Current events list */}
      <div>
        <h3 className="font-medium mb-3">{t('matches.events.current')}</h3>
        {match.events && match.events.length > 0 ? (
          <div className="bg-darkest-bg border border-gray-700 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-card-bg">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t('matches.minute')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t('matches.player')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t('matches.eventType')}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {match.events.map((event) => (
                  <tr key={event.id} className="hover:bg-darkest-bg/50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {event.minute}'
                    </td>
                    <td className="px-4 py-2">
                      {event.playerName || getPlayerNameById(event.playerId)}
                    </td>
                    <td className="px-4 py-2">
                      {getEventTypeDisplay(event.type)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={isLoading}
                        className="text-accent-pink hover:underline text-sm"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 bg-darkest-bg rounded-md border border-gray-700 text-sm text-gray-400">
            {t('matches.noEvents')}
          </div>
        )}
      </div>
      
      {/* Add new event form */}
      <div>
        <h3 className="font-medium mb-3">{t('matches.events.add')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-darkest-bg p-4 rounded-md border border-gray-700">
          {/* Player selection */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="playerId">
              {t('matches.player')} *
            </label>
            
            {/* Player select with improved UI */}
            <div className="relative">
              {isLoadingPlayers && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              
              <select
                id="playerId"
                name="playerId"
                value={newEvent.playerId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold border-gray-700"
                disabled={isLoading || players.length === 0}
                style={{ maxHeight: '300px' }}
              >
                <option value="">
                  {isLoadingPlayers 
                    ? t('common.loading') || 'Loading players...'
                    : t('matches.events.selectPlayer') || 'Select player'
                  }
                </option>
                
                {/* Group players by team */}
                {(() => {
                  const teams: { [key: string]: { id: number; name: string }[] } = {};
                  
                  players.forEach(player => {
                    const teamName = player.teamName || 'Unknown Team';
                    if (!teams[teamName]) teams[teamName] = [];
                    teams[teamName].push(player);
                  });
                  
                  return Object.keys(teams).sort().map(teamName => (
                    <optgroup key={teamName} label={teamName}>
                      {teams[teamName].map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </optgroup>
                  ));
                })()}
              </select>
            </div>
            
            {/* Show player count */}
            <div className="text-xs text-gray-400 mt-1">
              {isLoadingPlayers 
                ? 'Loading players...' 
                : `${players.length} players available`
              }
            </div>
          </div>
          
          {/* Event type */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="type">
              {t('matches.eventType')} *
            </label>
            <select
              id="type"
              name="type"
              value={newEvent.type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold border-gray-700"
              disabled={isLoading}
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Minute */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="minute">
              {t('matches.minute')} *
            </label>
            <input
              type="number"
              id="minute"
              name="minute"
              min="1"
              max="120"
              value={newEvent.minute}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold border-gray-700"
              disabled={isLoading}
            />
          </div>
          
          {/* Form actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              {t('common.close')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !newEvent.playerId || newEvent.minute <= 0}
              className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors flex items-center justify-center text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.saving')}
                </>
              ) : (
                t('matches.events.addButton')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchEventsForm;
