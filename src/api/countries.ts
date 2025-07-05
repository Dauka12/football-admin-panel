import axiosInstance from './axios';
import type { 
    Country, 
    CreateCountryRequest, 
    UpdateCountryRequest, 
    CountryFilters 
} from '../types/countries';

export const countriesApi = {
    // Get all countries (public)
    getAll: async (filters?: CountryFilters): Promise<Country[]> => {
        const params = new URLSearchParams();
        
        if (filters?.name) params.append('name', filters.name);
        if (filters?.code) params.append('code', filters.code);
        if (filters?.active !== undefined) params.append('active', filters.active.toString());
        if (filters?.page !== undefined) params.append('page', filters.page.toString());
        if (filters?.size !== undefined) params.append('size', filters.size.toString());
        
        const response = await axiosInstance.get(`/countries/public?${params.toString()}`);
        return response.data;
    },

    // Get country by ID (public)
    getById: async (id: number): Promise<Country> => {
        const response = await axiosInstance.get(`/countries/public/${id}`);
        return response.data;
    },

    // Get country by code (public)
    getByCode: async (code: string): Promise<Country> => {
        const response = await axiosInstance.get(`/countries/public/code/${code}`);
        return response.data;
    },

    // Create country (admin)
    create: async (data: CreateCountryRequest): Promise<Country> => {
        const response = await axiosInstance.post('/countries/admin', data);
        return response.data;
    },

    // Update country (admin)
    update: async (id: number, data: UpdateCountryRequest): Promise<Country> => {
        const response = await axiosInstance.patch(`/countries/admin/${id}`, data);
        return response.data;
    },

    // Delete country (admin)
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/countries/admin/${id}`);
    }
};
