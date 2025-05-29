import type {
    CreateTeamRequest,
    TeamCreateResponse,
    TeamFullResponse,
    UpdateTeamRequest
} from '../types/teams';
import axiosInstance from './axios';

const BASE_URL = '/teams';

export const teamApi = {
  getAll: async (): Promise<TeamFullResponse[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/public`);
    return response.data;
  },
  
  getById: async (id: number): Promise<TeamFullResponse> => {
    const response = await axiosInstance.get(`${BASE_URL}/public/${id}`);
    return response.data;
  },
  
  create: async (data: CreateTeamRequest): Promise<TeamCreateResponse> => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateTeamRequest): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/${id}`, data);
  },
  
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }
};
