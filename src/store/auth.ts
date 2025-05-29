import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
import type { LoginResponse } from '../types/auth';

interface AuthState {
    user: LoginResponse | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (phone: string, password: string) => Promise<void>;
    register: (firstname: string, lastname: string, phone: string, password: string) => Promise<void>;
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

                    // After successful login, redirect user to the dashboard
                    window.location.href = '/dashboard';
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Failed to login',
                        isLoading: false
                    });
                }
            },

            register: async (firstname, lastname, phone, password) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.register({ firstname, lastname, phone, password });
                    set({ isLoading: false });
                    // After successful registration, you might want to automatically log the user in
                    // or redirect them to the login page
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Failed to register',
                        isLoading: false
                    });
                }
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({ user: null, isAuthenticated: false });
                window.location.href = '/auth';
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
