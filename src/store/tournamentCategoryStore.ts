import { create } from 'zustand';
import { tournamentCategoryApi } from '../api/tournamentCategories';
import type {
    CreateTournamentCategoryRequest,
    TournamentCategory,
    TournamentCategoryFilters,
    TournamentCategoryStatistics,
    UpdateTournamentCategoryRequest
} from '../types/tournamentCategories';

interface TournamentCategoryStore {
    // State
    categories: TournamentCategory[];
    currentCategory: TournamentCategory | null;
    isLoading: boolean;
    error: string | null;
    
    // Pagination
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filters
    filters: TournamentCategoryFilters;
    
    // Statistics
    statistics: TournamentCategoryStatistics;
    
    // Actions
    fetchCategories: (useFilters?: boolean, page?: number, size?: number) => Promise<void>;
    fetchCategoryById: (id: number) => Promise<void>;
    createCategory: (data: CreateTournamentCategoryRequest) => Promise<void>;
    updateCategory: (id: number, data: UpdateTournamentCategoryRequest) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    
    // Filter actions
    setFilters: (filters: Partial<TournamentCategoryFilters>) => void;
    clearFilters: () => void;
    
    // Utility actions
    setCurrentCategory: (category: TournamentCategory | null) => void;
    clearError: () => void;
    resetState: () => void;
}

const initialFilters: TournamentCategoryFilters = {
    page: 0,
    size: 10
};

const initialStatistics: TournamentCategoryStatistics = {
    total: 0,
    active: 0,
    inactive: 0
};

export const useTournamentCategoryStore = create<TournamentCategoryStore>((set, get) => ({
    // Initial state
    categories: [],
    currentCategory: null,
    isLoading: false,
    error: null,
    
    // Pagination
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    
    // Filters
    filters: initialFilters,
    
    // Statistics
    statistics: initialStatistics,
    
    // Actions
    fetchCategories: async (useFilters = true, page, size) => {
        set({ isLoading: true, error: null });
        
        try {
            const currentFilters = get().filters;
            const requestFilters = useFilters ? {
                ...currentFilters,
                page: page !== undefined ? page : currentFilters.page,
                size: size !== undefined ? size : currentFilters.size
            } : { page: page || 0, size: size || 10 };
            
            const response = await tournamentCategoryApi.getAll(requestFilters);
            
            // Calculate statistics
            const statistics: TournamentCategoryStatistics = {
                total: response.totalElements,
                active: response.content.filter(cat => cat.active).length,
                inactive: response.content.filter(cat => !cat.active).length
            };
            
            set({
                categories: response.content,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                currentPage: response.number,
                pageSize: response.size,
                statistics,
                isLoading: false
            });
        } catch (error: any) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch categories',
                isLoading: false 
            });
        }
    },
    
    fetchCategoryById: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
            const category = await tournamentCategoryApi.getById(id);
            set({ currentCategory: category, isLoading: false });
        } catch (error: any) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch category',
                isLoading: false 
            });
        }
    },
    
    createCategory: async (data: CreateTournamentCategoryRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await tournamentCategoryApi.create(data);
            set({ isLoading: false });
            
            // Refresh the list
            await get().fetchCategories();
        } catch (error: any) {
            set({ 
                error: error.response?.data?.message || 'Failed to create category',
                isLoading: false 
            });
            throw error;
        }
    },
    
    updateCategory: async (id: number, data: UpdateTournamentCategoryRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await tournamentCategoryApi.update(id, data);
            set({ isLoading: false });
            
            // Refresh the list and current category if it matches
            await get().fetchCategories();
            const current = get().currentCategory;
            if (current && current.id === id) {
                await get().fetchCategoryById(id);
            }
        } catch (error: any) {
            set({ 
                error: error.response?.data?.message || 'Failed to update category',
                isLoading: false 
            });
            throw error;
        }
    },
    
    deleteCategory: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
            await tournamentCategoryApi.delete(id);
            set({ isLoading: false });
            
            // Remove from local state and refresh
            const categories = get().categories.filter(cat => cat.id !== id);
            set({ categories });
            
            // Clear current category if it was deleted
            const current = get().currentCategory;
            if (current && current.id === id) {
                set({ currentCategory: null });
            }
            
            // Refresh the list to get updated pagination
            await get().fetchCategories();
        } catch (error: any) {
            set({ 
                error: error.response?.data?.message || 'Failed to delete category',
                isLoading: false 
            });
            throw error;
        }
    },
    
    // Filter actions
    setFilters: (newFilters: Partial<TournamentCategoryFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
    },
    
    clearFilters: () => {
        set({ filters: initialFilters });
    },
    
    // Utility actions
    setCurrentCategory: (category: TournamentCategory | null) => {
        set({ currentCategory: category });
    },
    
    clearError: () => {
        set({ error: null });
    },
    
    resetState: () => {
        set({
            categories: [],
            currentCategory: null,
            isLoading: false,
            error: null,
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            pageSize: 10,
            filters: initialFilters,
            statistics: initialStatistics
        });
    }
}));
