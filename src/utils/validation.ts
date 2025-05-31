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
        club: [
            validationRules.required('Club is required')
        ],
        nationality: [
            validationRules.required('Nationality is required')
        ],
        birthplace: [
            validationRules.required('Birthplace is required')
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
        ],
        identificationNumber: [
            validationRules.required('Identification number is required')
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
        players: [
            validationRules.arrayMinLength(1, 'At least one player is required'),
            validationRules.arrayMaxLength(30, 'Maximum 30 players allowed')
        ]
    })
};

interface TournamentFormData {
    name: string;
    startDate: string;
    endDate: string;
    teams: any[];
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
