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
