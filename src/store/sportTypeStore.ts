import { create } from 'zustand';
import { sportTypeApi } from '../api/sportTypes';
import type {
    SportType,
    SportTypeCreateRequest,
    SportTypeFilterParams,
    SportTypeUpdateRequest
} from '../types/sportTypes';

interface SportTypeStore {
    sportTypes: SportType[];
    currentSportType: SportType | null;
    isLoading: boolean;
    error: string | null;
    
    // Pagination
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filters
    filters: SportTypeFilterParams;
    
    // Actions
    fetchSportTypes: (page?: number, size?: number) => Promise<void>;
    fetchSportType: (id: number) => Promise<void>;
    createSportType: (data: SportTypeCreateRequest) => Promise<boolean>;
    updateSportType: (id: number, data: SportTypeUpdateRequest) => Promise<boolean>;
    deleteSportType: (id: number) => Promise<boolean>;
    setFilters: (filters: SportTypeFilterParams) => void;
    clearError: () => void;
    reset: () => void;
}

export const useSportTypeStore = create<SportTypeStore>((set, get) => ({
    sportTypes: [],
    currentSportType: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    filters: {},

    fetchSportTypes: async (page = 0, size = 10) => {
        const { isLoading, sportTypes } = get();
        
        console.log('fetchSportTypes called with:', { page, size, isLoading, hasData: sportTypes.length > 0 });
        
        // Prevent multiple concurrent requests and avoid refetching if we already have data
        if (isLoading || (page === 0 && sportTypes.length > 0)) {
            console.log('fetchSportTypes skipped - already loading or data exists');
            return;
        }
        
        console.log('fetchSportTypes executing...');
        set({ isLoading: true, error: null });
        try {
            const { filters } = get();
            const response = await sportTypeApi.getAll(page, size, filters);
            console.log('fetchSportTypes completed:', response);
            set({
                sportTypes: response.content,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                currentPage: response.number,
                pageSize: response.size,
                isLoading: false
            });
        } catch (error) {
            console.error('fetchSportTypes error:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch sport types',
                isLoading: false 
            });
        }
    },

    fetchSportType: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const sportType = await sportTypeApi.getById(id);
            set({ currentSportType: sportType, isLoading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch sport type',
                isLoading: false 
            });
        }
    },

    createSportType: async (data: SportTypeCreateRequest) => {
        set({ isLoading: true, error: null });
        try {
            await sportTypeApi.create(data);
            // Refresh the list
            await get().fetchSportTypes(get().currentPage, get().pageSize);
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to create sport type',
                isLoading: false 
            });
            return false;
        }
    },

    updateSportType: async (id: number, data: SportTypeUpdateRequest) => {
        set({ isLoading: true, error: null });
        try {
            await sportTypeApi.update(id, data);
            // Refresh the current sport type if it's the one being updated
            if (get().currentSportType?.id === id) {
                await get().fetchSportType(id);
            }
            // Refresh the list
            await get().fetchSportTypes(get().currentPage, get().pageSize);
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to update sport type',
                isLoading: false 
            });
            return false;
        }
    },

    deleteSportType: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await sportTypeApi.delete(id);
            // Refresh the list
            await get().fetchSportTypes(get().currentPage, get().pageSize);
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to delete sport type',
                isLoading: false 
            });
            return false;
        }
    },

    setFilters: (filters: SportTypeFilterParams) => {
        set({ filters });
    },

    clearError: () => set({ error: null }),

    reset: () => set({
        sportTypes: [],
        currentSportType: null,
        isLoading: false,
        error: null,
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
        filters: {}
    })
}));
