import type {
    CitiesPageResponse,
    City,
    CityCreateRequest,
    CityFilterParams,
    CityUpdateRequest
} from '../types/cities';
import axiosInstance from './axios';

export const cityApi = {
    // Get all cities with pagination and filtering
    getAll: async (
        page: number = 0, 
        size: number = 10, 
        filters?: CityFilterParams
    ): Promise<CitiesPageResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(filters && Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
            ))
        });
        
        const response = await axiosInstance.get(`/cities/public?${params}`);
        return response.data;
    },

    // Get city by ID
    getById: async (id: number): Promise<City> => {
        const response = await axiosInstance.get(`/cities/public/${id}`);
        return response.data;
    },

    // Create new city
    create: async (data: CityCreateRequest): Promise<{ id: number }> => {
        const response = await axiosInstance.post('/cities', data);
        return response.data;
    },

    // Update city
    update: async (id: number, data: CityUpdateRequest): Promise<{ id: number }> => {
        const response = await axiosInstance.put(`/cities/${id}`, data);
        return response.data;
    },

    // Delete city
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/cities/${id}`);
    }
};
