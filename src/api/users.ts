import type {
    CreateUserRequest,
    UpdateUserRequest,
    User,
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
        try {
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
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    },

    // Get user by ID
    getById: async (id: number): Promise<User> => {
        try {
            const response = await axiosInstance.get(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    },

    // Create new user
    create: async (data: CreateUserRequest): Promise<User> => {
        try {
            const response = await axiosInstance.post('/admin/users', data);
            return response.data;
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    },

    // Update user
    update: async (id: number, data: UpdateUserRequest): Promise<User> => {
        try {
            const response = await axiosInstance.put(`/admin/users/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    },

    // Update user roles
    updateRoles: async (userId: number, roleIds: number[]): Promise<User> => {
        try {
            const response = await axiosInstance.put(`/admin/users/${userId}/roles`, roleIds);
            return response.data;
        } catch (error) {
            console.error('Failed to update user roles:', error);
            throw error;
        }
    },

    // Delete user
    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/admin/users/${id}`);
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    },

    // Get all available roles
    getRoles: async (): Promise<UserRole[]> => {
        try {
            const response = await axiosInstance.get('/admin/users/roles');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            throw error;
        }
    }
};
