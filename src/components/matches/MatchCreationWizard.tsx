import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import matchesIntegrationApi from '../../api/matchesIntegration';
import type { CreateMatchRequest } from '../../types/matches';
import type { CreateMatchParticipantRequest } from '../../types/matchParticipants';
import { showToast } from '../../utils/toast';

const MatchCreationWizard: React.FC = () => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [matchData, setMatchData] = useState<CreateMatchRequest>({
        tournamentId: undefined,
        teams: [],
        cityId: 1,
        status: 'PENDING',
        playgroundId: 1,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        maxCapacity: 20,
        description: '',
        sportTypeId: 1
    });
    
    const [participantsData, setParticipantsData] = useState<CreateMatchParticipantRequest[]>([]);

    const handleCreateMatch = async () => {
        setIsLoading(true);
        try {
            // Validate match data
            const validation = matchesIntegrationApi.validateMatchData(matchData);
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    showToast(error, 'error');
                });
                return;
            }

            // Create match with participants
            const result = await matchesIntegrationApi.createMatchWithParticipants(
                matchData,
                participantsData
            );
            
            showToast(
                t('matches.createSuccessWithParticipants', {
                    matchId: result.matchId,
                    participantCount: result.participantIds.length
                }),
                'success'
            );

            // Reset form
            setCurrentStep(1);
            setMatchData({
                tournamentId: undefined,
                teams: [],
                cityId: 1,
                status: 'PENDING',
                playgroundId: 1,
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                maxCapacity: 20,
                description: '',
                sportTypeId: 1
            });
            setParticipantsData([]);
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : t('matches.createError'),
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const addParticipant = () => {
        setParticipantsData([
            ...participantsData,
            {
                matchId: 0, // Will be set when match is created
                teamId: 1,
                playerId: 1,
                userId: 1,
                isOrganizer: false,
                status: 'CONFIRMED',
                hasPaid: false,
                amountPaid: 0,
                paymentMethod: 'CASH'
            }
        ]);
    };

    const removeParticipant = (index: number) => {
        setParticipantsData(participantsData.filter((_, i) => i !== index));
    };

    const updateParticipant = (index: number, field: string, value: any) => {
        const updated = [...participantsData];
        updated[index] = { ...updated[index], [field]: value };
        setParticipantsData(updated);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">{t('matches.createMatchWizard')}</h2>
                
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                    step === currentStep
                                        ? 'bg-gold text-darkest-bg'
                                        : step < currentStep
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-600 text-gray-300'
                                }`}
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('common.step')} {currentStep} {t('common.of')} 3
                    </div>
                </div>

                {/* Step 1: Match Details */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">{t('matches.matchDetails')}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    {t('matches.startTime')}
                                </label>
                                <input
                                    type="datetime-local"
                                    value={matchData.startTime?.substring(0, 16) || ''}
                                    onChange={(e) => setMatchData({
                                        ...matchData,
                                        startTime: e.target.value ? new Date(e.target.value).toISOString() : ''
                                    })}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    {t('matches.endTime')}
                                </label>
                                <input
                                    type="datetime-local"
                                    value={matchData.endTime?.substring(0, 16) || ''}
                                    onChange={(e) => setMatchData({
                                        ...matchData,
                                        endTime: e.target.value ? new Date(e.target.value).toISOString() : ''
                                    })}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    {t('matches.maxCapacity')}
                                </label>
                                <input
                                    type="number"
                                    value={matchData.maxCapacity}
                                    onChange={(e) => setMatchData({
                                        ...matchData,
                                        maxCapacity: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    {t('matches.playground')}
                                </label>
                                <select
                                    value={matchData.playgroundId}
                                    onChange={(e) => setMatchData({
                                        ...matchData,
                                        playgroundId: parseInt(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                >
                                    <option value={1}>Playground 1</option>
                                    <option value={2}>Playground 2</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                {t('matches.description')}
                            </label>
                            <textarea
                                value={matchData.description}
                                onChange={(e) => setMatchData({
                                    ...matchData,
                                    description: e.target.value
                                })}
                                rows={3}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Teams */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">{t('matches.selectTeams')}</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                {t('matches.teams')} 
                                <span className="text-gray-400 font-normal ml-1">
                                    ({matchData.teams.length}/2 {t('matches.form.teamsSelected')})
                                </span>
                            </label>
                            {matchData.teams.length >= 2 && (
                                <p className="text-yellow-500 text-xs mb-2">
                                    {t('matches.form.maxTeamsReached')}
                                </p>
                            )}
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((teamId) => {
                                    const isSelected = matchData.teams.includes(teamId);
                                    const isDisabled = !isSelected && matchData.teams.length >= 2;
                                    
                                    return (
                                    <label key={teamId} className={`flex items-center space-x-2 ${isDisabled ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    if (matchData.teams.length >= 2) {
                                                        showToast(t('matches.form.errors.maxTwoTeams'), 'error');
                                                        return;
                                                    }
                                                    setMatchData({
                                                        ...matchData,
                                                        teams: [...matchData.teams, teamId]
                                                    });
                                                } else {
                                                    setMatchData({
                                                        ...matchData,
                                                        teams: matchData.teams.filter(id => id !== teamId)
                                                    });
                                                }
                                            }}
                                            className="rounded border-gray-600 text-gold focus:ring-gold disabled:opacity-50"
                                        />
                                        <span className="text-white">Team {teamId}</span>
                                    </label>
                                );})}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Participants */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">{t('matchParticipants.title')}</h3>
                            <button
                                onClick={addParticipant}
                                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors"
                            >
                                {t('matchParticipants.addParticipant')}
                            </button>
                        </div>
                        
                        {participantsData.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">
                                {t('matchParticipants.noParticipants')}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {participantsData.map((participant, index) => (
                                    <div key={index} className="bg-darkest-bg border border-gray-600 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-white font-medium">
                                                {t('matchParticipants.participant')} {index + 1}
                                            </h4>
                                            <button
                                                onClick={() => removeParticipant(index)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                {t('common.remove')}
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    {t('matchParticipants.team')}
                                                </label>
                                                <select
                                                    value={participant.teamId}
                                                    onChange={(e) => updateParticipant(index, 'teamId', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 bg-card-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                                >
                                                    <option value={1}>Team 1</option>
                                                    <option value={2}>Team 2</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    {t('matchParticipants.player')}
                                                </label>
                                                <select
                                                    value={participant.playerId}
                                                    onChange={(e) => updateParticipant(index, 'playerId', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 bg-card-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                                >
                                                    <option value={1}>Player 1</option>
                                                    <option value={2}>Player 2</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    {t('matchParticipants.status')}
                                                </label>
                                                <select
                                                    value={participant.status}
                                                    onChange={(e) => updateParticipant(index, 'status', e.target.value)}
                                                    className="w-full px-3 py-2 bg-card-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                                >
                                                    <option value="CONFIRMED">Confirmed</option>
                                                    <option value="WAITING_PAYMENT">Waiting Payment</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <div>
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-4 py-2 border border-gray-600 rounded-md text-white hover:bg-gray-700 transition-colors"
                            >
                                {t('common.previous')}
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        {currentStep < 3 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors"
                            >
                                {t('common.next')}
                            </button>
                        ) : (
                            <button
                                onClick={handleCreateMatch}
                                disabled={isLoading}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? t('common.creating') : t('matches.createMatch')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchCreationWizard;
