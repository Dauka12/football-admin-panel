import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MatchEvent } from '../../types/matchEvents';

interface MatchEventsListProps {
  events: MatchEvent[];
}

const MatchEventsList: React.FC<MatchEventsListProps> = ({ 
  events
}) => {
  const { t } = useTranslation();

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{t('matchEvents.noEvents')}</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'GOAL':
      case 'PENALTY_GOAL':
        return (
          <div className="w-8 h-8 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.75V12a2.25 2.25 0 00-2.25-2.25H8.25A2.25 2.25 0 006 12v.75m12 0V16.5" />
            </svg>
          </div>
        );
      case 'OWN_GOAL':
        return (
          <div className="w-8 h-8 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.75V12a2.25 2.25 0 00-2.25-2.25H8.25A2.25 2.25 0 006 12v.75m12 0V16.5" />
            </svg>
          </div>
        );
      case 'YELLOW_CARD':
      case 'SECOND_YELLOW':
        return (
          <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>
          </div>
        );
      case 'RED_CARD':
        return (
          <div className="w-8 h-8 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
          </div>
        );
      case 'MISSED_PENALTY':
        return (
          <div className="w-8 h-8 bg-gray-500/20 border border-gray-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-500/20 border border-gray-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <div className="space-y-3">
      {sortedEvents.map((event) => (
        <div key={event.id} className="bg-card-bg border border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getEventIcon(event.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="font-medium text-gold">
                    {t(`matchEvents.types.${event.type.toLowerCase()}`)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {event.minute}'
                  </span>
                </div>
                
                {event.playerName && (
                  <p className="text-sm text-gray-300 mb-1">
                    <span className="text-gray-400">{t('players.player')}:</span> {event.playerName}
                  </p>
                )}
                
                {event.teamName && (
                  <p className="text-sm text-gray-300 mb-1">
                    <span className="text-gray-400">{t('teams.team')}:</span> {event.teamName}
                  </p>
                )}
                
                {event.description && (
                  <p className="text-sm text-gray-400 mt-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchEventsList;
