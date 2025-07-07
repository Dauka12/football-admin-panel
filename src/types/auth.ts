import type { UserRole } from './users';

// Login
export interface LoginRequest {
    phone: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    firstname: string;
    lastname: string;
    phone: string;
    role: string | string[]; // Поддерживаем как строку, так и массив строк
    roles?: UserRole[]; // Добавляем поддержку массива ролей
    profilePictureUrl?: string; // Добавляем новое поле из ответа
}

// Registration
export interface RegisterRequest {
    firstname: string;
    lastname: string;
    phone: string;
    password: string;
}

export interface RegisterResponse {
    // Empty response as per specification
}

export interface AuthError {
    message: string;
    field?: string;
}
