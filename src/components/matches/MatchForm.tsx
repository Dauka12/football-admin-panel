import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '../../store/teamStore';
import { useTournamentStore } from '../../store/tournamentStore';
import type { CreateMatchRequest, UpdateMatchRequest } from '../../types/matches';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import DateTimePicker from '../ui/DateTimePicker';

interface MatchFormProps {
    initialData?: Partial<CreateMatchRequest | UpdateMatchRequest>;
    onSubmit: (data: CreateMatchRequest | UpdateMatchRequest) => Promise<void>;
    onCancel: () => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const { teams, fetchTeams } = useTeamStore();
    const { tournaments, fetchTournaments } = useTournamentStore();

    // Form data
    const [formData, setFormData] = useState<CreateMatchRequest>({
        tournamentId: initialData?.tournamentId || 0,
        matchDate: initialData?.matchDate || new Date().toISOString(),
        teams: initialData?.teams || []
    });
    
    // Normalize initial matchDate if it's a timestamp
    useEffect(() => {
        if (initialData?.matchDate) {
            let matchDate = initialData.matchDate;
            
            // If it's a number (Unix timestamp)
            if (typeof matchDate === 'number') {
                // Convert to ISO string for form handling
                const date = new Date(
                    // If it's seconds (10 digits), convert to milliseconds
                    matchDate.toString().length === 10 ? matchDate * 1000 : matchDate
                );
                if (!isNaN(date.getTime())) {
                    setFormData(prev => ({
                        ...prev,
                        matchDate: date.toISOString()
                    }));
                }
            }
        }
    }, [initialData]);

    // Form validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch teams and tournaments on mount
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchTeams(), fetchTournaments()]);
        };
        loadData();
    }, [fetchTeams, fetchTournaments]);

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'tournamentId') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle team selection
    const handleTeamSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const teamId = parseInt(e.target.value, 10);
        const isChecked = e.target.checked;

        setFormData(prev => {
            if (isChecked) {
                // Add team if not already in the list
                if (!prev.teams.includes(teamId)) {
                    return { ...prev, teams: [...prev.teams, teamId] };
                }
            } else {
                // Remove team
                return { ...prev, teams: prev.teams.filter(id => id !== teamId) };
            }
            return prev;
        });

        // Clear teams error if any
        if (errors.teams) {
            setErrors(prev => ({ ...prev, teams: '' }));
        }
    };

    // Handle date change
    const handleDateChange = (dateValue: string | Date | null) => {
        if (dateValue) {
            // If we get a string, we need to parse it
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            
            if (isNaN(date.getTime())) {
                console.error('Invalid date provided:', dateValue);
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                // Store as ISO string for consistency
                matchDate: date.toISOString()
            }));

            // Clear date error if any
            if (errors.matchDate) {
                setErrors(prev => ({ ...prev, matchDate: '' }));
            }
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Check tournament
        if (!formData.tournamentId) {
            newErrors.tournamentId = t('matches.form.errors.tournamentRequired');
        }

        // Check match date
        if (!formData.matchDate) {
            newErrors.matchDate = t('matches.form.errors.dateRequired');
        }

        // Check teams selection
        if (!formData.teams.length) {
            newErrors.teams = t('matches.form.errors.teamsRequired');
        } else if (formData.teams.length < 2) {
            newErrors.teams = t('matches.form.errors.minimumTwoTeams');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast(t('common.fixValidationErrors'), 'error');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            showToast(t('matches.form.success'), 'success');
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Tournament selection */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="tournamentId">
                    {t('matches.form.tournament')} *
                </label>
                <select
                    id="tournamentId"
                    name="tournamentId"
                    value={formData.tournamentId || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.tournamentId ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                >
                    <option value="">{t('matches.form.selectTournament')}</option>
                    {tournaments.map(tournament => (
                        <option key={tournament.id} value={tournament.id}>
                            {tournament.name}
                        </option>
                    ))}
                </select>
                {errors.tournamentId && (
                    <p className="text-red-500 text-xs mt-1">{errors.tournamentId}</p>
                )}
            </div>

            {/* Match date/time */}
            <div className="w-full">
                <div className="block font-medium mb-1 text-sm sr-only">
                    {t('matches.form.matchDate')} *
                </div>
                <DateTimePicker
                    value={formData.matchDate}
                    onChange={(dateValue) => handleDateChange(dateValue)}
                    className={errors.matchDate ? 'border-red-500' : ''}
                    label={t('matches.form.matchDate')}
                    required
                />
                {errors.matchDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.matchDate}</p>
                )}
            </div>

            {/* Team selection */}
            <div>
                <label className="block font-medium mb-2 text-sm">
                    {t('matches.form.teams')} *
                </label>
                {errors.teams && (
                    <p className="text-red-500 text-xs mb-2">{errors.teams}</p>
                )}

                <div className="bg-darkest-bg border border-gray-700 rounded-md max-h-60 overflow-y-auto">
                    {teams.length === 0 ? (
                        <p className="text-gray-400 p-3 text-sm">{t('matches.form.noTeams')}</p>
                    ) : (
                        teams.map(team => (
                            <div key={team.id} className="flex items-center space-x-3 p-3 border-b border-gray-700 last:border-b-0">
                                <input
                                    type="checkbox"
                                    id={`team-${team.id}`}
                                    value={team.id}
                                    checked={formData.teams.includes(team.id)}
                                    onChange={handleTeamSelection}
                                    className="h-4 w-4 text-gold focus:ring-gold border-gray-700 bg-darkest-bg rounded"
                                />
                                <div className="flex items-center flex-1">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                                        style={{
                                            backgroundColor: team.primaryColor || '#ffcc00',
                                            color: team.secondaryColor || '#002b3d'
                                        }}
                                    >
                                        {team.avatar ? (
                                            <img src={team.avatar} alt={team.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="font-bold text-sm">
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span>{team.name}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Form buttons */}
            <div className="border-t border-gray-700 pt-4 mt-4 flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
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
                        t('common.save')
                    )}
                </button>
            </div>
        </form>
    );
};

export default React.memo(MatchForm);
