import { create } from 'zustand';
import type { SportClubFilterParams } from '../api/sportClubs';
import { sportClubApi } from '../api/sportClubs';
import type {
    CreateSportClubAddressRequest,
    CreateSportClubRequest,
    SportClub,
    UpdateSportClubAddressRequest,
    UpdateSportClubRequest
} from '../types/sportClubs';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface SportClubState {
    sportClubs: SportClub[];
    currentSportClub: SportClub | null;
    isLoading: boolean;
    error: string | null;
    
    // Pagination state
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filter state
    filters: SportClubFilterParams;
    
    // Actions
    fetchSportClubs: (forceRefresh?: boolean, page?: number, size?: number, filters?: SportClubFilterParams) => Promise<void>;
    setFilters: (filters: SportClubFilterParams) => void;
    fetchSportClub: (id: number) => Promise<void>;
    createSportClub: (data: CreateSportClubRequest) => Promise<boolean>;
    updateSportClub: (id: number, data: UpdateSportClubRequest) => Promise<boolean>;
    deleteSportClub: (id: number) => Promise<boolean>;
    addTeamToClub: (clubId: number, teamId: number) => Promise<boolean>;
    removeTeamFromClub: (clubId: number, teamId: number) => Promise<boolean>;
    // Address management methods
    addAddress: (clubId: number, data: CreateSportClubAddressRequest) => Promise<boolean>;
    updateAddress: (addressId: number, data: UpdateSportClubAddressRequest) => Promise<boolean>;
    deleteAddress: (addressId: number) => Promise<boolean>;
    setPrimaryAddress: (clubId: number, addressId: number) => Promise<boolean>;
    clearError: () => void;
    reset: () => void;
}

export const useSportClubStore = create<SportClubState>()((set, get) => ({
    sportClubs: [],
    currentSportClub: null,
    isLoading: false,
    error: null,
    
    // Pagination state
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    
    // Filter state
    filters: {},
    
    // Set filters method
    setFilters: (filters: SportClubFilterParams) => {
        set({ filters });
    },

    fetchSportClubs: async (forceRefresh = false, page = 0, size = 10, filters?: SportClubFilterParams) => {
        // Check if we already have sport clubs loaded for the same page and avoid redundant requests
        const { sportClubs, currentPage, pageSize, filters: currentFilters } = get();
        
        // Use provided filters or fall back to current filters in state
        const filtersToApply = filters || currentFilters;
        
        // If not forcing refresh, we only want to avoid a request if:
        // 1. We have sport clubs
        // 2. We're on the same page
        // 3. We're using the same page size
        // 4. We're using the same filters (deep comparison)
        if (
            sportClubs.length > 0 && 
            currentPage === page && 
            pageSize === size && 
            !forceRefresh &&
            JSON.stringify(currentFilters) === JSON.stringify(filtersToApply)
        ) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await apiService.execute(
                () => sportClubApi.getAll(page, size, filtersToApply),
                'fetchSportClubs',
                { enableCache: false } // Disable cache to ensure fresh data
            );
            
            // Ensure response contains content array
            if (response && response.content && Array.isArray(response.content)) {
                set({ 
                    sportClubs: response.content, 
                    totalElements: response.totalElements,
                    totalPages: response.totalPages,
                    currentPage: response.number,
                    pageSize: response.size,
                    filters: filtersToApply, // Store the filters that were used
                    isLoading: false,
                    error: null
                });
            } else {
                // Fallback if response structure is unexpected
                set({ 
                    sportClubs: [],
                    totalElements: 0,
                    totalPages: 0,
                    currentPage: 0,
                    pageSize: size,
                    isLoading: false,
                    error: 'Unexpected API response format'
                });
            }
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                sportClubs: [], // Ensure we always have an array even on error
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    fetchSportClub: async (id: number) => {
        // Prevent redundant requests
        const { currentSportClub } = get();
        if (currentSportClub && currentSportClub.id === id) return;

        set({ isLoading: true, error: null, currentSportClub: null });
        try {
            const sportClub = await apiService.execute(
                () => sportClubApi.getById(id),
                `fetchSportClub_${id}`,
                { enableCache: false } // Do not cache details to avoid stale/invalid data
            );
            if (!sportClub || typeof sportClub !== 'object' || !('id' in (sportClub as any))) {
                throw new Error('Unexpected API response format');
            }
            set({ currentSportClub: sportClub, isLoading: false });
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                currentSportClub: null,
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    createSportClub: async (data: CreateSportClubRequest) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.create(data),
                'createSportClub'
            );
            
            // Clear cache and refresh sport clubs list
            apiService.clearCache(['fetchSportClubs', 'fetchSportClub_']);
            await get().fetchSportClubs(true);
            
            set({ isLoading: false });
            showToast('Спортивная секция успешно создана!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    updateSportClub: async (id: number, data: UpdateSportClubRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await apiService.execute(
                () => sportClubApi.update(id, data),
                `updateSportClub_${id}`
            );
            
            // Fetch the latest data to ensure proper typing
            const updatedSportClub = await apiService.execute(
                () => sportClubApi.getById(id),
                `fetchSportClub_${id}`,
                { forceRefresh: true }
            );
            
            // Clear relevant cache entries
            apiService.clearCache([`fetchSportClub_${id}`, 'fetchSportClubs']);
            
            // Update state with the correctly typed data from the API
            set(state => ({
                // Update the sport clubs list with the correctly typed sport club
                sportClubs: state.sportClubs.map(club => club.id === id ? updatedSportClub : club),
                // Update currentSportClub if it's the one being edited
                currentSportClub: state.currentSportClub?.id === id ? updatedSportClub : state.currentSportClub,
                isLoading: false
            }));
            
            showToast('Спортивная секция успешно обновлена!', 'success');
            return true;
        } 
        catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                error: errorMessage.message, 
                isLoading: false 
            });
            return false;
        }
    },

    deleteSportClub: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.delete(id),
                `deleteSportClub_${id}`
            );

            // Clear relevant cache entries
            apiService.clearCache([`fetchSportClub_${id}`, 'fetchSportClubs']);

            // Remove from current list without reloading
            set({
                sportClubs: get().sportClubs.filter(club => club.id !== id),
                currentSportClub: get().currentSportClub?.id === id ? null : get().currentSportClub,
                isLoading: false
            });
            
            showToast('Спортивная секция успешно удалена!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    addTeamToClub: async (clubId: number, teamId: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.addTeam(clubId, teamId),
                `addTeamToClub_${clubId}_${teamId}`
            );

            // Refresh the current sport club if it's the one being updated
            if (get().currentSportClub?.id === clubId) {
                await get().fetchSportClub(clubId);
            }

            // Clear cache and refresh list
            apiService.clearCache(['fetchSportClubs']);
            
            set({ isLoading: false });
            showToast('Команда успешно добавлена в секцию!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    removeTeamFromClub: async (clubId: number, teamId: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.removeTeam(clubId, teamId),
                `removeTeamFromClub_${clubId}_${teamId}`
            );

            // Refresh the current sport club if it's the one being updated
            if (get().currentSportClub?.id === clubId) {
                await get().fetchSportClub(clubId);
            }

            // Clear cache and refresh list
            apiService.clearCache(['fetchSportClubs']);
            
            set({ isLoading: false });
            showToast('Команда успешно удалена из секции!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    // Address management methods
    addAddress: async (clubId: number, data: CreateSportClubAddressRequest) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.addAddress(clubId, data),
                `addAddress_${clubId}`
            );

            // Refresh the current sport club if it's the one being updated
            if (get().currentSportClub?.id === clubId) {
                await get().fetchSportClub(clubId);
            }

            // Clear cache
            apiService.clearCache(['fetchSportClubs']);
            
            set({ isLoading: false });
            showToast('Адрес успешно добавлен!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    updateAddress: async (addressId: number, data: UpdateSportClubAddressRequest) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.updateAddress(addressId, data),
                `updateAddress_${addressId}`
            );

            // Refresh the current sport club to get updated data
            const currentClub = get().currentSportClub;
            if (currentClub) {
                await get().fetchSportClub(currentClub.id);
            }

            // Clear cache
            apiService.clearCache(['fetchSportClubs']);
            
            set({ isLoading: false });
            showToast('Адрес успешно обновлен!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    deleteAddress: async (addressId: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.deleteAddress(addressId),
                `deleteAddress_${addressId}`
            );

            // Refresh the current sport club to get updated data
            const currentClub = get().currentSportClub;
            if (currentClub) {
                await get().fetchSportClub(currentClub.id);
            }

            // Clear cache
            apiService.clearCache(['fetchSportClubs']);
            
            set({ isLoading: false });
            showToast('Адрес успешно удален!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    setPrimaryAddress: async (clubId: number, addressId: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => sportClubApi.setPrimaryAddress(clubId, addressId),
                `setPrimaryAddress_${clubId}_${addressId}`
            );

            // Refresh the current sport club if it's the one being updated
            if (get().currentSportClub?.id === clubId) {
                await get().fetchSportClub(clubId);
            }

            // Clear cache
            apiService.clearCache(['fetchSportClubs']);
            
            set({ isLoading: false });
            showToast('Основной адрес успешно установлен!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    clearError: () => {
        set({ error: null });
    },

    reset: () => {
        set({
            sportClubs: [],
            currentSportClub: null,
            isLoading: false,
            error: null,
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            pageSize: 10,
            filters: {}
        });
    }
}));
