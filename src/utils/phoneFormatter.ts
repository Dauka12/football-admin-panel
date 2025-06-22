/**
 * Formats phone number for display (+7 (777) 777 77 77)
 * @param value - Raw phone number input
 * @returns Formatted phone number string
 */
export const formatPhoneDisplay = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 7 or 8, replace with 7
    let normalizedDigits = digits;
    if (digits.startsWith('8')) {
        normalizedDigits = '7' + digits.slice(1);
    }
    
    // Format based on length
    if (normalizedDigits.length === 0) {
        return '';
    }
    
    if (normalizedDigits.length === 1) {
        return '+7';
    }
    
    if (normalizedDigits.length <= 4) {
        return `+7 (${normalizedDigits.slice(1)}`;
    }
    
    if (normalizedDigits.length <= 7) {
        return `+7 (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4)}`;
    }
    
    if (normalizedDigits.length <= 9) {
        return `+7 (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)} ${normalizedDigits.slice(7)}`;
    }
    
    // Full format: +7 (777) 777 77 77
    return `+7 (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)} ${normalizedDigits.slice(7, 9)} ${normalizedDigits.slice(9, 11)}`;
};

/**
 * Extracts clean phone number for backend (+77777777777)
 * @param formattedValue - Formatted phone number
 * @returns Clean phone number string
 */
export const extractPhoneNumber = (formattedValue: string): string => {
    // Remove all non-digits
    const digits = formattedValue.replace(/\D/g, '');
    
    // Ensure it starts with 7
    if (digits.startsWith('8')) {
        return '+7' + digits.slice(1);
    }
    
    if (digits.startsWith('7')) {
        return '+' + digits;
    }
    
    // If no country code, assume Kazakhstan (+7)
    if (digits.length === 10) {
        return '+7' + digits;
    }
    
    return digits.startsWith('+') ? digits : '+' + digits;
};

/**
 * Validates if phone number is complete
 * @param value - Phone number value
 * @returns Boolean indicating if phone is valid
 */
export const isPhoneComplete = (value: string): boolean => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('7');
};
