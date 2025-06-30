import type {
    CreateReservationRequest,
    PlaygroundReservation,
    PayReservationRequest,
    ReservationFilters,
    ReservationsResponse,
    UpdateReservationStatusRequest
} from '../types/playgrounds';
import axiosInstance from './axios';

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
        console.error('Playground Reservations API Error:', error);
        return Promise.reject(error);
    }
);

export const playgroundReservationApi = {
    // PUT /playground-reservation/{reservationId}/status
    updateReservationStatus: async (reservationId: number, statusRequest: UpdateReservationStatusRequest['statusRequest']): Promise<void> => {
        const response = await axiosInstance.put(
            `/playground-reservation/${reservationId}/status`,
            null,
            {
                params: { statusRequest }
            }
        );
        return response.data;
    },

    // POST /playground-reservation
    createReservation: async (data: CreateReservationRequest): Promise<{ id: number }> => {
        const response = await axiosInstance.post('/playground-reservation', data);
        return response.data;
    },

    // DELETE /playground-reservation
    deleteReservation: async (reservationId: number): Promise<void> => {
        const response = await axiosInstance.delete(`/playground-reservation?reservationId=${reservationId}`);
        return response.data;
    },

    // POST /playground-reservation/pay
    payForReservation: async (data: PayReservationRequest): Promise<void> => {
        const response = await axiosInstance.post('/playground-reservation/pay', data);
        return response.data;
    },

    // GET /playground-reservation/{reservationId}
    getReservationById: async (reservationId: number): Promise<PlaygroundReservation> => {
        const response = await axiosInstance.get(`/playground-reservation/${reservationId}`);
        return response.data;
    },

    // GET /playground-reservation/public
    getReservations: async (filters?: ReservationFilters): Promise<ReservationsResponse> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        const response = await axiosInstance.get(`/playground-reservation/public?${params}`);
        return response.data;
    }
};
