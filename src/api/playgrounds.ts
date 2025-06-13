import type {
    CreatePlaygroundRequest,
    CreateReservationRequest,
    CreateResponse,
    Playground,
    PlaygroundFilters,
    PlaygroundsResponse,
    ReservationFilters,
    ReservationsResponse,
    UpdatePlaygroundRequest
} from '../types/playgrounds';
import axios from './axios';

export const playgroundApi = {
    // Playground CRUD operations
    createPlayground: (data: CreatePlaygroundRequest): Promise<CreateResponse> =>
        axios.post('/playgrounds/admin', data).then(res => res.data),

    updatePlayground: (id: number, data: UpdatePlaygroundRequest): Promise<CreateResponse> =>
        axios.patch(`/playgrounds/admin/${id}`, data).then(res => res.data),

    deletePlayground: (id: number): Promise<void> =>
        axios.delete(`/playgrounds/admin/${id}`).then(res => res.data),

    getPlaygrounds: (filters?: PlaygroundFilters): Promise<PlaygroundsResponse> =>
        axios.get('/playgrounds/public', { params: filters }).then(res => res.data),

    getPlayground: (id: number): Promise<Playground> =>
        axios.get(`/playgrounds/public/${id}`).then(res => res.data),

    // Reservation operations
    createReservation: (data: CreateReservationRequest): Promise<CreateResponse> =>
        axios.post('/playground-reservation', data).then(res => res.data),

    deleteReservation: (reservationId: number): Promise<void> =>
        axios.delete('/playground-reservation', { params: { reservationId } }).then(res => res.data),

    getReservations: (filters?: ReservationFilters): Promise<ReservationsResponse> =>
        axios.get('/playground-reservation/public', { params: filters }).then(res => res.data),
};
