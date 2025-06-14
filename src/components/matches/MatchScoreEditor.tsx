import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MatchParticipant } from '../../types/matches';
import { showToast } from '../../utils/toast';

interface MatchScoreEditorProps {
  participants: MatchParticipant[];
  onScoreUpdate: (participantId: number, score: number) => Promise<boolean>;
}

const MatchScoreEditor: React.FC<MatchScoreEditorProps> = ({
  participants,
  onScoreUpdate
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState<Record<number, boolean>>({});
  const [scoreValues, setScoreValues] = useState<Record<number, number>>(
    participants.reduce((acc, p) => ({ ...acc, [p.id]: p.score ?? 0 }), {})
  );
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});

  // Handle score change
  const handleScoreChange = (participantId: number, value: string) => {
    const score = parseInt(value, 10) || 0;
    if (score >= 0) {
      setScoreValues(prev => ({ ...prev, [participantId]: score }));
    }
  };

  // Start editing score
  const startEditing = (participantId: number) => {
    setIsEditing(prev => ({ ...prev, [participantId]: true }));
  };

  // Cancel editing
  const cancelEditing = (participantId: number) => {
    setIsEditing(prev => ({ ...prev, [participantId]: false }));
    // Reset to original value
    const participant = participants.find(p => p.id === participantId);
    if (participant) {
      setScoreValues(prev => ({ ...prev, [participantId]: participant.score ?? 0 }));
    }
  };

  // Save score
  const saveScore = async (participantId: number) => {
    const newScore = scoreValues[participantId];
    const participant = participants.find(p => p.id === participantId);
    
    if (!participant || (participant.score ?? 0) === newScore) {
      setIsEditing(prev => ({ ...prev, [participantId]: false }));
      return;
    }

    setIsLoading(prev => ({ ...prev, [participantId]: true }));
    const success = await onScoreUpdate(participantId, newScore);
    
    if (success) {
      showToast(t('matches.scoreUpdated'), 'success');
      setIsEditing(prev => ({ ...prev, [participantId]: false }));
    }
    
    setIsLoading(prev => ({ ...prev, [participantId]: false }));
  };

  return (
    <div>
      {participants.map((participant) => (
        <div key={participant.id} className="mb-6 last:mb-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
                style={{
                  backgroundColor: (participant.team?.primaryColor) || '#ffcc00',
                  color: (participant.team?.secondaryColor) || '#002b3d'
                }}
              >
                <span className="font-bold text-sm">
                  {((participant.team?.name) || participant.teamName || 'Team').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium">{(participant.team?.name) || participant.teamName || 'Unknown Team'}</div>
                {participant.player && participant.player.user && (
                  <div className="text-sm text-gray-400">
                    {participant.player.position}
                  </div>
                )}
              </div>
            </div>
            
            {/* Score display/edit */}
            <div className="flex items-center">
              {isEditing[participant.id] ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={scoreValues[participant.id]}
                    onChange={(e) => handleScoreChange(participant.id, e.target.value)}
                    className="w-16 bg-darkest-bg border border-gray-700 rounded text-center px-2 py-1"
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={() => saveScore(participant.id)}
                      disabled={isLoading[participant.id]}
                      className="p-1 text-gold hover:text-gold/80 transition-colors"
                      title={t('common.save')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => cancelEditing(participant.id)}
                      disabled={isLoading[participant.id]}
                      className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                      title={t('common.cancel')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-gold mr-3">
                    {participant.score ?? 0}
                  </div>
                  <button
                    onClick={() => startEditing(participant.id)}
                    className="p-1 text-gray-400 hover:text-gold transition-colors"
                    title={t('common.edit')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {participant.player && participant.player.user && (
            <div className="ml-11 text-sm text-gray-400">
              {t('matches.player')}: {participant.player.user?.firstname} {participant.player.user?.lastname}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MatchScoreEditor;
