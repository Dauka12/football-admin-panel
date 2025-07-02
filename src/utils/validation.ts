import React from 'react';

// Validation rule types
type ValidationRule<T> = (value: T, data?: any) => string | null;
type ValidationRules<T> = {
    [K in keyof T]?: ValidationRule<T[K]>[];
};

// Validation result
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}


// Core validation functions
export const validationRules = {
    required: <T>(message?: string): ValidationRule<T> => 
        (value) => {
            const isEmpty = value === null || value === undefined || 
                          (typeof value === 'string' && value.trim() === '') ||
                          (Array.isArray(value) && value.length === 0);
            return isEmpty ? (message || 'This field is required') : null;
        },

    minLength: (min: number, message?: string): ValidationRule<string> => 
        (value) => (!value || value.length < min) ? 
            (message || `Minimum length is ${min} characters`) : null,

    maxLength: (max: number, message?: string): ValidationRule<string> => 
        (value) => (value && value.length > max) ? 
            (message || `Maximum length is ${max} characters`) : null,

    email: (message?: string): ValidationRule<string> => 
        (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return value && !emailRegex.test(value) ? 
                (message || 'Invalid email format') : null;
        },

    phone: (message?: string): ValidationRule<string> => 
        (value) => {
            const phoneRegex = /^\+\d{10,15}$/;
            return value && !phoneRegex.test(value) ? 
                (message || 'Phone must start with + and contain 10-15 digits') : null;
        },

    min: (min: number, message?: string): ValidationRule<number> => 
        (value) => (value !== null && value !== undefined && value < min) ? 
            (message || `Minimum value is ${min}`) : null,

    max: (max: number, message?: string): ValidationRule<number> => 
        (value) => (value !== null && value !== undefined && value > max) ? 
            (message || `Maximum value is ${max}`) : null,

    pattern: (regex: RegExp, message?: string): ValidationRule<string> => 
        (value) => value && !regex.test(value) ? 
            (message || 'Invalid format') : null,

    custom: <T>(validator: (value: T, data?: any) => boolean, message: string): ValidationRule<T> => 
        (value, data) => !validator(value, data) ? message : null,

    arrayMinLength: (min: number, message?: string): ValidationRule<any[]> => 
        (value) => (!value || value.length < min) ? 
            (message || `Minimum ${min} items required`) : null,

    arrayMaxLength: (max: number, message?: string): ValidationRule<any[]> => 
        (value) => (value && value.length > max) ? 
            (message || `Maximum ${max} items allowed`) : null,

    dateAfter: (afterDate: Date | string, message?: string): ValidationRule<string> => 
        (value) => {
            if (!value) return null;
            const compareDate = typeof afterDate === 'string' ? new Date(afterDate) : afterDate;
            const valueDate = new Date(value);
            return valueDate <= compareDate ? 
                (message || `Date must be after ${compareDate.toLocaleDateString()}`) : null;
        },

    dateBefore: (beforeDate: Date | string, message?: string): ValidationRule<string> => 
        (value) => {
            if (!value) return null;
            const compareDate = typeof beforeDate === 'string' ? new Date(beforeDate) : beforeDate;
            const valueDate = new Date(value);
            return valueDate >= compareDate ? 
                (message || `Date must be before ${compareDate.toLocaleDateString()}`) : null;
        }
};

// Validator class for complex validations
export class Validator<T extends Record<string, any>> {
    private rules: ValidationRules<T> = {};

    constructor(rules: ValidationRules<T>) {
        this.rules = rules;
    }

    // Public getter for field names
    get fieldNames(): (keyof T)[] {
        return Object.keys(this.rules) as (keyof T)[];
    }

    // Check if a field has validation rules
    hasFieldValidation(field: keyof T): boolean {
        return field in this.rules;
    }

    validate(data: T): ValidationResult {
        const errors: Record<string, string> = {};

        for (const [field, fieldRules] of Object.entries(this.rules)) {
            const value = data[field];
            
            if (fieldRules && Array.isArray(fieldRules)) {
                for (const rule of fieldRules) {
                    const error = rule(value, data);
                    if (error) {
                        errors[field] = error;
                        break; // Stop at first error for this field
                    }
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    validateField(field: keyof T, value: T[keyof T], data?: T): string | null {
        const fieldRules = this.rules[field];
        if (!fieldRules) return null;

        for (const rule of fieldRules) {
            const error = rule(value, data);
            if (error) return error;
        }

        return null;
    }
}

// Pre-built validators for common use cases
export const authValidators = {
    login: new Validator({
        phone: [
            validationRules.required('Phone number is required'),
            validationRules.phone('Phone must start with + and contain 10-15 digits')
        ],
        password: [
            validationRules.required('Password is required'),
            validationRules.minLength(6, 'Password must be at least 6 characters')
        ]
    }),

    register: new Validator({
        firstname: [
            validationRules.required('First name is required'),
            validationRules.minLength(2, 'First name must be at least 2 characters')
        ],
        lastname: [
            validationRules.required('Last name is required'),
            validationRules.minLength(2, 'Last name must be at least 2 characters')
        ],
        phone: [
            validationRules.required('Phone number is required'),
            validationRules.phone('Phone must start with + and contain 10-15 digits')
        ],
        password: [
            validationRules.required('Password is required'),
            validationRules.minLength(6, 'Password must be at least 6 characters')
        ]
    })
};

export const playerValidators = {
    create: new Validator({
        position: [
            validationRules.required('Position is required')
        ],
        teamId: [
            validationRules.required('Team is required')
        ],
        sportTypeId: [
            validationRules.required('Sport type is required')
        ],
        nationality: [
            validationRules.required('Nationality is required')
        ],
        birthplace: [
            validationRules.required('Birthplace is required')
        ],
        identificationNumber: [
            validationRules.required('Identification number is required'),
            validationRules.minLength(5, 'Identification number must be at least 5 characters')
        ],
        userId: [
            validationRules.required('User ID is required'),
            validationRules.min(1, 'User ID must be a positive number')
        ],
        age: [
            validationRules.required('Age is required'),
            validationRules.min(16, 'Age must be at least 16'),
            validationRules.max(50, 'Age must be less than 50')
        ],
        height: [
            validationRules.required('Height is required'),
            validationRules.min(150, 'Height must be at least 150cm'),
            validationRules.max(220, 'Height must be less than 220cm')
        ],
        weight: [
            validationRules.required('Weight is required'),
            validationRules.min(50, 'Weight must be at least 50kg'),
            validationRules.max(150, 'Weight must be less than 150kg')
        ]
    })
};

export const teamValidators = {
    create: new Validator({
        name: [
            validationRules.required('Team name is required'),
            validationRules.minLength(2, 'Team name must be at least 2 characters')
        ],
        description: [
            validationRules.required('Description is required'),
            validationRules.minLength(10, 'Description must be at least 10 characters')
        ],
        primaryColor: [
            validationRules.required('Primary color is required')
        ],
        secondaryColor: [
            validationRules.required('Secondary color is required')
        ],
        cityId: [
            validationRules.required('City is required')
        ],
        sportTypeId: [
            validationRules.required('Sport type is required')
        ],
        players: [
            // Players are optional - teams can be created without players and populated later
            validationRules.arrayMaxLength(30, 'Maximum 30 players allowed')
        ]
    }),
    edit: new Validator({
        name: [
            validationRules.required('Team name is required'),
            validationRules.minLength(2, 'Team name must be at least 2 characters')
        ],
        description: [
            validationRules.required('Description is required'),
            validationRules.minLength(10, 'Description must be at least 10 characters')
        ],
        primaryColor: [
            validationRules.required('Primary color is required')
        ],
        secondaryColor: [
            validationRules.required('Secondary color is required')
        ],
        cityId: [
            validationRules.required('City is required')
        ],
        sportTypeId: [
            validationRules.required('Sport type is required')
        ],
        players: [
            // Players are optional for edit as well
            validationRules.arrayMaxLength(30, 'Maximum 30 players allowed')
        ]
    })
};

// City validators
interface CityFormData {
    name: string;
    country: string;
    region: string;
    population: number;
    latitude: number;
    longitude: number;
    description: string;
    postalCode: string;
    active: boolean;
}

export const cityValidators = {
    create: new Validator<CityFormData>({
        name: [
            validationRules.required('City name is required'),
            validationRules.minLength(2, 'City name must be at least 2 characters'),
            validationRules.maxLength(100, 'City name must be less than 100 characters')
        ],
        country: [
            validationRules.required('Country is required'),
            validationRules.minLength(2, 'Country must be at least 2 characters'),
            validationRules.maxLength(100, 'Country must be less than 100 characters')
        ],
        region: [
            validationRules.required('Region is required'),
            validationRules.minLength(2, 'Region must be at least 2 characters'),
            validationRules.maxLength(100, 'Region must be less than 100 characters')
        ],
        population: [
            validationRules.required('Population is required'),
            validationRules.min(0, 'Population must be a positive number')
        ],
        latitude: [
            validationRules.required('Latitude is required'),
            validationRules.min(-90, 'Latitude must be between -90 and 90'),
            validationRules.max(90, 'Latitude must be between -90 and 90')
        ],
        longitude: [
            validationRules.required('Longitude is required'),
            validationRules.min(-180, 'Longitude must be between -180 and 180'),
            validationRules.max(180, 'Longitude must be between -180 and 180')
        ],
        description: [
            validationRules.maxLength(500, 'Description must be less than 500 characters')
        ],
        postalCode: [
            validationRules.required('Postal code is required'),
            validationRules.maxLength(20, 'Postal code must be less than 20 characters')
        ]
    })
};

interface TournamentFormData {
    name: string;
    startDate: string;
    endDate: string;
    teams: number[];
    cityId: number;
    sportTypeId: number;
    categoryId: number;
}

export const tournamentValidators = {
    create: new Validator<TournamentFormData>({
        name: [
            validationRules.required('Tournament name is required'),
            validationRules.minLength(3, 'Tournament name must be at least 3 characters')
        ],
        startDate: [
            validationRules.required('Start date is required'),
            validationRules.dateAfter(new Date(), 'Start date must be in the future')
        ],
        endDate: [
            validationRules.required('End date is required'),
            validationRules.custom((value: string, data?: any) => {
                if (!value || !data?.startDate) return true;
                return new Date(value) > new Date(data.startDate);
            }, 'End date must be after start date')
        ],
        teams: [
            validationRules.arrayMinLength(2, 'At least 2 teams are required'),
            validationRules.arrayMaxLength(32, 'Maximum 32 teams allowed')
        ],
        cityId: [
            validationRules.required('City is required'),
            validationRules.min(1, 'Please select a valid city')
        ],
        sportTypeId: [
            validationRules.required('Sport type is required'),
            validationRules.min(1, 'Please select a valid sport type')
        ],
        categoryId: [
            validationRules.required('Tournament category is required'),
            validationRules.min(1, 'Please select a valid tournament category')
        ]
    }),
    update: new Validator<TournamentFormData>({
        name: [
            validationRules.required('Tournament name is required'),
            validationRules.minLength(3, 'Tournament name must be at least 3 characters')
        ],
        startDate: [
            validationRules.required('Start date is required')
            // Removed future date requirement for updates
        ],
        endDate: [
            validationRules.required('End date is required'),
            validationRules.custom((value: string, data?: any) => {
                if (!value || !data?.startDate) return true;
                return new Date(value) > new Date(data.startDate);
            }, 'End date must be after start date')
        ],
        teams: [
            validationRules.arrayMinLength(2, 'At least 2 teams are required'),
            validationRules.arrayMaxLength(32, 'Maximum 32 teams allowed')
        ],
        cityId: [
            validationRules.required('City is required'),
            validationRules.min(1, 'Please select a valid city')
        ],
        sportTypeId: [
            validationRules.required('Sport type is required'),
            validationRules.min(1, 'Please select a valid sport type')
        ],
        categoryId: [
            validationRules.required('Tournament category is required'),
            validationRules.min(1, 'Please select a valid tournament category')
        ]
    })
};

// Tournament Category validators
export const tournamentCategoryValidators = {
    create: new Validator({
        name: [
            validationRules.required('Category name is required'),
            validationRules.minLength(2, 'Category name must be at least 2 characters'),
            validationRules.maxLength(100, 'Category name must not exceed 100 characters')
        ],
        description: [
            validationRules.required('Description is required'),
            validationRules.minLength(5, 'Description must be at least 5 characters'),
            validationRules.maxLength(500, 'Description must not exceed 500 characters')
        ]
    }),
    
    update: new Validator({
        name: [
            validationRules.required('Category name is required'),
            validationRules.minLength(2, 'Category name must be at least 2 characters'),
            validationRules.maxLength(100, 'Category name must not exceed 100 characters')
        ],
        description: [
            validationRules.required('Description is required'),
            validationRules.minLength(5, 'Description must be at least 5 characters'),
            validationRules.maxLength(500, 'Description must not exceed 500 characters')
        ]
    })
};

// Achievement validators
export const achievementValidators = {
    create: new Validator({
        playerId: [validationRules.required('Player is required')],
        title: [
            validationRules.required('Title is required'),
            validationRules.minLength(2, 'Title must be at least 2 characters long'),
            validationRules.maxLength(200, 'Title must be less than 200 characters')
        ],
        description: [
            validationRules.required('Description is required'),
            validationRules.minLength(10, 'Description must be at least 10 characters long'),
            validationRules.maxLength(1000, 'Description must be less than 1000 characters')
        ],
        achievementDate: [validationRules.required('Achievement date is required')],
        category: [validationRules.required('Category is required')],
        points: [validationRules.min(0, 'Points must be positive')],
        featured: []
    }),
    
    update: new Validator({
        title: [
            validationRules.required('Title is required'),
            validationRules.minLength(2, 'Title must be at least 2 characters long'),
            validationRules.maxLength(200, 'Title must be less than 200 characters')
        ],
        description: [
            validationRules.required('Description is required'),
            validationRules.minLength(10, 'Description must be at least 10 characters long'),
            validationRules.maxLength(1000, 'Description must be less than 1000 characters')
        ],
        achievementDate: [validationRules.required('Achievement date is required')],
        category: [validationRules.required('Category is required')],
        points: [validationRules.min(0, 'Points must be positive')],
        featured: []
    })
};

// User validators
interface UserFormData {
    firstname: string;
    lastname: string;
    phone: string;
    password: string;
    roleIds: number[];
}

export const userValidators = {
    create: new Validator<UserFormData>({
        firstname: [
            validationRules.required('First name is required'),
            validationRules.minLength(2, 'First name must be at least 2 characters'),
            validationRules.maxLength(50, 'First name must not exceed 50 characters')
        ],
        lastname: [
            validationRules.required('Last name is required'),
            validationRules.minLength(2, 'Last name must be at least 2 characters'),
            validationRules.maxLength(50, 'Last name must not exceed 50 characters')
        ],
        phone: [
            validationRules.required('Phone number is required'),
            validationRules.phone('Phone must start with + and contain 10-15 digits')
        ],
        password: [
            validationRules.required('Password is required'),
            validationRules.minLength(6, 'Password must be at least 6 characters long'),
            validationRules.maxLength(100, 'Password must not exceed 100 characters')
        ],
        roleIds: [
            validationRules.arrayMinLength(1, 'At least one role must be selected')
        ]
    }),
    
    update: new Validator<UserFormData>({
        firstname: [
            validationRules.required('First name is required'),
            validationRules.minLength(2, 'First name must be at least 2 characters'),
            validationRules.maxLength(50, 'First name must not exceed 50 characters')
        ],
        lastname: [
            validationRules.required('Last name is required'),
            validationRules.minLength(2, 'Last name must be at least 2 characters'),
            validationRules.maxLength(50, 'Last name must not exceed 50 characters')
        ],
        phone: [
            validationRules.required('Phone number is required'),
            validationRules.phone('Phone must start with + and contain 10-15 digits')
        ],
        // Password is optional for updates - only validate if provided
        password: [
            validationRules.custom((value: string) => {
                if (!value || value.trim() === '') return true; // Allow empty password for updates
                return value.length >= 6;
            }, 'Password must be at least 6 characters long'),
            validationRules.maxLength(100, 'Password must not exceed 100 characters')
        ],
        roleIds: [
            validationRules.arrayMinLength(1, 'At least one role must be selected')
        ]
    }),
    
    roles: new Validator<{ roleIds: number[] }>({
        roleIds: [
            validationRules.arrayMinLength(1, 'At least one role must be selected'),
            validationRules.arrayMaxLength(10, 'Maximum 10 roles allowed')
        ]
    })
};

// Utility hook for form validation
export const useFormValidation = <T extends Record<string, any>>(
    validator: Validator<T>
) => {
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validateForm = (data: T): boolean => {
        const result = validator.validate(data);
        setErrors(result.errors);
        return result.isValid;
    };

    const validateField = (field: keyof T, value: T[keyof T], data?: T): void => {
        const error = validator.validateField(field, value, data);
        setErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));
    };

    const clearErrors = (): void => {
        setErrors({});
    };

    const clearFieldError = (field: keyof T): void => {
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    return {
        errors,
        validateForm,
        validateField,
        clearErrors,
        clearFieldError
    };
};

// Legacy validation functions for backward compatibility
export const validatePhone = (phone: string): string | null => {
    // Basic phone validation - starts with + and has 10-15 digits
    const phoneRegex = /^\+[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
        return "Phone must start with '+' followed by 10-15 digits";
    }
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
        return "Password must be at least 6 characters long";
    }
    return null;
};

export const validateName = (name: string): string | null => {
    if (name.length < 2) {
        return "Name must be at least 2 characters long";
    }
    return null;
};
