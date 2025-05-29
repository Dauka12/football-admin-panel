import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth';
import axiosInstance from './axios';

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
        return response.data;
    }
};
