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
        filters?: SportTypeFilterParams
    ): Promise<SportTypesPageResponse> => {
        const response = await axiosInstance.get(`/sport-types/public`, {
            params: { 
                page, 
                size,
                ...filters
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<SportType> => {
        const response = await axiosInstance.get(`/sport-types/public/${id}`);
        return response.data;
    },

    create: async (data: SportTypeCreateRequest): Promise<{ id: number }> => {
        const response = await axiosInstance.post('/sport-types', data);
        return response.data;
    },

    update: async (id: number, data: SportTypeUpdateRequest): Promise<{ id: number }> => {
        const response = await axiosInstance.put(`/sport-types/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/sport-types/${id}`);
    }
};
