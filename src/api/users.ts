import type {
    CreateUserRequest,
    UpdateUserRequest,
    User,
    UserCreateResponse,
    UserFilterParams,
    UserRole,
    UsersPageResponse
} from '../types/users';
import axiosInstance from './axios';

export const usersApi = {
    // Get all users with pagination and filtering
    getAll: async (
        page: number = 0,
        size: number = 10,
        filters?: UserFilterParams
    ): Promise<UsersPageResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });

        if (filters) {
            if (filters.firstName) params.append('firstName', filters.firstName);
            if (filters.lastName) params.append('lastName', filters.lastName);
            if (filters.phone) params.append('phone', filters.phone);
            if (filters.roleIds && filters.roleIds.length > 0) {
                filters.roleIds.forEach(roleId => params.append('roleIds', roleId.toString()));
            }
            if (filters.sortField) params.append('sortField', filters.sortField);
            if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
        }

        const response = await axiosInstance.get(`/admin/users?${params}`);
        return response.data;
    },

    // Get user by ID
    getById: async (id: number): Promise<User> => {
        const response = await axiosInstance.get(`/admin/users/${id}`);
        return response.data;
    },

    // Create new user
    create: async (data: CreateUserRequest): Promise<UserCreateResponse> => {
        const response = await axiosInstance.post('/admin/users', data);
        return response.data;
    },

    // Update user
    update: async (id: number, data: UpdateUserRequest): Promise<User> => {
        const response = await axiosInstance.put(`/admin/users/${id}`, data);
        return response.data;
    },

    // Update user roles
    updateRoles: async (userId: number, roleIds: number[]): Promise<User> => {
        const response = await axiosInstance.put(`/admin/users/${userId}/roles`, roleIds);
        return response.data;
    },

    // Delete user
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/admin/users/${id}`);
    },

    // Get all available roles
    getRoles: async (): Promise<UserRole[]> => {
        const response = await axiosInstance.get('/admin/users/roles');
        return response.data;
    }
};
