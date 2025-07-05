import type {
    PlaygroundFacility,
    PlaygroundFacilityAssignment,
    CreatePlaygroundFacilityRequest,
    UpdatePlaygroundFacilityRequest,
    AssignFacilitiesToPlaygroundRequest,
    PlaygroundFacilityFilters,
    PlaygroundFacilitiesResponse,
    CreatePlaygroundFacilityResponse
} from '../types/playgroundFacilities';
import axiosInstance from './axios';

export const playgroundFacilitiesApi = {
    // Public endpoints
    
    // Get all facilities with filtering
    getAll: async (filters: PlaygroundFacilityFilters = {}): Promise<PlaygroundFacilitiesResponse> => {
        const params = new URLSearchParams();
        
        if (filters.name) params.append('name', filters.name);
        if (filters.category) params.append('category', filters.category);
        if (filters.active !== undefined) params.append('active', filters.active.toString());
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.size !== undefined) params.append('size', filters.size.toString());

        const response = await axiosInstance.get(`/playground-facilities/public?${params.toString()}`);
        return response.data;
    },

    // Get facility by ID
    getById: async (id: number): Promise<PlaygroundFacility> => {
        const response = await axiosInstance.get(`/playground-facilities/public/${id}`);
        return response.data;
    },

    // Get all active facilities
    getActiveFacilities: async (): Promise<PlaygroundFacility[]> => {
        const response = await axiosInstance.get('/playground-facilities/public/active');
        return response.data;
    },

    // Get facilities assigned to a playground
    getPlaygroundFacilities: async (playgroundId: number): Promise<PlaygroundFacilityAssignment[]> => {
        const response = await axiosInstance.get(`/playground-facilities/playground/${playgroundId}`);
        return response.data;
    },

    // Admin endpoints
    
    // Create new facility
    create: async (data: CreatePlaygroundFacilityRequest): Promise<CreatePlaygroundFacilityResponse> => {
        const response = await axiosInstance.post('/playground-facilities/admin', data);
        return response.data;
    },

    // Update facility
    update: async (id: number, data: UpdatePlaygroundFacilityRequest): Promise<CreatePlaygroundFacilityResponse> => {
        const response = await axiosInstance.patch(`/playground-facilities/admin/${id}`, data);
        return response.data;
    },

    // Delete facility
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/playground-facilities/admin/${id}`);
    },

    // Assign facilities to playground
    assignFacilities: async (data: AssignFacilitiesToPlaygroundRequest): Promise<void> => {
        await axiosInstance.post('/playground-facilities/admin/assign', data);
    },

    // Remove specific facility from playground
    removeFacilityFromPlayground: async (playgroundId: number, facilityId: number): Promise<void> => {
        await axiosInstance.delete(`/playground-facilities/admin/playground/${playgroundId}/facility/${facilityId}`);
    },

    // Remove all facilities from playground
    removeAllFacilitiesFromPlayground: async (playgroundId: number): Promise<void> => {
        await axiosInstance.delete(`/playground-facilities/admin/playground/${playgroundId}/facilities`);
    },

    // Utility functions
    
    // Get facilities grouped by category
    getFacilitiesByCategory: async (filters: PlaygroundFacilityFilters = {}): Promise<Record<string, PlaygroundFacility[]>> => {
        const response = await playgroundFacilitiesApi.getAll(filters);
        const facilities = response.content;
        
        return facilities.reduce((acc, facility) => {
            if (!acc[facility.category]) {
                acc[facility.category] = [];
            }
            acc[facility.category].push(facility);
            return acc;
        }, {} as Record<string, PlaygroundFacility[]>);
    },

    // Get unique categories
    getCategories: async (): Promise<string[]> => {
        const response = await playgroundFacilitiesApi.getAll({ size: 1000 });
        const categories = [...new Set(response.content.map(f => f.category))];
        return categories.sort();
    }
};

export default playgroundFacilitiesApi;
