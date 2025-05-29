export interface ApiResponse<T = any> {
    data: T;
    status: number;
    success: boolean;
    message?: string;
}

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}
