import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventType, MatchEvent, MatchFullResponse } from '../../types/matches';
import { showToast } from '../../utils/toast';

interface MatchEventsFormProps {
  match: MatchFullResponse;
  onAddEvent: (event: Omit<MatchEvent, 'id'>) => Promise<boolean>;
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
  
  // Form state
  const [newEvent, setNewEvent] = useState<{
    playerId: number | null;
    type: EventType;
    minute: number;
  }>({
    playerId: null,
    type: 'GOAL',
    minute: 0
  });
  
  // Event type options
  const eventTypes: { value: EventType; label: string }[] = [
    { value: 'GOAL', label: t('matches.events.goal') },
    { value: 'CARD', label: t('matches.events.card') },
    { value: 'SUBSTITUTION', label: t('matches.events.substitution') },
    { value: 'INJURY', label: t('matches.events.injury') }
  ];
  
  // Get all players from both teams for dropdown
  const getAllPlayers = () => {
    const players: { id: number; name: string }[] = [];
    
    match.participants.forEach(participant => {
      if (participant.team.players) {
        participant.team.players.forEach(player => {
          if (player.id && player.user) {
            players.push({
              id: player.id,
              name: `${player.user.firstname} ${player.user.lastname} (${participant.team.name})`
            });
          }
        });
      }
    });
    
    return players;
  };
  
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
    
    // Get player object by ID from match data
    const playerObj = match.participants.flatMap(p => 
      p.team.players || []).find(player => player.id === newEvent.playerId);
    
    if (!playerObj) {
      showToast(t('matches.events.playerNotFound'), 'error');
      setIsLoading(false);
      return;
    }
      
    // Create event object
    const event = {
      match: match.id.toString(),
      player: playerObj,
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
  
  const players = getAllPlayers();
  
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
                      {event.player?.user?.firstname} {event.player?.user?.lastname}
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
            <select
              id="playerId"
              name="playerId"
              value={newEvent.playerId || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold border-gray-700"
              disabled={isLoading || players.length === 0}
            >
              <option value="">{t('matches.events.selectPlayer')}</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
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
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              {t('common.close')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !newEvent.playerId || newEvent.minute <= 0}
              className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors flex items-center"
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
