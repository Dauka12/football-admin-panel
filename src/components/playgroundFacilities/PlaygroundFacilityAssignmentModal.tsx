import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaygroundFacilitiesStore } from '../../store/playgroundFacilitiesStore';
import type { PlaygroundFacility, AssignFacilityToPlaygroundRequest } from '../../types/playgroundFacilities';

interface PlaygroundFacilityAssignmentModalProps {
    playgroundId: number;
    onAssign: (assignments: AssignFacilityToPlaygroundRequest[]) => void;
    onCancel: () => void;
}

const PlaygroundFacilityAssignmentModal: React.FC<PlaygroundFacilityAssignmentModalProps> = ({
    playgroundId,
    onAssign,
    onCancel
}) => {
    const { t } = useTranslation();
    
    // Separate selectors to avoid unnecessary re-renders
    const facilities = usePlaygroundFacilitiesStore(state => state.facilities);
    const playgroundFacilities = usePlaygroundFacilitiesStore(state => state.playgroundFacilities);
    const fetchFacilities = usePlaygroundFacilitiesStore(state => state.fetchFacilities);
    const fetchPlaygroundFacilities = usePlaygroundFacilitiesStore(state => state.fetchPlaygroundFacilities);
    
    const [selectedFacilities, setSelectedFacilities] = useState<Map<number, AssignFacilityToPlaygroundRequest>>(new Map());
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            fetchFacilities({ size: 1000, active: true });
            fetchPlaygroundFacilities(playgroundId);
            setIsInitialized(true);
        }
    }, [playgroundId, isInitialized]); // Add isInitialized to prevent re-fetching

    const assignedFacilityIds = useMemo(() => 
        new Set(playgroundFacilities.map(pf => pf.facility.id)), 
        [playgroundFacilities]
    );

    const filteredFacilities = useMemo(() => 
        facilities.filter(facility => {
            const matchesSearch = !searchTerm || facility.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !categoryFilter || facility.category === categoryFilter;
            const isNotAssigned = !assignedFacilityIds.has(facility.id);
            
            return matchesSearch && matchesCategory && isNotAssigned && facility.active;
        }),
        [facilities, searchTerm, categoryFilter, assignedFacilityIds]
    );

    const categories = useMemo(() => 
        [...new Set(facilities.map(f => f.category))], 
        [facilities]
    );

    const handleFacilityToggle = (facility: PlaygroundFacility) => {
        const newSelected = new Map(selectedFacilities);
        
        if (newSelected.has(facility.id)) {
            newSelected.delete(facility.id);
        } else {
            newSelected.set(facility.id, {
                facilityId: facility.id,
                quantity: 1,
                notes: ''
            });
        }
        
        setSelectedFacilities(newSelected);
    };

    const handleQuantityChange = (facilityId: number, quantity: number) => {
        const newSelected = new Map(selectedFacilities);
        const existing = newSelected.get(facilityId);
        
        if (existing) {
            newSelected.set(facilityId, {
                ...existing,
                quantity: Math.max(1, quantity)
            });
            setSelectedFacilities(newSelected);
        }
    };

    const handleNotesChange = (facilityId: number, notes: string) => {
        const newSelected = new Map(selectedFacilities);
        const existing = newSelected.get(facilityId);
        
        if (existing) {
            newSelected.set(facilityId, {
                ...existing,
                notes
            });
            setSelectedFacilities(newSelected);
        }
    };

    const handleSubmit = () => {
        const assignments = Array.from(selectedFacilities.values());
        onAssign(assignments);
    };

    const renderFacilityIcon = (icon: string) => {
        return (
            <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                <span className="text-gold text-sm">{icon.charAt(0).toUpperCase()}</span>
            </div>
        );
    };

    const renderFacilityBadge = (category: string) => {
        const categoryColors = {
            SPORTS: 'bg-blue-900/20 text-blue-400 border-blue-500/50',
            SAFETY: 'bg-red-900/20 text-red-400 border-red-500/50',
            COMFORT: 'bg-green-900/20 text-green-400 border-green-500/50',
            UTILITIES: 'bg-purple-900/20 text-purple-400 border-purple-500/50',
            ENTERTAINMENT: 'bg-pink-900/20 text-pink-400 border-pink-500/50',
            ACCESSIBILITY: 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50'
        };

        const colorClass = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-900/20 text-gray-400 border-gray-500/50';

        return (
            <span className={`px-2 py-1 rounded-full text-xs border ${colorClass}`}>
                {t(`playgroundFacilities.categories.${category.toLowerCase()}`, category)}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white">
                        {t('playgroundFacilities.assignFacilities')}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white"
                    >
                        ×
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {t('common.search')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('playgroundFacilities.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {t('playgroundFacilities.category')}
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value="">{t('common.all')}</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {t(`playgroundFacilities.categories.${category.toLowerCase()}`, category)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Selected Facilities Summary */}
                {selectedFacilities.size > 0 && (
                    <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-6">
                        <h4 className="text-white font-medium mb-2">
                            {t('playgroundFacilities.selectedFacilities')} ({selectedFacilities.size})
                        </h4>
                        <div className="space-y-2">
                            {Array.from(selectedFacilities.entries()).map(([facilityId, assignment]) => {
                                const facility = facilities.find(f => f.id === facilityId);
                                if (!facility) return null;
                                
                                return (
                                    <div key={facilityId} className="flex items-center justify-between bg-darkest-bg rounded p-2">
                                        <div className="flex items-center space-x-2">
                                            {renderFacilityIcon(facility.icon)}
                                            <span className="text-white text-sm">{facility.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={assignment.quantity}
                                                onChange={(e) => handleQuantityChange(facilityId, parseInt(e.target.value) || 1)}
                                                className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            />
                                            <button
                                                onClick={() => handleFacilityToggle(facility)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                {t('common.remove')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Facilities */}
                <div className="space-y-4 mb-6">
                    <h4 className="text-white font-medium">
                        {t('playgroundFacilities.availableFacilities')} ({filteredFacilities.length})
                    </h4>
                    
                    {filteredFacilities.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">{t('playgroundFacilities.noAvailableFacilities')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredFacilities.map((facility) => {
                                const isSelected = selectedFacilities.has(facility.id);
                                
                                return (
                                    <div
                                        key={facility.id}
                                        className={`bg-darkest-bg border rounded-lg p-4 cursor-pointer transition-colors ${
                                            isSelected ? 'border-gold bg-gold/5' : 'border-gray-700 hover:border-gray-600'
                                        }`}
                                        onClick={() => handleFacilityToggle(facility)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {renderFacilityIcon(facility.icon)}
                                                <div>
                                                    <h5 className="text-white font-medium">{facility.name}</h5>
                                                    <p className="text-gray-400 text-sm">{facility.description}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        {renderFacilityBadge(facility.category)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleFacilityToggle(facility)}
                                                    className="w-4 h-4 text-gold bg-darkest-bg border-gray-600 rounded focus:ring-gold focus:ring-2"
                                                />
                                            </div>
                                        </div>
                                        
                                        {isSelected && (
                                            <div className="mt-4 pt-4 border-t border-gray-700">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                                            {t('playgroundFacilities.quantity')}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={selectedFacilities.get(facility.id)?.quantity || 1}
                                                            onChange={(e) => handleQuantityChange(facility.id, parseInt(e.target.value) || 1)}
                                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                                            {t('playgroundFacilities.notes')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedFacilities.get(facility.id)?.notes || ''}
                                                            onChange={(e) => handleNotesChange(facility.id, e.target.value)}
                                                            placeholder={t('playgroundFacilities.notesPlaceholder')}
                                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedFacilities.size === 0}
                        className="px-4 py-2 bg-gold text-darkest-bg rounded hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('playgroundFacilities.assignSelected')} ({selectedFacilities.size})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundFacilityAssignmentModal;
