import { create } from 'zustand';
import type {
    PlaygroundFacility,
    PlaygroundFacilityAssignment,
    CreatePlaygroundFacilityRequest,
    UpdatePlaygroundFacilityRequest,
    AssignFacilitiesToPlaygroundRequest,
    PlaygroundFacilityFilters
} from '../types/playgroundFacilities';
import { playgroundFacilitiesApi } from '../api/playgroundFacilities';

interface PlaygroundFacilitiesStore {
    // State
    facilities: PlaygroundFacility[];
    playgroundFacilities: PlaygroundFacilityAssignment[];
    isLoading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    categories: string[];

    // Actions
    fetchFacilities: (filters?: PlaygroundFacilityFilters) => Promise<void>;
    fetchPlaygroundFacilities: (playgroundId: number) => Promise<void>;
    fetchCategories: () => Promise<void>;
    createFacility: (data: CreatePlaygroundFacilityRequest) => Promise<boolean>;
    updateFacility: (id: number, data: UpdatePlaygroundFacilityRequest) => Promise<boolean>;
    deleteFacility: (id: number) => Promise<boolean>;
    assignFacilities: (data: AssignFacilitiesToPlaygroundRequest) => Promise<boolean>;
    removeFacilityFromPlayground: (playgroundId: number, facilityId: number) => Promise<boolean>;
    removeAllFacilitiesFromPlayground: (playgroundId: number) => Promise<boolean>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    facilities: [],
    playgroundFacilities: [],
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    categories: []
};

export const usePlaygroundFacilitiesStore = create<PlaygroundFacilitiesStore>((set, get) => ({
    ...initialState,

    fetchFacilities: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await playgroundFacilitiesApi.getAll(filters);
            set({
                facilities: response.content,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                currentPage: response.number,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch facilities',
                isLoading: false
            });
        }
    },

    fetchPlaygroundFacilities: async (playgroundId: number) => {
        set({ isLoading: true, error: null });
        try {
            const facilities = await playgroundFacilitiesApi.getPlaygroundFacilities(playgroundId);
            set({
                playgroundFacilities: facilities,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch playground facilities',
                isLoading: false
            });
        }
    },

    fetchCategories: async () => {
        try {
            const categories = await playgroundFacilitiesApi.getCategories();
            set({ categories });
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    },

    createFacility: async (data: CreatePlaygroundFacilityRequest) => {
        set({ isLoading: true, error: null });
        try {
            await playgroundFacilitiesApi.create(data);
            set({ isLoading: false });
            // Refresh facilities list with current filters
            const currentFilters = { page: get().currentPage, size: 10 };
            await get().fetchFacilities(currentFilters);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to create facility',
                isLoading: false
            });
            return false;
        }
    },

    updateFacility: async (id: number, data: UpdatePlaygroundFacilityRequest) => {
        set({ isLoading: true, error: null });
        try {
            await playgroundFacilitiesApi.update(id, data);
            set({ isLoading: false });
            // Refresh facilities list with current filters
            const currentFilters = { page: get().currentPage, size: 10 };
            await get().fetchFacilities(currentFilters);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update facility',
                isLoading: false
            });
            return false;
        }
    },

    deleteFacility: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await playgroundFacilitiesApi.delete(id);
            set({ isLoading: false });
            // Refresh facilities list with current filters
            const currentFilters = { page: get().currentPage, size: 10 };
            await get().fetchFacilities(currentFilters);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete facility',
                isLoading: false
            });
            return false;
        }
    },

    assignFacilities: async (data: AssignFacilitiesToPlaygroundRequest) => {
        set({ isLoading: true, error: null });
        try {
            await playgroundFacilitiesApi.assignFacilities(data);
            set({ isLoading: false });
            // Refresh playground facilities
            await get().fetchPlaygroundFacilities(data.playgroundId);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to assign facilities',
                isLoading: false
            });
            return false;
        }
    },

    removeFacilityFromPlayground: async (playgroundId: number, facilityId: number) => {
        set({ isLoading: true, error: null });
        try {
            await playgroundFacilitiesApi.removeFacilityFromPlayground(playgroundId, facilityId);
            set({ isLoading: false });
            // Refresh playground facilities
            await get().fetchPlaygroundFacilities(playgroundId);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to remove facility from playground',
                isLoading: false
            });
            return false;
        }
    },

    removeAllFacilitiesFromPlayground: async (playgroundId: number) => {
        set({ isLoading: true, error: null });
        try {
            await playgroundFacilitiesApi.removeAllFacilitiesFromPlayground(playgroundId);
            set({ isLoading: false });
            // Refresh playground facilities
            await get().fetchPlaygroundFacilities(playgroundId);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to remove all facilities',
                isLoading: false
            });
            return false;
        }
    },

    clearError: () => set({ error: null }),

    reset: () => set(initialState)
}));
