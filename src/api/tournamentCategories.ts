import type {
    CreateTournamentCategoryRequest,
    TournamentCategoriesPageResponse,
    TournamentCategory,
    TournamentCategoryFilters,
    TournamentCategoryResponse,
    UpdateTournamentCategoryRequest
} from '../types/tournamentCategories';
import axios from './axios';

const API_PREFIX = '/tournament-categories';

export const tournamentCategoryApi = {
    // Get all tournament categories with filtering and pagination
    getAll: async (filters: TournamentCategoryFilters = {}): Promise<TournamentCategoriesPageResponse> => {
        const params = new URLSearchParams();
        
        if (filters.name) params.append('name', filters.name);
        if (filters.active !== undefined) params.append('active', filters.active.toString());
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.size !== undefined) params.append('size', filters.size.toString());

        const response = await axios.get(`${API_PREFIX}/public?${params.toString()}`);
        return response.data;
    },

    // Get tournament category by ID
    getById: async (id: number): Promise<TournamentCategory> => {
        const response = await axios.get(`${API_PREFIX}/public/${id}`);
        return response.data;
    },

    // Create new tournament category
    create: async (data: CreateTournamentCategoryRequest): Promise<TournamentCategoryResponse> => {
        const response = await axios.post(API_PREFIX, data);
        return response.data;
    },

    // Update tournament category
    update: async (id: number, data: UpdateTournamentCategoryRequest): Promise<TournamentCategoryResponse> => {
        const response = await axios.put(`${API_PREFIX}/${id}`, data);
        return response.data;
    },

    // Delete tournament category (soft delete)
    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_PREFIX}/${id}`);
    }
};
