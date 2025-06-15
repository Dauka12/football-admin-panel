// User Role interface
export interface UserRole {
    id: number;
    name: string;
}

// User interface
export interface User {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
    roles: UserRole[];
}

// Request interfaces
export interface CreateUserRequest {
    firstname: string;
    lastname: string;
    phone: string;
    password: string;
    roleIds: number[];
}

export interface UpdateUserRequest {
    firstname: string;
    lastname: string;
    phone: string;
    password: string;
    roleIds: number[];
}

export interface UpdateUserRolesRequest {
    roleIds: number[];
}

// Filter parameters
export interface UserFilterParams {
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleIds?: number[];
    sortField?: string;
    sortDirection?: string;
    page?: number;
    size?: number;
}

// Paginated response for users
export interface UsersPageResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: User[];
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    pageable: {
        offset: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        paged: boolean;
        pageNumber: number;
        pageSize: number;
        unpaged: boolean;
    };
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Response for create/update operations
export interface UserCreateResponse {
    id: number;
}

// Compatibility namespaces
export namespace UserRequest {
    export type Create = CreateUserRequest;
    export type Update = UpdateUserRequest;
    export type UpdateRoles = UpdateUserRolesRequest;
}

export namespace UserResponse {
    export type Base = User;
    export type Page = UsersPageResponse;
    export type Create = UserCreateResponse;
}
