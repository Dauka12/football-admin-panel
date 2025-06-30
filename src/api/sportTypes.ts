import type {
    SportType,
    SportTypeCreateRequest,
    SportTypeFilterParams,
    SportTypesPageResponse,
    SportTypeUpdateRequest
} from '../types/sportTypes';
import axiosInstance from './axios';

export const sportTypeApi = {
    getAll: async (
        page = 0, 
        size = 10, 
        filters?: SportTypeFilterParams,
        sort?: string
    ): Promise<SportTypesPageResponse> => {
        try {
            const response = await axiosInstance.get(`/sport-types/public`, {
                params: { 
                    page, 
                    size,
                    sort,
                    ...filters
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch sport types:', error);
            throw error;
        }
    },

    getById: async (id: number): Promise<SportType> => {
        try {
            const response = await axiosInstance.get(`/sport-types/public/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch sport type:', error);
            throw error;
        }
    },

    create: async (data: SportTypeCreateRequest): Promise<{ id: number }> => {
        try {
            const response = await axiosInstance.post('/sport-types', data);
            return response.data;
        } catch (error) {
            console.error('Failed to create sport type:', error);
            throw error;
        }
    },

    update: async (id: number, data: SportTypeUpdateRequest): Promise<{ id: number }> => {
        try {
            const response = await axiosInstance.put(`/sport-types/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to update sport type:', error);
            throw error;
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/sport-types/${id}`);
        } catch (error) {
            console.error('Failed to delete sport type:', error);
            throw error;
        }
    }
};
