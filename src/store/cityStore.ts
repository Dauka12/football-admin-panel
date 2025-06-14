import { create } from 'zustand';
import { cityApi } from '../api/cities';
import type {
    City,
    CityCreateRequest,
    CityFilterParams,
    CityUpdateRequest
} from '../types/cities';

interface CityStore {
    cities: City[];
    currentCity: City | null;
    isLoading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    filters: CityFilterParams;

    // Actions
    fetchCities: (page?: number, size?: number) => Promise<void>;
    fetchCity: (id: number) => Promise<void>;
    createCity: (data: CityCreateRequest) => Promise<boolean>;
    updateCity: (id: number, data: CityUpdateRequest) => Promise<boolean>;
    deleteCity: (id: number) => Promise<boolean>;
    setFilters: (filters: CityFilterParams) => void;
    clearError: () => void;
    setCurrentCity: (city: City | null) => void;
}

export const useCityStore = create<CityStore>((set, get) => ({
    cities: [],
    currentCity: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    filters: {},

    fetchCities: async (page = 0, size = 10) => {
        set({ isLoading: true, error: null });
        try {
            const { filters } = get();
            const response = await cityApi.getAll(page, size, filters);
            set({
                cities: response.content,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                currentPage: page,
                pageSize: size,
                isLoading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch cities',
                isLoading: false 
            });
        }
    },

    fetchCity: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const city = await cityApi.getById(id);
            set({ currentCity: city, isLoading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch city',
                isLoading: false 
            });
        }
    },

    createCity: async (data: CityCreateRequest) => {
        set({ isLoading: true, error: null });
        try {
            await cityApi.create(data);
            // Refresh the list
            await get().fetchCities(get().currentPage, get().pageSize);
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to create city',
                isLoading: false 
            });
            return false;
        }
    },

    updateCity: async (id: number, data: CityUpdateRequest) => {
        set({ isLoading: true, error: null });
        try {
            await cityApi.update(id, data);
            // Refresh the list and current city if it's the one being updated
            await get().fetchCities(get().currentPage, get().pageSize);
            if (get().currentCity?.id === id) {
                await get().fetchCity(id);
            }
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to update city',
                isLoading: false 
            });
            return false;
        }
    },

    deleteCity: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await cityApi.delete(id);
            // Refresh the list
            await get().fetchCities(get().currentPage, get().pageSize);
            // Clear current city if it was deleted
            if (get().currentCity?.id === id) {
                set({ currentCity: null });
            }
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to delete city',
                isLoading: false 
            });
            return false;
        }
    },

    setFilters: (filters: CityFilterParams) => {
        set({ filters });
    },

    clearError: () => set({ error: null }),

    setCurrentCity: (city: City | null) => set({ currentCity: city })
}));
