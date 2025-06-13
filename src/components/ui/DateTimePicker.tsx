import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DateTimePickerProps {
    value: string | number;
    onChange: (value: string) => void;
    label: string;
    error?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    value,
    onChange,
    label,
    error,
    required = false,
    placeholder,
    className = ''
}) => {    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);
    // Track viewport width for responsive adjustments
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    // Detect iOS for special handling
    const [isIOS, setIsIOS] = useState(false);
    
    // Update mobile state on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        
        // Detect iOS device
        const detectIOS = () => {
            return [
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod'
            ].includes(navigator.platform) || 
            (navigator.userAgent.includes("Mac") && "ontouchend" in document);
        };
        
        setIsIOS(detectIOS());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);    // Format the value for display
    const formatForDisplay = (dateTimeValue: string | number) => {
        if (!dateTimeValue) return '';
        try {
            let date: Date;
            
            // Handle different input types
            if (typeof dateTimeValue === 'number') {
                // Check if timestamp is in seconds (10 digits) or milliseconds (13 digits)
                if (dateTimeValue.toString().length === 10) {
                    date = new Date(dateTimeValue * 1000);
                } else {
                    date = new Date(dateTimeValue);
                }
            } else if (typeof dateTimeValue === 'string') {
                // Try to parse as a timestamp (number stored as string)
                const maybeTimestamp = parseInt(dateTimeValue, 10);
                if (!isNaN(maybeTimestamp)) {
                    if (maybeTimestamp.toString().length === 10) {
                        date = new Date(maybeTimestamp * 1000);
                    } else if (maybeTimestamp > 1000000000000) {
                        date = new Date(maybeTimestamp);
                    } else {
                        date = new Date(dateTimeValue);
                    }
                } else {
                    date = new Date(dateTimeValue);
                }
            } else {
                return '';
            }
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date in DateTimePicker:', dateTimeValue);
                return '';
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formatting date for display:', error);
            return typeof dateTimeValue === 'string' ? dateTimeValue : '';
        }
    };
      return (
        <div className="relative mb-4 sm:mb-6">
            {/* Label */}
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>            {/* Input Container */}
            <div className={`
        relative rounded-lg border transition-all duration-200
        ${isFocused
                    ? 'border-gold ring-2 ring-gold/20 shadow-lg shadow-gold/10'
                    : error
                        ? 'border-red-400'
                        : 'border-gray-600 hover:border-gray-500'
                }
        ${error ? 'bg-red-50/5' : 'bg-gray-800/50'}
        ${className}
      `}>
                {/* Calendar Icon */}
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${isFocused ? 'text-gold' : 'text-gray-400'
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                {/* Input Field */}
                <input
                    type="datetime-local"
                    value={formatForDisplay(value)}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}                    className={`
            w-full pl-8 sm:pl-11 pr-2 sm:pr-4 py-2 sm:py-3 bg-transparent text-white placeholder-gray-400
            focus:outline-none transition-all duration-200 text-sm sm:text-base
            ${error ? 'text-red-300' : 'text-white'}
            ${isIOS ? 'ios-date-input' : ''}
          `}
                    style={{
                        colorScheme: 'dark',
                        ...(isMobileView && { fontSize: '16px' }), // Prevent auto-zoom on iOS
                        ...(isIOS && { minHeight: '44px', paddingRight: '1rem' }) // Better touch target on iOS
                    }}
                />                {/* Focus Ring Effect */}
                {isFocused && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold/5 to-transparent pointer-events-none" />
                )}
                  {/* Mobile touch-friendly overlay to improve usability */}
                {isMobileView && (
                    <div 
                        className={`absolute inset-0 z-10 ${isIOS ? 'ios-date-overlay' : ''}`}
                        onClick={() => {
                            // This overlay helps with mobile touch interactions
                            const inputElement = document.activeElement as HTMLElement;
                            if (inputElement && inputElement.tagName !== 'INPUT') {
                                const inputField = inputElement.querySelector('input[type="datetime-local"]') as HTMLElement;
                                if (inputField) {
                                    inputField.focus();
                                    // Add a small delay for iOS
                                    if (isIOS) {
                                        setTimeout(() => {
                                            inputField.click();
                                        }, 100);
                                    }
                                }
                            }
                        }} 
                    />
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-2 flex items-center text-red-400 text-sm">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs sm:text-sm">{error}</span>
                </div>
            )}            {/* Helper Text */}
            {!error && (
                <div className="mt-1 text-xs text-gray-500">
                    {isMobileView ? 
                        isIOS ? 
                            t('common.tapToOpenPicker') || 'Tap to open date picker' : 
                            t('common.tapToSelect') || 'Tap to select' 
                        : t('common.selectDateTime')
                    }
                </div>
            )}
        </div>
    );
};

export default React.memo(DateTimePicker);
