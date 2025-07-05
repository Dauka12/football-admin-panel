import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaygroundFacilitiesStore } from '../../store/playgroundFacilitiesStore';
import PlaygroundFacilitiesList from './PlaygroundFacilitiesList.tsx';
import PlaygroundFacilityForm from './PlaygroundFacilityForm.tsx';
import PlaygroundFacilityAssignmentModal from './PlaygroundFacilityAssignmentModal.tsx';
import type { PlaygroundFacility, PlaygroundFacilityFilters } from '../../types/playgroundFacilities';

interface PlaygroundFacilitiesManagerProps {
    playgroundId?: number;
}

const PlaygroundFacilitiesManager: React.FC<PlaygroundFacilitiesManagerProps> = ({ 
    playgroundId
}) => {
    const { t } = useTranslation();
    
    // Separate the store data and functions to avoid re-renders
    const facilities = usePlaygroundFacilitiesStore(state => state.facilities);
    const playgroundFacilities = usePlaygroundFacilitiesStore(state => state.playgroundFacilities);
    const isLoading = usePlaygroundFacilitiesStore(state => state.isLoading);
    const error = usePlaygroundFacilitiesStore(state => state.error);
    const totalElements = usePlaygroundFacilitiesStore(state => state.totalElements);
    const totalPages = usePlaygroundFacilitiesStore(state => state.totalPages);
    const currentPage = usePlaygroundFacilitiesStore(state => state.currentPage);
    const categories = usePlaygroundFacilitiesStore(state => state.categories);
    
    // Get functions separately to avoid dependency issues
    const fetchFacilities = usePlaygroundFacilitiesStore(state => state.fetchFacilities);
    const fetchPlaygroundFacilities = usePlaygroundFacilitiesStore(state => state.fetchPlaygroundFacilities);
    const fetchCategories = usePlaygroundFacilitiesStore(state => state.fetchCategories);
    const createFacility = usePlaygroundFacilitiesStore(state => state.createFacility);
    const updateFacility = usePlaygroundFacilitiesStore(state => state.updateFacility);
    const deleteFacility = usePlaygroundFacilitiesStore(state => state.deleteFacility);
    const assignFacilities = usePlaygroundFacilitiesStore(state => state.assignFacilities);
    const removeFacilityFromPlayground = usePlaygroundFacilitiesStore(state => state.removeFacilityFromPlayground);
    const removeAllFacilitiesFromPlayground = usePlaygroundFacilitiesStore(state => state.removeAllFacilitiesFromPlayground);
    const clearError = usePlaygroundFacilitiesStore(state => state.clearError);

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<PlaygroundFacility | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'assigned'>('all');

    // Filter States
    const [filters, setFilters] = useState<PlaygroundFacilityFilters>({
        page: 0,
        size: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        fetchFacilities(filters);
    }, [filters]); // Remove fetchFacilities from dependencies as it's a stable function from Zustand

    useEffect(() => {
        if (playgroundId) {
            fetchPlaygroundFacilities(playgroundId);
        }
    }, [playgroundId]); // Remove fetchPlaygroundFacilities from dependencies

    useEffect(() => {
        fetchCategories();
    }, []); // Remove fetchCategories from dependencies and only run once

    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            name: searchTerm || undefined,
            category: categoryFilter || undefined,
            active: activeFilter,
            page: 0
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleCreateFacility = async (data: any) => {
        const success = await createFacility(data);
        if (success) {
            setIsCreateModalOpen(false);
        }
    };

    const handleEditFacility = async (data: any) => {
        if (!selectedFacility) return;
        
        const success = await updateFacility(selectedFacility.id, data);
        if (success) {
            setIsEditModalOpen(false);
            setSelectedFacility(null);
        }
    };

    const handleDeleteFacility = async (facility: PlaygroundFacility) => {
        if (window.confirm(t('playgroundFacilities.confirmDelete'))) {
            await deleteFacility(facility.id);
        }
    };

    const handleEditClick = (facility: PlaygroundFacility) => {
        setSelectedFacility(facility);
        setIsEditModalOpen(true);
    };

    const handleAssignFacilities = async (facilityAssignments: any[]) => {
        if (!playgroundId) return;
        
        const success = await assignFacilities({
            playgroundId,
            facilities: facilityAssignments
        });
        
        if (success) {
            setIsAssignModalOpen(false);
        }
    };

    const handleRemoveFacilityFromPlayground = async (facilityId: number) => {
        if (!playgroundId) return;
        
        if (window.confirm(t('playgroundFacilities.confirmRemoveFromPlayground'))) {
            await removeFacilityFromPlayground(playgroundId, facilityId);
        }
    };

    const handleRemoveAllFacilities = async () => {
        if (!playgroundId) return;
        
        if (window.confirm(t('playgroundFacilities.confirmRemoveAll'))) {
            await removeAllFacilitiesFromPlayground(playgroundId);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setActiveFilter(undefined);
        setFilters({
            page: 0,
            size: 10
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
                    <p className="text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {t('playgroundFacilities.title')}
                    </h2>
                    <p className="text-gray-400 mt-1">
                        {t('playgroundFacilities.subtitle')}
                    </p>
                </div>
                <div className="flex gap-2">
                    {playgroundId && (
                        <>
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                {t('playgroundFacilities.assignFacilities')}
                            </button>
                            {playgroundFacilities.length > 0 && (
                                <button
                                    onClick={handleRemoveAllFacilities}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                    {t('playgroundFacilities.removeAllFacilities')}
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-gold text-darkest-bg rounded hover:bg-gold/90 transition-colors"
                    >
                        + {t('playgroundFacilities.createFacility')}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={clearError}
                        className="text-red-400 hover:text-red-300"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Tabs (if playground view) */}
            {playgroundId && (
                <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'bg-gold text-darkest-bg'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {t('playgroundFacilities.allFacilities')} ({totalElements})
                    </button>
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'assigned'
                                ? 'bg-gold text-darkest-bg'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {t('playgroundFacilities.assignedFacilities')} ({playgroundFacilities.length})
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">{t('common.filters')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {t('common.status')}
                        </label>
                        <select
                            value={activeFilter === undefined ? '' : activeFilter.toString()}
                            onChange={(e) => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="true">{t('common.active')}</option>
                            <option value="false">{t('common.inactive')}</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-gold text-darkest-bg rounded hover:bg-gold/90 transition-colors"
                    >
                        {t('common.search')}
                    </button>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                        {t('common.reset')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
                <PlaygroundFacilitiesList
                    facilities={activeTab === 'assigned' ? [] : facilities}
                    playgroundFacilities={activeTab === 'assigned' ? playgroundFacilities : []}
                    showAssignmentMode={activeTab === 'assigned'}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteFacility}
                    onRemoveFromPlayground={handleRemoveFacilityFromPlayground}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Modals */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium text-white mb-4">
                            {t('playgroundFacilities.createFacility')}
                        </h3>
                        <PlaygroundFacilityForm
                            onSubmit={handleCreateFacility}
                            onCancel={() => setIsCreateModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedFacility && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium text-white mb-4">
                            {t('playgroundFacilities.editFacility')}
                        </h3>
                        <PlaygroundFacilityForm
                            initialData={selectedFacility}
                            onSubmit={handleEditFacility}
                            onCancel={() => {
                                setIsEditModalOpen(false);
                                setSelectedFacility(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {isAssignModalOpen && playgroundId && (
                <PlaygroundFacilityAssignmentModal
                    playgroundId={playgroundId}
                    onAssign={handleAssignFacilities}
                    onCancel={() => setIsAssignModalOpen(false)}
                />
            )}
        </div>
    );
};

export default PlaygroundFacilitiesManager;
