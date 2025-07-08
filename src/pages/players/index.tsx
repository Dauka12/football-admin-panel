import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PlayerForm from '../../components/players/PlayerForm';
import Modal from '../../components/ui/Modal';
import { usePlayerStore } from '../../store/playerStore';
import { useTeamStore } from '../../store/teamStore';
import type { PlayerCreateRequest, PlayerFilterParams, PlayerPosition } from '../../types/players';
                                    

const PlayersPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        players,
        isLoading,
        error,
        fetchPlayers,
        createPlayer,
        deletePlayer,
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        filters,
        setFilters
    } = usePlayerStore();
    
    // Get teams for dropdown
    const {
        teams,
        fetchTeams,
        isLoading: isTeamsLoading,
    } = useTeamStore();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    
    // Filter state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterPosition, setFilterPosition] = useState<PlayerPosition | ''>(filters.position || '');
    const [filterTeamId, setFilterTeamId] = useState<number | undefined>(filters.teamId);
    const [filterNationality, setFilterNationality] = useState(filters.nationality || '');
    const [filterAge, setFilterAge] = useState<string>(filters.age?.toString() || '');
    const [filterPreferredFoot, setFilterPreferredFoot] = useState<string>(filters.preferredFoot || '');
    const [filterFullName, setFilterFullName] = useState<string>(filters.fullName || '');

    // Load teams on component mount
    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    // Memoized filtered players to avoid recalculation on every render
    const filteredPlayers = useMemo(() => {
        if (!players || !Array.isArray(players)) return [];

        if (!searchQuery.trim()) return players;

        const query = searchQuery.toLowerCase();
        return players.filter(player => {
            const displayName = getPlayerDisplayName(player).toLowerCase();
            const position = getPlayerPosition(player).toLowerCase();
            const nationality = player.nationality?.toLowerCase() || '';
            
            return displayName.includes(query) ||
                   position.includes(query) ||
                   nationality.includes(query);
        });
    }, [players, searchQuery]);

    // Apply filters and fetch players
    const applyFilters = () => {
        const newFilters: PlayerFilterParams = {};
        
        if (filterPosition) newFilters.position = filterPosition as PlayerPosition;
        if (filterTeamId) newFilters.teamId = filterTeamId;
        if (filterNationality) newFilters.nationality = filterNationality;
        if (filterAge) newFilters.age = parseInt(filterAge);
        if (filterPreferredFoot) newFilters.preferredFoot = filterPreferredFoot as any; // Cast to PreferredFoot
        if (filterFullName) newFilters.fullName = filterFullName;
        
        setFilters(newFilters);
        // Reset to first page when applying new filters
        setPage(0);
        fetchPlayers(true, 0, pageSize, newFilters);
        setIsFilterOpen(false);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilterPosition('');
        setFilterTeamId(undefined);
        setFilterNationality('');
        setFilterAge('');
        setFilterPreferredFoot('');
        setFilterFullName('');
        setFilters({});
        setPage(0);
        fetchPlayers(true, 0, pageSize, {});
    };

    useEffect(() => {
        // Force refresh players list with current page
        fetchPlayers(true, page, 10, filters);
    }, [fetchPlayers, page, filters]); 
    
    const handleCreatePlayer = async (data: PlayerCreateRequest) => {
        const success = await createPlayer(data);
        if (success) {
            setShowCreateForm(false);
            // Force refresh players list with current page
            await fetchPlayers(true, page, pageSize, filters);
        }
    };

    const handleConfirmDelete = async () => {
        if (playerToDelete !== null) {
            await deletePlayer(playerToDelete);
            setPlayerToDelete(null);
            // Refresh players list with current page
            await fetchPlayers(true, page, pageSize, filters);
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

    // Helper function to get player display name - fix for API bug where fullName="Unknown" and real name is in position
    const getPlayerDisplayName = (player: any) => {
        // If fullName exists and is not "Unknown" or "string", use it
        if (player.fullName && player.fullName !== "Unknown" && player.fullName !== "string") {
            return player.fullName;
        }
        // If position field has actual data (not "string"), use it as name
        if (player.position && player.position !== "string") {
            return player.position;
        }
        // Fallback to player ID if available
        return player.id ? `Player #${player.id}` : t('players.unknownPlayer') || 'Unknown Player';
    };

    // Helper function to translate position
    const translatePosition = (position: string) => {
        const positionMap: Record<string, string> = {
            'GOALKEEPER': t('players.positions.goalkeeper'),
            'CENTER_BACK': t('players.positions.centerBack'),
            'LEFT_BACK': t('players.positions.leftBack'),
            'RIGHT_BACK': t('players.positions.rightBack'),
            'LEFT_WING_BACK': t('players.positions.leftWingBack'),
            'RIGHT_WING_BACK': t('players.positions.rightWingBack'),
            'CENTRAL_DEFENSIVE_MIDFIELDER': t('players.positions.centralDefensiveMidfielder'),
            'CENTRAL_MIDFIELDER': t('players.positions.centralMidfielder'),
            'LEFT_MIDFIELDER': t('players.positions.leftMidfielder'),
            'RIGHT_MIDFIELDER': t('players.positions.rightMidfielder'),
            'CENTRAL_ATTACKING_MIDFIELDER': t('players.positions.centralAttackingMidfielder'),
            'LEFT_WING': t('players.positions.leftWing'),
            'RIGHT_WING': t('players.positions.rightWing'),
            'STRIKER': t('players.positions.striker'),
            'CENTER_FORWARD': t('players.positions.centerForward')
        };
        return positionMap[position] || position;
    };

    // Helper function to get player position - since real name might be in position field
    const getPlayerPosition = (player: any) => {
        // If fullName is "Unknown" or "string", then position field might contain the name, not the position
        if (player.fullName === "Unknown" || player.fullName === "string") {
            // If position field also has placeholder data, try to use a meaningful fallback
            if (player.position === "string") {
                return player.club && player.club !== "string" ? player.club : t('common.notSpecified');
            }
            // If position has real data but fullName is placeholder, position might be the actual name
            // In this case, use club as position fallback
            return player.club && player.club !== "string" ? player.club : t('common.notSpecified');
        }
        // If fullName is valid, then position field should contain actual position
        const position = player.position && player.position !== "string" ? player.position : '';
        return position ? translatePosition(position) : t('common.notSpecified');
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h1 className="text-2xl font-bold">{t('players.title')}</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('players.createPlayer')}
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-6">
                {/* Search input */}
                <div className="relative flex-1 w-full lg:w-auto">
                    <input
                        type="text"
                        placeholder={t('players.searchPlaceholder')}
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

                {/* Filter button */}
                <div className="flex space-x-2 w-full lg:w-auto">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                            Object.keys(filters).length > 0 
                            ? 'bg-gold text-darkest-bg' 
                            : 'bg-card-bg border border-gray-700 text-white hover:bg-gray-700'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {t('common.filter')} {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
                    </button>
                    
                    {Object.keys(filters).length > 0 && (
                        <button
                            onClick={resetFilters}
                            className="bg-accent-pink text-white px-4 py-2 rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.reset')}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
                <div className="bg-card-bg border border-gray-700 rounded-lg p-4 mb-6 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4">{t('common.filterOptions')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Position filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('players.position')}</label>
                            <select
                                value={filterPosition}
                                onChange={(e) => setFilterPosition(e.target.value as PlayerPosition | '')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            >
                                <option value="">{t('common.all')}</option>
                                <option value="GOALKEEPER">{t('players.positions.goalkeeper')}</option>
                                <option value="CENTER_BACK">{t('players.positions.centerBack')}</option>
                                <option value="LEFT_BACK">{t('players.positions.leftBack')}</option>
                                <option value="RIGHT_BACK">{t('players.positions.rightBack')}</option>
                                <option value="LEFT_WING_BACK">{t('players.positions.leftWingBack')}</option>
                                <option value="RIGHT_WING_BACK">{t('players.positions.rightWingBack')}</option>
                                <option value="CENTRAL_DEFENSIVE_MIDFIELDER">{t('players.positions.centralDefensiveMidfielder')}</option>
                                <option value="CENTRAL_MIDFIELDER">{t('players.positions.centralMidfielder')}</option>
                                <option value="LEFT_MIDFIELDER">{t('players.positions.leftMidfielder')}</option>
                                <option value="RIGHT_MIDFIELDER">{t('players.positions.rightMidfielder')}</option>
                                <option value="CENTRAL_ATTACKING_MIDFIELDER">{t('players.positions.centralAttackingMidfielder')}</option>
                                <option value="LEFT_WING">{t('players.positions.leftWing')}</option>
                                <option value="RIGHT_WING">{t('players.positions.rightWing')}</option>
                                <option value="STRIKER">{t('players.positions.striker')}</option>
                                <option value="CENTER_FORWARD">{t('players.positions.centerForward')}</option>
                            </select>
                        </div>
                        
                        {/* Team filter - new dropdown */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('players.team')}</label>
                            <select
                                value={filterTeamId || ''}
                                onChange={(e) => setFilterTeamId(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                                disabled={isTeamsLoading || teams.length === 0}
                            >
                                <option value="">{t('common.all')}</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                            {isTeamsLoading && (
                                <div className="text-xs text-gray-400 mt-1">{t('common.loading')}</div>
                            )}
                        </div>
                        
                        {/* Full Name filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('players.fullName')}</label>
                            <input
                                type="text"
                                value={filterFullName}
                                onChange={(e) => setFilterFullName(e.target.value)}
                                placeholder={t('players.fullName')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                        
                        {/* Nationality filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('players.nationality')}</label>
                            <input
                                type="text"
                                value={filterNationality}
                                onChange={(e) => setFilterNationality(e.target.value)}
                                placeholder={t('players.nationality')}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>

                        {/* Age filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('players.age')}</label>
                            <input
                                type="number"
                                value={filterAge}
                                onChange={(e) => setFilterAge(e.target.value)}
                                placeholder={t('players.age')}
                                min="0"
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            />
                        </div>
                        
                        {/* Preferred foot filter */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">{t('players.preferredFoot')}</label>
                            <select
                                value={filterPreferredFoot}
                                onChange={(e) => setFilterPreferredFoot(e.target.value)}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
                            >
                                <option value="">{t('common.all')}</option>
                                <option value="LEFT">{t('players.leftFoot')}</option>
                                <option value="RIGHT">{t('players.rightFoot')}</option>
                                <option value="BOTH">{t('players.bothFeet')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-gold text-darkest-bg hover:bg-gold/90 rounded-md transition-colors duration-200"
                        >
                            {t('common.apply')}
                        </button>
                    </div>
                </div>
            )}

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

            {!isLoading && filteredPlayers.length === 0 ? (
                <div className="text-center py-12">
                    {searchQuery || Object.keys(filters).length > 0 ? (
                        <p className="text-gray-400 mb-4">{t('players.noResultsFound')}</p>
                    ) : (
                        <>
                            <p className="text-gray-400 mb-4">{t('players.noPlayers')}</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                            >
                                {t('players.createFirst')}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Desktop & Tablet View (Table) */}
                    <div className="bg-card-bg rounded-lg overflow-hidden shadow-lg hidden sm:block">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-darkest-bg">
                                    <tr>
                                        <th className="px-4 py-3 text-left">{t('players.fullName') || 'Name'}</th>
                                        <th className="px-4 py-3 text-left">{t('players.position')}</th>
                                        <th className="px-4 py-3 text-left hidden md:table-cell">{t('players.nationality')}</th>
                                        <th className="px-4 py-3 text-center hidden sm:table-cell">{t('players.age')}</th>
                                        <th className="px-4 py-3 text-center hidden lg:table-cell">{t('players.preferredFoot')}</th>
                                        <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPlayers.map((player) => (
                                        <tr key={player.id} className="border-t border-gray-700 hover:bg-darkest-bg/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gold text-darkest-bg rounded-full flex items-center justify-center font-bold mr-3 overflow-hidden">
                                                        {player.imageUrl ? (
                                                            <img 
                                                                src={player.imageUrl} 
                                                                alt={getPlayerDisplayName(player)}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const fallback = target.nextElementSibling as HTMLSpanElement;
                                                                    if (fallback) {
                                                                        fallback.style.display = 'flex';
                                                                    }
                                                                }}
                                                            />
                                                        ) : null}
                                                        <span className={player.imageUrl ? 'hidden' : 'flex'}>{player.id}</span>
                                                    </div>
                                                    <span>{getPlayerDisplayName(player)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{getPlayerPosition(player)}</td>
                                            <td className="px-4 py-3 hidden md:table-cell">{player.nationality}</td>
                                            <td className="px-4 py-3 text-center hidden sm:table-cell">{player.age}</td>
                                            <td className="px-4 py-3 text-center hidden lg:table-cell">{getPreferredFootLabel(player.preferredFoot)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/dashboard/players/${player.id}`}
                                                        className="text-gold hover:text-gold/80 transition-colors p-1"
                                                        title={t('common.viewDetails')}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => setPlayerToDelete(player.id)}
                                                        className="text-accent-pink hover:text-accent-pink/80 transition-colors p-1"
                                                        title={t('common.delete')}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile View (Cards) - Enhanced for better mobile experience */}
                    <div className="space-y-4 sm:hidden">
                        {filteredPlayers.map((player) => (
                            <div 
                                key={player.id} 
                                className="bg-card-bg rounded-lg overflow-hidden shadow-md p-4 border border-gray-700"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gold text-darkest-bg rounded-full flex items-center justify-center font-bold mr-2 overflow-hidden">
                                            {player.imageUrl ? (
                                                <img 
                                                    src={player.imageUrl} 
                                                    alt={getPlayerDisplayName(player)}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const fallback = target.nextElementSibling as HTMLSpanElement;
                                                        if (fallback) {
                                                            fallback.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <span className={player.imageUrl ? 'hidden' : 'flex'}>{player.id}</span>
                                        </div>
                                        <h3 className="font-medium">{getPlayerDisplayName(player)}</h3>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/dashboard/players/${player.id}`}
                                            className="text-gold hover:text-gold/80 transition-colors p-1"
                                            title={t('common.viewDetails')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => setPlayerToDelete(player.id)}
                                            className="text-accent-pink hover:text-accent-pink/80 transition-colors p-1"
                                            title={t('common.delete')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-400">{t('players.position')}: </span>
                                        <span>{getPlayerPosition(player)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">{t('players.age')}: </span>
                                        <span>{player.age}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">{t('players.nationality')}: </span>
                                        <span>{player.nationality}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">{t('players.preferredFoot')}: </span>
                                        <span>{getPreferredFootLabel(player.preferredFoot)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls - Improved for mobile */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-700 bg-card-bg rounded-lg">
                            <div className="text-sm text-gray-400 mb-3 sm:mb-0">
                                {t('common.showing')} {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} {t('common.of')} {totalElements}
                            </div>
                            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className={`px-3 py-1 rounded-md ${page === 0
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                >
                                    {t('common.previous')}
                                </button>

                                {/* Page numbers */}
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        // Calculate page numbers to show
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i;
                                        } else {
                                            const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                                            pageNum = start + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-8 h-8 rounded-md ${pageNum === page
                                                    ? 'bg-gold text-darkest-bg'
                                                    : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page >= totalPages - 1}
                                    className={`px-3 py-1 rounded-md ${page >= totalPages - 1
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                >
                                    {t('common.next')}
                                </button>
                            </div>
                        </div>
                    )}
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
