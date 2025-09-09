import type {
    CreateSportClubAddressRequest,
    CreateSportClubRequest,
    SportClub,
    SportClubFilterParams,
    SportClubsPageResponse,
    UpdateSportClubAddressRequest,
    UpdateSportClubRequest
} from '../types/sportClubs';
import axiosInstance from './axios';

export const sportClubApi = {
    getAll: async (
        page = 0,
        size = 10,
        filters?: SportClubFilterParams
    ): Promise<SportClubsPageResponse> => {
        const response = await axiosInstance.get('/sport-clubs/public', {
            params: {
                page,
                size,
                ...filters
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<SportClub> => {
        const response = await axiosInstance.get(`/sport-clubs/public/${id}`);
        return response.data;
    },

    create: async (data: CreateSportClubRequest): Promise<{ id: number }> => {
        const response = await axiosInstance.post('/sport-clubs', data);
        return response.data;
    },

    update: async (id: number, data: UpdateSportClubRequest): Promise<SportClub> => {
        const response = await axiosInstance.put(`/sport-clubs/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/sport-clubs/${id}`);
    },

    addAddress: async (clubId: number, data: CreateSportClubAddressRequest): Promise<void> => {
        await axiosInstance.post(`/sport-clubs/${clubId}/addresses`, data);
    },

    updateAddress: async (addressId: number, data: UpdateSportClubAddressRequest): Promise<void> => {
        await axiosInstance.put(`/sport-clubs/addresses/${addressId}`, data);
    },

    deleteAddress: async (addressId: number): Promise<void> => {
        await axiosInstance.delete(`/sport-clubs/addresses/${addressId}`);
    },

    setPrimaryAddress: async (clubId: number, addressId: number): Promise<void> => {
        await axiosInstance.put(`/sport-clubs/${clubId}/addresses/${addressId}/primary`);
    },

    addTeam: async (clubId: number, teamId: number): Promise<void> => {
        await axiosInstance.post(`/sport-clubs/${clubId}/teams/${teamId}`);
    },

    removeTeam: async (clubId: number, teamId: number): Promise<void> => {
        await axiosInstance.delete(`/sport-clubs/${clubId}/teams/${teamId}`);
    }
};

export type { SportClubFilterParams } from '../types/sportClubs';
