import { create } from 'zustand';
import type {
    Country,
    CreateCountryRequest,
    UpdateCountryRequest,
    CountryFilters
} from '../types/countries';
import { countriesApi } from '../api/countries';

interface CountriesStore {
    // State
    countries: Country[];
    selectedCountry: Country | null;
    isLoading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;

    // Actions
    fetchCountries: (filters?: CountryFilters) => Promise<void>;
    fetchCountryById: (id: number) => Promise<void>;
    fetchCountryByCode: (code: string) => Promise<void>;
    createCountry: (data: CreateCountryRequest) => Promise<boolean>;
    updateCountry: (id: number, data: UpdateCountryRequest) => Promise<boolean>;
    deleteCountry: (id: number) => Promise<boolean>;
    setSelectedCountry: (country: Country | null) => void;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    countries: [],
    selectedCountry: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0
};

export const useCountriesStore = create<CountriesStore>((set, get) => ({
    ...initialState,

    fetchCountries: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const countries = await countriesApi.getAll(filters);
            set({
                countries,
                totalElements: countries.length,
                totalPages: Math.ceil(countries.length / (filters.size || 10)),
                currentPage: filters.page || 0,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch countries',
                isLoading: false
            });
        }
    },

    fetchCountryById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const country = await countriesApi.getById(id);
            set({
                selectedCountry: country,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch country',
                isLoading: false
            });
        }
    },

    fetchCountryByCode: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
            const country = await countriesApi.getByCode(code);
            set({
                selectedCountry: country,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch country',
                isLoading: false
            });
        }
    },

    createCountry: async (data: CreateCountryRequest) => {
        set({ isLoading: true, error: null });
        try {
            await countriesApi.create(data);
            set({ isLoading: false });
            // Refresh countries list
            const currentFilters = { page: get().currentPage, size: 10 };
            await get().fetchCountries(currentFilters);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to create country',
                isLoading: false
            });
            return false;
        }
    },

    updateCountry: async (id: number, data: UpdateCountryRequest) => {
        set({ isLoading: true, error: null });
        try {
            await countriesApi.update(id, data);
            set({ isLoading: false });
            // Refresh countries list
            const currentFilters = { page: get().currentPage, size: 10 };
            await get().fetchCountries(currentFilters);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update country',
                isLoading: false
            });
            return false;
        }
    },

    deleteCountry: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await countriesApi.delete(id);
            set({ isLoading: false });
            // Refresh countries list
            const currentFilters = { page: get().currentPage, size: 10 };
            await get().fetchCountries(currentFilters);
            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete country',
                isLoading: false
            });
            return false;
        }
    },

    setSelectedCountry: (country: Country | null) => set({ selectedCountry: country }),

    clearError: () => set({ error: null }),

    reset: () => set(initialState)
}));
