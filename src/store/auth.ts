import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
import type { LoginResponse } from '../types/auth';

interface AuthState {
    user: LoginResponse | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (phone: string, password: string) => Promise<boolean>;
    register: (firstname: string, lastname: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,

            login: async (phone, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login({ phone, password });
                    set({
                        user: response,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    localStorage.setItem('auth_token', response.token);

                    // Return success status instead of redirecting here
                    return true;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Failed to login',
                        isLoading: false
                    });
                    return false;
                }
            },

            register: async (firstname, lastname, phone, password) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.register({ firstname, lastname, phone, password });
                    set({ isLoading: false });
                    return true;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Failed to register',
                        isLoading: false
                    });
                    return false;
                }
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({ user: null, isAuthenticated: false });
                // Note: Navigation should be handled by React Router in the component
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
