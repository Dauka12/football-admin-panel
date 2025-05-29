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
    role: string;
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
