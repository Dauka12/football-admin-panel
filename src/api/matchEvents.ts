import axiosInstance from './axios';
import type { 
  MatchEvent, 
  CreateMatchEventRequest
} from '../types/matchEvents';

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data === null || response.data === undefined) {
            response.data = [];
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
        }
        console.error('Match Events API Error:', error);
        return Promise.reject(error);
    }
);

// Custom error handling for match events operations
const handleMatchEventsApiError = (error: any): never => {
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        switch (status) {
            case 400:
                throw new Error(`Invalid request data: ${message}`);
            case 403:
                throw new Error('Not authorized to create events');
            case 404:
                throw new Error('Event not found');
            default:
                throw new Error(`Match event operation failed: ${message}`);
        }
    }
    throw new Error(error.message || 'Match event operation failed');
};

export const matchEventsApi = {
  // POST /match-events - Create a new match event
  createMatchEvent: async (data: CreateMatchEventRequest): Promise<MatchEvent | null> => {
    try {
      const response = await axiosInstance.post<MatchEvent>('/match-events', data);
      return response.data;
    } catch (error) {
      return handleMatchEventsApiError(error);
    }
  },

  // GET /match-events/public/{id} - Get a specific match event by ID
  getMatchEventById: async (id: number): Promise<MatchEvent | null> => {
    try {
      const response = await axiosInstance.get<MatchEvent>(`/match-events/public/${id}`);
      return response.data;
    } catch (error) {
      return handleMatchEventsApiError(error);
    }
  },

  // GET /match-events/public/match/{matchId} - Get all events for a specific match
  getMatchEventsByMatchId: async (matchId: number): Promise<MatchEvent[]> => {
    try {
      const response = await axiosInstance.get<{ events: MatchEvent[] }>(`/match-events/public/match/${matchId}`);
      return response.data.events;
    } catch (error) {
      return handleMatchEventsApiError(error);
    }
  }
};
